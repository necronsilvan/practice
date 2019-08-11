var ovjBird;
var pipes = [];
var play = true;
var score = 0;
var LiveScore = 0;
var bird, over, sky;

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
    background(0);
    if (!play) {

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
            document.location.reload();
        }
        }
    else {
          // display background image
        image(sky, 0, 0);
        strokeWeight(1);
        stroke(100);

        for (var i = pipes.length-1; i >= 0; i--) {
        pipes[i].show();
        pipes[i].update();

        if (pipes[i].hits(ovjBird)) {
            console.log("HIT");
            score -= 3;

            if(score < 0) {
                play = false;
            }
        }

        if (pipes[i].offscreen()) {
            pipes.splice(i, 1);
            }
        }
            ovjBird.update();
            ovjBird.show();

        if (frameCount % 70 == 0) {
            pipes.push(new pipe());
        }
            if (frameCount % 100 == 0) {
                score+= 1;
                LiveScore+=1;
            }
        textSize(24);
        fill(255);
        strokeWeight(4);
        stroke(50, 100, 255);
        text('HP : '+score, 20, 30);
    }
}
function touchStarted() {
    ovjBird.up();
}

//function keyPressed() {
//    if (key == ' ') {
//        ovjBird.up();
//    }
//}
