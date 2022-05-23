// For it to run you need a local server (check: https://github.com/processing/p5.js/wiki/Local-server)

let ants = [];

let food = [];

let trails = [];

let home;

let isFOV;

let isFoodTrail;

let isReturnTrail;
function setup() {
  // put setup code here
  pixelDensity(1);
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.mousePressed(mouse);
  canvas.mouseMoved(mouse);
  let controls = document.getElementById("controls");
  isFOV = createCheckbox("FOV Visuals", true);
  isFOV.parent(controls);
  
  isFoodTrail = createCheckbox("Food Trail Visuals", true);
  isFoodTrail.parent(controls);

  isReturnTrail = createCheckbox("Return Trail Visuals", true);
  isReturnTrail.parent(controls);
  rectMode(CENTER);
  home = new Home(random(width), random(height));
  for (let i = 0; i < 100; i++) {
    ants[i] = new Ant(
      random(home.pos.x - 20, home.pos.x + 20),
      random(home.pos.y - 20, home.pos.y + 20),
      i
    );
  }
  /* for (let i = 0; i < 1000; i++) {
    food[i] = new Food(
      random(foodLocation.x - 200, foodLocation.x + 200),
      random(foodLocation.y - 200, foodLocation.y + 200)
    );
  } */
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
    ants[i].update(mouseX, mouseY);
    ants[i].draw();
  }
  for (let i = 0; i < food.length; i++) {
    food[i].draw();
  }
  for (let i = 0; i < trails.length; i++) {
    trails[i].draw();
  }
}
