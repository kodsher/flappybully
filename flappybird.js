const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const birdImage = new Image();
birdImage.src = 'catonplan.png'; // Ensure catonplan.png is in the same directory

const pipeImage = new Image();
pipeImage.src = 'tower.jpg'; // Ensure tower.jpg is in the same directory

const explosionImage = new Image();
explosionImage.src = 'explosion.png'; // Ensure explosion.png is in the same directory

const bird = {
  x: 50,
  y: 150,
  width: 160, // 4 times larger
  height: 160, // 4 times larger
  gravity: 0.1, // Reduced gravity
  lift: -7,
  velocity: 0,
  exploded: false,
  draw: function() {
    if (this.exploded) {
      context.drawImage(explosionImage, this.x - this.width * 1.5, this.y - this.height * 1.5, this.width * 4, this.height * 4);
    } else {
      context.drawImage(birdImage, this.x, this.y, this.width, this.height);
    }
  },
  update: function() {
    if (!this.exploded) {
      this.velocity += this.gravity;
      this.y += this.velocity;
      if (this.y + this.height > canvas.height) {
        this.y = canvas.height - this.height;
        this.velocity = 0;
      }
      if (this.y < 0) {
        this.y = 0;
        this.velocity = 0;
      }
    }
  },
  flap: function() {
    if (!this.exploded) {
      this.velocity = this.lift;
    }
  }
};

const pipes = [];
const pipeWidth = 30;
const pipeGap = 200;
let frameCount = 0;
let score = 0;
let highScore = 0;
let gameOver = false;

function drawPipes() {
  pipes.forEach(pipe => {
    context.drawImage(pipeImage, pipe.x, 0, pipeWidth, pipe.top);
    context.drawImage(pipeImage, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
  });
}

function updatePipes() {
  if (frameCount % 120 === 0) {
    const top = Math.floor(Math.random() * (canvas.height - pipeGap));
    const bottom = canvas.height - top - pipeGap;
    pipes.push({ x: canvas.width, top, bottom });
  }

  pipes.forEach(pipe => {
    pipe.x -= 1.5;
  });

  if (pipes.length > 0 && pipes[0].x < -pipeWidth) {
    pipes.shift();
    score++;
    if (score > highScore) {
      highScore = score;
    }
  }
}

function detectCollision() {
  for (let pipe of pipes) {
    if (bird.x < pipe.x + pipeWidth &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)) {
      return true;
    }
  }
  return false;
}

function gameLoop() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  bird.update();
  bird.draw();
  updatePipes();
  drawPipes();

  if (!gameOver) {
    if (detectCollision()) {
      gameOver = true;
      bird.exploded = true;
    }

    context.fillStyle = "black";
    context.font = "20px Arial";
    context.fillText(`Score: ${score}`, 10, 25);
    context.fillText(`High Score: ${highScore}`, 10, 50);

    frameCount++;
    requestAnimationFrame(gameLoop);
  } else {
    context.fillStyle = "black";
    context.font = "30px Arial";
    context.fillText("Game Over", canvas.width / 2 - 75, canvas.height / 2 - 15);
    context.font = "20px Arial";
    context.fillText(`Score: ${score}`, canvas.width / 2 - 25, canvas.height / 2 + 15);
    context.fillText(`High Score: ${highScore}`, canvas.width / 2 - 50, canvas.height / 2 + 45);
    context.fillText("Press R to Restart", canvas.width / 2 - 75, canvas.height / 2 + 75);
  }
}

document.addEventListener("keydown", function(event) {
  if (event.code === "Space" && !gameOver) {
    bird.flap();
  }
  if (event.code === "KeyR" && gameOver) {
    gameOver = false;
    score = 0;
    pipes.length = 0;
    bird.y = 150;
    bird.velocity = 0;
    bird.exploded = false;
    frameCount = 0;
    gameLoop();
  }
});

birdImage.onload = function() {
  gameLoop();
};
