// Frank Poth 12/24/2017

/* 이 예제에는 많은 내용이 들어 있습니다. 스크롤 타일 기반 배경이 있습니다.
스크롤 할 때 가장 오른쪽 열이 임의로 생성됩니다. 애니메이션이 있습니다.
모든 움직이는 물체와 세계 및 충돌 감지 기능이 있습니다
플레이어와 유성과 타르 핏. 화면을 돌리는 효과가 있습니다
유성이 이미지 데이터를 사용하여 생성되면 빨간색입니다. 사용하지 않도록 객체 풀링을 구현합니다.
"new"를 사용하여 새 개체를 만듭니다. 이전 튜토리얼에서 다룬 내용과 다루지 않은 것들이 섞여있습니다. */
var bgm = new Audio("makiba.mp3");
bgm.volume = 0.6;
bgm.loop = true;
bgm.play();

(function() {
  "use strict";

  const TILE_SIZE = 16;
  const WORLD_HEIGHT = 144;
  const WORLD_WIDTH = 256;
  var jumpSound = new Audio("jump.mp3");
  var hitSound = new Audio("hit.mp3");

  //// CLASSES ////

  var Animation = function(frame_set, delay) {
    this.count = 0; // 마지막 프레임 변경 이후의 게임사이클 수를 계산합니다.
    this.delay = delay; // 다음 프레임이 변경될 때까지 대기 할 게임사이클 수입니다.
    this.frame_value = frame_set[0]; // 화면에 표시할 스프라이트 이미지/타일의 스프라이트 시트 값입니다.
    this.frame_index = 0; // 현재 애니메이션 프레임 세트의 프레임 인덱스입니다.
    this.frame_set = frame_set; // 스프라이트 타일 값을 보유하는 현재 애니메이션 프레임 세트입니다.
  };

  Animation.prototype = {
    /* 현재 애니메이션 프레임 세트가 변경됩니다.
    예를 들어 현재 세트가 [0, 1]이고 새 세트가 [2, 3]이면 세트를 [2, 3]으로 변경합니다. 또한 지연을 설정합니다. */
    change: function(frame_set, delay = 15) {
      if (this.frame_set != frame_set) {
        // If the frame set is different: (프레임 세트가 다른 경우 :)

        this.count = 0; //  (카운트 재시작)
        this.delay = delay; //  (딜레이 설정)
        this.frame_index = 0; // (새 프레임 세트의 첫 번째 프레임에서 시작)
        this.frame_set = frame_set; // (새 프레임 세트 설정)
        this.frame_value = this.frame_set[this.frame_index]; //(새 프레임 값을 설정)
      }
    },

    /* 매 게임사이클마다 이것을 호출합니다. */
    update: function() {
      this.count++; // (마지막 프레임 변경 이후 몇 사이클이 지났는지 추적)

      if (this.count >= this.delay) {
        // (사이클이 충분하게 지났다면 프레임을 변경합니다)

        this.count = 0; //  (카운트를 리셋)
        /* 프레임 인덱스가 프레임 세트의 마지막 값이면 0으로 재설정하십시오.
        프레임 인덱스가 마지막 값이 아닌 경우 1을 추가하십시오.*/
        this.frame_index =
          this.frame_index == this.frame_set.length - 1
            ? 0
            : this.frame_index + 1;
        this.frame_value = this.frame_set[this.frame_index]; // 현재의 프레임 값을 변경.
      }
    }
  };

  /*프레임은 타일 시트 내부의 물리적 위치를 추적하여 블리팅합니다.
  블리팅: 데이터 블록이 메모리에서 빠르게 이동하거나 복사되는 논리적 작업으로, 일반적으로 2차원 그래픽을 애니메이션하는데 사용됨.*/
  var Frame = function(x, y, width, height) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
  };

  /* Pool 오브젝트는 오브젝트를 관리합니다. objects 배열은 현재 사용중인 모든 오브젝트를 보유하고 풀은 사용하지 않는 오브젝트를 보유합니다.
  그렇지않으면 삭제될 객체를 저장함으로써 new 연산자로 완전히 새로운 인스턴스를 생성하는 대신 재사용 할 수 있습니다. 재활용하면 메모리가 절약됩니다.*/
  var Pool = function(object) {
    this.object = object; // The constructor of the object we are pooling.(풀링하는 객체의 생성자입니다.)
    this.objects = []; // The array of objects in use. (사용중인 객체의 배열입니다.)
    this.pool = []; // The array of objects not in use. (사용하지 않는 객체의 배열입니다.)
  };

  Pool.prototype = {
    /* 풀에서 객체를 가져 오거나 새 객체를 만듭니다. Pool은 리셋과 같은 몇가지 기본 function을 갖기로 기대되는 객채입니다. */
    get: function(parameters) {
      if (this.pool.length != 0) {
        let object = this.pool.pop();
        object.reset(parameters);
        this.objects.push(object);
      } else {
        this.objects.push(new this.object(parameters.x, parameters.y));
      }
    },

    store: function(object) {
      let index = this.objects.indexOf(object);

      if (index != -1) {
        this.pool.push(this.objects.splice(index, 1)[0]);
      }
    },

    storeAll: function() {
      for (let index = this.objects.length - 1; index > -1; --index) {
        this.pool.push(this.objects.pop());
      }
    }
  };

  var Meteor = function(x, y) {
    this.alive = true; // 화면에서 사라지면 유성이 죽습니다.
    this.animation = new Animation(display.tile_sheet.frame_sets[1], 8);
    this.grounded = false;
    this.smoke = false; // 연기 값은 연기 입자를 생성하는 데 사용됩니다.
    this.smoke_count = 0;
    this.smoke_delay = Math.floor(Math.random() * 10 + 5);
    this.height = Math.floor(Math.random() * 16 + 24);
    this.width = this.height;
    this.x = x;
    this.y = y - this.height * 0.5;
    let direction = Math.PI * 1.75 + Math.random() * Math.PI * 0.1; // 궤적.
    this.x_velocity = Math.cos(direction) * 3;
    this.y_velocity = -Math.sin(direction) * 3;
  };

  /* 모든 게임 오브젝트에는 collideWorld 및 CollideObject function과 업데이트 및 리셋 function이 있어야합니다.
  이것이 강력한 타입의 언어라면, GameObject 또는 그와 비슷한 기본 클래스로 사용하고 있었을 것입니다. */
  Meteor.prototype = {
    constructor: Meteor,

    collideObject: function(player) {
      let vector_x = player.x + player.width * 0.5 - this.x - this.width * 0.5;
      let vector_y =
        player.y + player.height * 0.5 - this.y - this.height * 0.5;
      let combined_radius = player.height * 0.5 + this.width * 0.5;

      if (
        vector_x * vector_x + vector_y * vector_y <
        combined_radius * combined_radius
      ) {
        player.alive = false;
        player.animation.change(display.tile_sheet.frame_sets[5], 10);
        hitSound.play();
      }
    },

    collideWorld: function() {
      if (this.x + this.width < 0) {
        this.alive = false;
        return;
      }

      if (this.y + this.height > WORLD_HEIGHT - 6) {
        this.x_velocity = -game.speed;
        this.grounded = true;
        this.y = WORLD_HEIGHT - this.height - 6;
      }
    },

    reset: function(parameters) {
      this.alive = true;
      this.animation.change(display.tile_sheet.frame_sets[1], 8);
      this.grounded = false;
      this.x = parameters.x;
      let direction = Math.PI * 1.75 + Math.random() * Math.PI * 0.1;
      this.x_velocity = Math.cos(direction) * 3;
      this.y = parameters.y;
      this.y_velocity = -Math.sin(direction) * 3;
    },

    update: function() {
      if (!this.grounded) {
        this.animation.update();
        this.y += this.y_velocity;
      } else {
        this.x_velocity = -game.speed;
      }

      this.x += this.x_velocity;

      this.smoke_count++;
      if (this.smoke_count == this.smoke_delay) {
        this.smoke_count = 0;
        this.smoke = true;
      }
    }
  };

  var Smoke = function(x, y, x_velocity, y_velocity) {
    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[2], 8);
    this.life_count = 0;
    this.life_time = Math.random() * 20 + 30;
    this.height = 8 + Math.floor(Math.random() * 8);
    this.width = this.height;
    this.x = x;
    this.y = y;
    this.x_velocity = x_velocity;
    this.y_velocity = y_velocity;
  };

  Smoke.prototype = {
    constructor: Smoke,

    collideWorld: function() {
      if (this.x > WORLD_WIDTH || this.y > WORLD_HEIGHT - 20) {
        this.alive = false;
      }
    },

    reset: function(parameters) {
      this.alive = true;
      this.life_count = 0;
      this.life_time = Math.random() * 20 + 30;
      this.x = parameters.x;
      this.x_velocity = parameters.x_velocity;
      this.y = parameters.y;
      this.y_velocity = parameters.y_velocity;
    },

    update: function() {
      this.animation.update();
      this.x += this.x_velocity;
      this.y += this.y_velocity;

      this.life_count++;

      if (this.life_count > this.life_time) {
        this.alive = false;
      }
    }
  };

  var TarPit = function(x, y) {
    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[0], 8);
    this.height = 30;
    this.width = Math.floor(Math.random() * 64 + 48);
    this.x = x;
    this.y = y;
  };

  TarPit.prototype = {
    constructor: TarPit,

    collideObject: function(player) {},

    collideObject: function(object) {
      if (
        !object.jumping &&
        object.x + object.width * 0.5 > this.x + this.width * 0.2 &&
        object.x + object.width * 0.5 < this.x + this.width * 0.8
      ) {
        object.alive = false;
        object.animation.change(display.tile_sheet.frame_sets[4], 10);
      }
    },

    collideWorld: function() {
      if (this.x + this.width < 0) this.alive = false;
    },

    reset: function(parameters) {
      this.alive = true;
      this.width = Math.floor(Math.random() * 64 + 48);
      this.x = parameters.x;
      this.y = parameters.y;
    },

    update: function() {
      this.animation.update();
      this.x -= game.speed;
    }
  };

  var controller, display, game;

  /* 대단해. 모든 mouseup, mousedown, touchstart 및 touchend 이벤트에 동일한 이벤트 핸들러를 사용할 수 있습니다. 이 컨트롤러는 모든 것에 작동합니다!*/
  controller = {
    active: false,
    state: false,

    onOff: function(event) {
      event.preventDefault();

      let key_state =
        event.type == "mousedown" || event.type == "touchstart" ? true : false;

      if (controller.state != key_state) controller.active = key_state;
      controller.state = key_state;
    }
  };

  display = {
    buffer: document.createElement("canvas").getContext("2d"),
    context: document.querySelector("canvas").getContext("2d"),

    tint: 0, // 유성이 화면에있을 때 버퍼의 빨간색 채널에 추가 할 빨간색 색조 값입니다.

    tile_sheet: {
      columns: undefined, // INITIALIZE 섹션에서 설정하십시오.
      frames: [
        new Frame(0, 32, 24, 16),
        new Frame(24, 32, 24, 16), //타르 핏
        new Frame(64, 32, 16, 16),
        new Frame(80, 32, 16, 16), // 메테오
        new Frame(96, 32, 8, 8),
        new Frame(104, 32, 8, 8),
        new Frame(96, 40, 8, 8),
        new Frame(104, 40, 8, 8), // 연기
        new Frame(0, 48, 28, 16),
        new Frame(28, 48, 28, 16),
        new Frame(56, 48, 28, 16),
        new Frame(84, 48, 28, 16),
        new Frame(0, 64, 28, 16),
        new Frame(28, 64, 28, 16),
        new Frame(56, 64, 28, 16),
        new Frame(84, 64, 28, 16), //달리는 공룡
        new Frame(0, 80, 28, 16),
        new Frame(28, 80, 28, 16),
        new Frame(56, 80, 28, 16),
        new Frame(84, 80, 28, 16),
        new Frame(0, 96, 28, 16),
        new Frame(28, 96, 28, 16), //밑으로 빠짐
        new Frame(56, 96, 28, 16),
        new Frame(84, 96, 28, 16),
        new Frame(0, 112, 28, 16),
        new Frame(28, 112, 28, 16),
        new Frame(56, 112, 28, 16),
        new Frame(84, 112, 28, 16) //불에 탐
      ],

      frame_sets: [
        [0, 1], //타르 핏
        [2, 3], //메테오
        [4, 5, 6, 7], //연기
        [8, 9, 10, 11, 12, 13, 14, 15], //달리는 공룡
        [16, 17, 18, 19, 20, 21], //밑으로 빠짐
        [22, 23, 24, 25, 26, 27] //불에 탐
      ],
      image: new Image() // 타일 시트 이미지는이 파일의 맨 아래에 로드됩니다.
    },

    render: function() {
      // Draw Tiles
      for (let index = game.area.map.length - 1; index > -1; --index) {
        let value = game.area.map[index];

        this.buffer.drawImage(
          this.tile_sheet.image,
          (value % this.tile_sheet.columns) * TILE_SIZE,
          Math.floor(value / this.tile_sheet.columns) * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
          (index % game.area.columns) * TILE_SIZE - game.area.offset,
          Math.floor(index / game.area.columns) * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      }

      // Draw distance
      this.buffer.font = "20px Arial";
      this.buffer.fillStyle = "#ffffff";
      this.buffer.fillText(
        String(
          Math.floor(game.distance / 10) +
            " / " +
            Math.floor(game.max_distance / 10)
        ),
        10,
        20
      );

      // Draw TarPits
      for (
        let index = game.object_manager.tarpit_pool.objects.length - 1;
        index > -1;
        --index
      ) {
        let tarpit = game.object_manager.tarpit_pool.objects[index];

        let frame = this.tile_sheet.frames[tarpit.animation.frame_value];

        this.buffer.drawImage(
          this.tile_sheet.image,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          tarpit.x,
          tarpit.y,
          tarpit.width,
          tarpit.height
        );
      }

      // Draw Player
      let frame = this.tile_sheet.frames[game.player.animation.frame_value];

      this.buffer.drawImage(
        this.tile_sheet.image,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        game.player.x,
        game.player.y,
        game.player.width,
        game.player.height
      );

      // Draw Meteors
      for (
        let index = game.object_manager.meteor_pool.objects.length - 1;
        index > -1;
        --index
      ) {
        let meteor = game.object_manager.meteor_pool.objects[index];

        let frame = this.tile_sheet.frames[meteor.animation.frame_value];

        this.buffer.drawImage(
          this.tile_sheet.image,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          meteor.x,
          meteor.y,
          meteor.width,
          meteor.height
        );
      }

      // Draw Smoke
      for (
        let index = game.object_manager.smoke_pool.objects.length - 1;
        index > -1;
        --index
      ) {
        let smoke = game.object_manager.smoke_pool.objects[index];

        let frame = this.tile_sheet.frames[smoke.animation.frame_value];

        this.buffer.drawImage(
          this.tile_sheet.image,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          smoke.x,
          smoke.y,
          smoke.width,
          smoke.height
        );
      }

      // 유성이 화면에 있으면 색조를 그립니다.
      if (game.object_manager.meteor_pool.objects.length != 0) {
        this.tint = this.tint < 80 ? this.tint + 1 : 80;
      } else {
        // 그렇지 않으면 색조를 줄입니다

        this.tint = this.tint > 0 ? this.tint - 2 : 0;
      }

      if (this.tint != 0) {
        // 그릴 색조가 있으면 버퍼에 적용하십시오.

        let image_data = this.buffer.getImageData(
          0,
          0,
          WORLD_WIDTH,
          WORLD_HEIGHT
        );
        let data = image_data.data;

        for (let index = data.length - 4; index > -1; index -= 4) {
          data[index] += this.tint;
        }

        this.buffer.putImageData(image_data, 0, 0);
      }

      this.context.drawImage(
        this.buffer.canvas,
        0,
        0,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
    },

    resize: function(event) {
      display.context.canvas.width = document.documentElement.clientWidth - 16;

      if (
        display.context.canvas.width >
        document.documentElement.clientHeight - 16
      ) {
        display.context.canvas.width =
          document.documentElement.clientHeight - 16;
      }

      display.context.canvas.height = display.context.canvas.width * 0.5625;

      display.buffer.imageSmoothingEnabled = false;
      display.context.imageSmoothingEnabled = false;

      display.render();
    }
  };

  game = {
    distance: 0,
    max_distance: 0,
    speed: 3,

    area: {
      columns: 17,
      offset: 0,
      map: [
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        1,
        1,
        1,
        0,
        0,
        1,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        1,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        1,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        1,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1,
        0,
        1,
        0,
        1,
        0,
        0,
        1,
        0,
        1,
        1,
        1,
        0,
        1,
        0,
        0,
        1,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        1,
        0,
        1,
        1,
        0,
        0,
        0,
        0,
        1,
        1,
        0,
        1,
        0,
        2,
        2,
        2,
        3,
        2,
        2,
        3,
        2,
        4,
        6,
        7,
        7,
        6,
        9,
        2,
        3,
        2,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        10
      ],

      /* 배경을 스크롤하고 지도의 맨 오른쪽에 표시할 다음 열을 생성합니다. */
      scroll: function() {
        game.distance += game.speed;

        if (game.distance > game.max_distance)
          game.max_distance = game.distance;

        this.offset += game.speed;
        if (this.offset >= TILE_SIZE) {
          this.offset -= TILE_SIZE;

          /* 이 루프는 첫 번째 열을 제거하고 상위 7 개 행에 대해 임의로 생성 된 마지막 열을 삽입합니다. 이것은 임의의 하늘 생성을 처리합니다. */
          for (
            let index = this.map.length - this.columns * 3;
            index > -1;
            index -= this.columns
          ) {
            this.map.splice(index, 1);
            this.map.splice(
              index + this.columns - 1,
              0,
              Math.floor(Math.random() * 2)
            );
          }

          /* 이 다음 부분은 잔디를 적절한 잔디 타일로 대체합니다.
          나는 그것을 필요 이상으로 조금 더 복잡하게 만들었지만 타일은 실제로 왼쪽으로 직접 타일과 가장자리를 조정합니다. */
          this.map.splice(this.columns * 7, 1);

          let right_index = this.columns * 8 - 1;
          let value = this.map[right_index - 1];

          switch (value) {
            case 2:
            case 3:
              value = [2, 3, 2, 3, 2, 3, 2, 3, 4, 5][
                Math.floor(Math.random() * 10)
              ];
              break;
            case 4:
            case 5:
              value = [6, 7][Math.floor(Math.random() * 2)];
              break;
            case 6:
            case 7:
              value = [6, 7, 8, 9][Math.floor(Math.random() * 4)];
              break;
            case 8:
            case 9:
              value = [2, 3][Math.floor(Math.random() * 2)];
              break;
          }

          this.map.splice(right_index, 0, value);

          // 마지막 행은 동일하게 유지됩니다. 흐릿할 뿐입니다.
        }
      }
    },

    engine: {
      /* Fixed time step game loop!! */
      afrequest: undefined, // 애니메이션 프레임 요청 참조
      accumulated_time: window.performance.now(),
      time_step: 1000 / 60, //  update rate

      loop: function(time_stamp) {
        /* 이게 얼마나 쉬운가요? 이것은 프레임이 떨어지는 고정 스텝 루프입니다.
        놀랍게도 매우 간단하고 단 몇 줄입니다. 이렇게하면 모든 장치에서 게임이 같은 속도로 실행됩니다.
        이제 살펴보면 업데이트 또는 렌더링하지 않고 전체 프레임을 삭제할 수 있기 때문에 이를 구현하는 더 좋은 방법이 있을 수 있다고 생각합니다.
        지금이 문제를 해결하기보다는 그대로 두겠습니다.
        이상적으로는 자유 시간을 활용하고 필요하지 않은 한 동시에 업데이트와 렌더링을 동시에 수행하지 않을 것입니다 ... 다른 날 ... 이것은 잘 작동합니다. */
        if (
          time_stamp >=
          game.engine.accumulated_time + game.engine.time_step
        ) {
          if (
            time_stamp - game.engine.accumulated_time >=
            game.engine.time_step * 4
          ) {
            game.engine.accumulated_time = time_stamp;
          }

          while (game.engine.accumulated_time < time_stamp) {
            game.engine.accumulated_time += game.engine.time_step;

            game.engine.update();
          }

          display.render();
        }

        window.requestAnimationFrame(game.engine.loop);
      },

      start: function() {
        // Start the game loop.
        this.afrequest = window.requestAnimationFrame(this.loop);
      },

      update: function() {
        // Update the game logic.

        /* 속도가 너무 높아지면 속도를 천천히 높이고 캡에 맞춥니다. */
        game.speed =
          game.speed >= TILE_SIZE * 0.5 ? TILE_SIZE * 0.5 : game.speed + 0.001;
        /* 플레이어의 애니메이션 딜레이가 스크롤 속도를 유지하고 있는지 확인. */
        game.player.animation.delay = Math.floor(10 - game.speed);
        game.area.scroll(); // Scroll!!!

        if (game.player.alive) {
          if (controller.active && !game.player.jumping) {
            // Get user input
            jumpSound.play();
            controller.active = false;
            game.player.jumping = true;
            game.player.y_velocity -= 15;
            game.player.animation.change([10], 15);
          }

          if (game.player.jumping == false) {
            game.player.animation.change(
              display.tile_sheet.frame_sets[3],
              Math.floor(TILE_SIZE - game.speed)
            );
          }

          game.player.update();

          if (game.player.y > TILE_SIZE * 6 - TILE_SIZE * 0.25) {
            // 바닥과 충돌

            controller.active = false;
            game.player.y = TILE_SIZE * 6 - TILE_SIZE * 0.25;
            game.player.y_velocity = 0;
            game.player.jumping = false;
          }
        } else {
          game.player.x -= game.speed;
          game.speed *= 0.9;

          if (
            game.player.animation.frame_index ==
            game.player.animation.frame_set.length - 1
          )
            game.reset();
        }

        game.player.animation.update();

        game.object_manager.spawn();
        game.object_manager.update();
      }
    },

    /* 플레이어가 아닌 모든 객체를 관리 */
    object_manager: {
      count: 0,
      delay: 100,

      meteor_pool: new Pool(Meteor),
      smoke_pool: new Pool(Smoke),
      tarpit_pool: new Pool(TarPit),

      spawn: function() {
        this.count++;

        if (this.count == this.delay) {
          this.count = 0;
          this.delay = 100; // + Math.floor(Math.random() * 200 - 10 * game.speed);

          /* 타르 핏과 유성 사이에서 무작위로 선택 */
          if (Math.random() > 0.5) {
            this.tarpit_pool.get({ x: WORLD_WIDTH, y: WORLD_HEIGHT - 30 });
          } else {
            this.meteor_pool.get({ x: WORLD_WIDTH * 0.2, y: -32 });
          }
        }
      },

      update: function() {
        for (
          let index = this.meteor_pool.objects.length - 1;
          index > -1;
          --index
        ) {
          let meteor = this.meteor_pool.objects[index];

          meteor.update();

          meteor.collideObject(game.player);

          meteor.collideWorld();

          if (meteor.smoke) {
            meteor.smoke = false;

            let parameters = {
              x: meteor.x + Math.random() * meteor.width,
              y: undefined,
              x_velocity: undefined,
              y_velocity: undefined
            };

            if (meteor.grounded) {
              parameters.y = meteor.y + Math.random() * meteor.height * 0.5;
              parameters.x_velocity = Math.random() * 2 - 1 - game.speed;
              parameters.y_velocity = Math.random() * -1;
            } else {
              parameters.y = meteor.y + Math.random() * meteor.height;
              parameters.x_velocity = meteor.x_velocity * Math.random();
              parameters.y_velocity = meteor.y_velocity * Math.random();
            }

            this.smoke_pool.get(parameters);
          }

          if (!meteor.alive) {
            this.meteor_pool.store(meteor);
          }
        }

        for (
          let index = this.smoke_pool.objects.length - 1;
          index > -1;
          --index
        ) {
          let smoke = this.smoke_pool.objects[index];

          smoke.update();

          smoke.collideWorld();

          if (!smoke.alive) this.smoke_pool.store(smoke);
        }

        for (
          let index = this.tarpit_pool.objects.length - 1;
          index > -1;
          --index
        ) {
          let tarpit = this.tarpit_pool.objects[index];

          tarpit.update();

          tarpit.collideObject(game.player);

          tarpit.collideWorld();

          if (!tarpit.alive) this.tarpit_pool.store(tarpit);
        }
      }
    },

    player: {
      alive: true,
      animation: new Animation([15], 10),
      jumping: false,
      height: 32,
      width: 56,
      x: 8,
      y: TILE_SIZE * 6 - TILE_SIZE * 0.25,
      y_velocity: 0,

      reset: function() {
        this.alive = true;
        this.x = 8;
      },

      update: function() {
        game.player.y_velocity += 0.5;
        game.player.y += game.player.y_velocity;
        game.player.y_velocity *= 0.9;
      }
    },

    reset: function() {
      this.distance = 0;
      this.player.reset();

      /* 모든 오브젝트를 지웁니다. */
      this.object_manager.meteor_pool.storeAll();
      this.object_manager.smoke_pool.storeAll();
      this.object_manager.tarpit_pool.storeAll();

      this.speed = 3;
    }
  };

  ////////////////////
  //// INITIALIZE ////
  ////////////////////

  display.buffer.canvas.height = WORLD_HEIGHT;
  display.buffer.canvas.width = WORLD_WIDTH;

  display.tile_sheet.image.src = "nid.png";
  display.tile_sheet.image.addEventListener("load", function(event) {
    display.tile_sheet.columns = this.width / TILE_SIZE;

    display.resize();
    game.engine.start();
  });

  window.addEventListener("resize", display.resize);
  window.addEventListener("mousedown", controller.onOff);
  window.addEventListener("mouseup", controller.onOff);
  window.addEventListener("touchstart", controller.onOff);
  window.addEventListener("touchend", controller.onOff);
})();
