//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12 This is the ratio of bird 
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;  
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

let pipeArray = [];
let pipeWidth = 64; // Width/Height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2.5; // This means the pipe moves 2 pixels to the left on every frame.
let velocityY = 0;
let gravity = 0.5;

let gameOver = false;
let score = 0;

let wingSound = new Audio("./sfx_wing.wav")
let hitSound = new Audio("./sfx_hit.wav")
let dieSound = new Audio("./sfx_die.wav")
let bgm = new Audio("./bgm_mario.mp3")
bgm.loop = true;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d")   //It is used for drawing on the board

    //draw flappy bird
    //context.fillStyle = "green";
    //context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //loading of the image
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function(){
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
}

//this function will update the screen after refreshing 
function update() {
    requestAnimationFrame(update)
    if (gameOver){
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;

    //bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //Apply gravity to current bird.y, limit to top of the canvas 
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height){
        gameOver = true;
        dieSound.play();
    }

    //pipes
    for(i=0; i<pipeArray.length; i++){
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height); 

        if(!pipe.passed && bird.x > pipe.x + pipe.width){
            score += 0.5; //there are 2 pipes soo 0.5*2=1, 1 for of each set pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)){
            hitSound.play();
            gameOver = true;
        } 
    }

    //clear
    while(pipeArray.length > 0 && pipeArray[0].x < -pipeWidth ) {
        pipeArray.shift(); //Removes the 1st element from the array
    }

    //score
    context.fillStyle = "White";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if(gameOver){
        context.fillText("GAME OVER!!", 30, 330)
        bgm.pause();
        bgm.currentTime = 0;
    }   
}

function placePipes() {
    if (gameOver){
        return;
    }


    //pipe height =512/4=128 as pipeY-pipeHeight = 0 - 128 = -128 it means the pipe height will become small as it minus 128 height of pipe 
    //And the 

    //math.random method give the number between 0 and 1 so (0-1)*pipeHeight/2
    //0 -> -128 (pipeHeight/4)
    //1 -> -128 -256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2); 
    let openingSpace = board.height/4;


    let toppipe = {
    img : topPipeImg,
    x : pipeX, // start from the right edge of the canvas
    y : randomPipeY,
    width : pipeWidth,
    height : pipeHeight,
    passed : false
    }

    pipeArray.push(toppipe); // Add the top pipe in array

    let bottompipe = {
    img : bottomPipeImg,
    x : pipeX,
    y : randomPipeY + pipeHeight + openingSpace,
    width : pipeWidth,
    height : pipeHeight,
    passed : false
    }


    pipeArray.push(bottompipe); // Add the bottom pipe in array
    //This means the pipe starts off-screen on the right and will move toward the left.
}


function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX"){

        if (bgm.paused){
            bgm.play()
        }
        wingSound.play();

        //jump
        velocityY = -7;

        if(gameOver){
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }

}

function detectCollision( a , b ) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
