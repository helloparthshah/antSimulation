// For it to run you need a local server (check: https://github.com/processing/p5.js/wiki/Local-server)
p5.disableFriendlyErrors = true;

let ants = [];

let food = [];

let trails = [];

let home;

let isFOV;

let isFoodTrail;

let knowHome;
let isReturnTrail;

let antGIF;

let textures;

function preload() {
  antGIF = loadImage("ant.gif");
}

function setup() {
  // put setup code here
  pixelDensity(1);
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.touchMoved(mouse);
  canvas.mouseMoved(mouse);
  let controls = document.getElementById("controls");
  isFOV = createCheckbox("FOV Visuals", false);
  isFOV.parent(controls);

  isFoodTrail = createCheckbox("Food Trail Visuals", false);
  isFoodTrail.parent(controls);

  isReturnTrail = createCheckbox("Return Trail Visuals", false);
  isReturnTrail.parent(controls);

  knowHome = createCheckbox("Ants know Home", true);
  knowHome.parent(controls);

  textures = createCheckbox("Ant Textures", true);
  textures.parent(controls);
  rectMode(CENTER);
  home = new Home(random(width), random(height));
  for (let i = 0; i < 50; i++) {
    ants[i] = new Ant(
      random(home.pos.x - 20, home.pos.x + 20),
      random(home.pos.y - 20, home.pos.y + 20),
      i
    );
  }

  antGIF.delay(100);
}

function mouse() {
  // check if mouse is in pressed state
  if (mouseIsPressed) {
    food.push(new Food(mouseX, mouseY));
  }
}

function draw() {
  // put drawing code here
  background(220);
  home.draw();

  for (let i = 0; i < ants.length; i++) {
    ants[i].update();
    ants[i].draw();
  }
  for (let i = 0; i < food.length; i++) {
    food[i].draw();
  }
  for (let i = 0; i < trails.length; i++) {
    trails[i].draw();
  }

  // framerate in the bottom left corner
  fill(0);
  textSize(20);
  text(frameRate(), 10, height - 10);
}
