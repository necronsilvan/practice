var ovjBird;
var pipes = [];
var play = 0;
var score = 0;
var LiveScore = 0;
var bird, over, sky;
var differ = 1;
var hitSound = new Audio('hit.mp3');

function preload()
{
  // load images
  sky = loadImage("sky.png");
  bird = loadImage("bird.png");
  over = loadImage("over.png");
}

function setup() {
    createCanvas(400,600);
    ovjBird = new ovjBird();
    pipes.push(new pipe());
}

function draw() {
    background(20);
    if (play === 2) {
        textSize(40);
        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        strokeWeight(1);
        stroke(155, 200, 200);
        text('Game Over',width/2, height/2);
        imageMode(CENTER);
        image(over, width/2, height/2-60, 60, 60);
        textSize(20);
        fill(255, 210);
        text('Your LiveScore is '+LiveScore+'!', width/2, 50+height/2);
        textSize(14);
        fill(255, 180);
        text('Press Restart', width/2, 100+height/2);
        function touchStarted() {
            play = 0;
        }
    }
    else if (play === 1) {
        imageMode(CORNER);
        image(sky, 0, 0);
        strokeWeight(1);
        stroke(100);

        if (differ === 1) {
            pipeScore(1);
            pipeNum(120);
        }

        else if (differ === 2) {
            pipeScore(3);
            pipeNum(90);
        }

        else {
            pipeScore(5);
            pipeNum(60);
        }

        ovjBird.update();
        ovjBird.show();

        if (frameCount % 100 == 0) {
            score+= 1;
            LiveScore+=1;
        }
        textSize(24);
        fill(255);
        strokeWeight(4);
        stroke(50, 100, 255);
        textAlign(CENTER, CENTER);
        text('HP : '+score, 45, 25);
    }
    else {
    play = 0;
    score = 0;
    LiveScore = 0;
    pipes = [];
    ovjBird.x= 64;
    ovjBird.y= height/2;
    textAlign(CENTER, CENTER);
    textSize(40);
    fill(255);
    text('날아봅시다', width/2, 100);
    textSize(24);
    fill('#fae');
    rect(width/4, 200, 200, 60, 10);
    fill(255, 204, 0);
    rect(width/4, 300, 200, 60, 10);
    fill('red');
    rect(width/4, 400, 200, 60, 10);
    fill(0);
    text('초보 난이도', width/2, 235);
    text('일반 난이도', width/2, 335);
    text('헬븐 난이도', width/2, 435);

    }
}

function touchStarted() {
    if(play === 2) {
        play = 0;
    }
    else if (play === 1) {
        ovjBird.up();
    }
    else {
        if(mouseX > 100 && mouseX < 300 && mouseY > 200 && mouseY < 260) {
            differ = 1;
            play = 1;
        }

        if(mouseX > 100 && mouseX < 300 && mouseY > 300 && mouseY < 360) {
            differ = 2;
            play = 1;
        }

        if(mouseX > 100 && mouseX < 300 && mouseY > 400 && mouseY < 460) {
            differ = 3;
            play = 1;
        }
    }
}

function pipeScore(minus) {
    for (var i = pipes.length-1; i >= 0; i--) {
    pipes[i].show();
    pipes[i].update();

        if (pipes[i].hits(ovjBird)) {
        hitSound.play();
        score -= minus;

        if(score < 0) {
        play = 2;
        }
    }

    if (pipes[i].offscreen()) {
    pipes.splice(i, 1);
        }
    }
}

function pipeNum(frame) {
    if (frameCount % frame == 0) {
        pipes.push(new pipe());
    }
}
//function keyPressed() {
//    if (key == ' ') {
//        ovjBird.up();
//    }
//}
