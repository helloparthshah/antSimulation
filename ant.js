class Trail {
  constructor(x, y, owner, type) {
    this.pos = createVector(x, y);
    this.type = type;
    this.owner = owner;
    this.lifespan = 600;
  }

  draw() {
    noStroke();
    if (this.type === "food") {
      fill(255, 0, 0, this.lifespan);
      ellipse(this.pos.x, this.pos.y, 5, 5);
    } else {
      fill(0, 0, 255, this.lifespan);
      // ellipse(this.pos.x, this.pos.y, 5, 5);
    }
    this.lifespan--;
    if (this.lifespan < 0 && this.type === "food") {
      trails.splice(trails.indexOf(this), 1);
    }

    if (this.lifespan < -500) {
      trails.splice(trails.indexOf(this), 1);
    }
  }
}

class Ant {
  constructor(x, y, i) {
    this.index = i;
    this.pos = createVector(x, y);
    // random direction
    // randomize seed
    // this.dir = p5.Vector.random2D();
    this.dir = createVector(random(-1, 1), random(-1, 1));
    this.maxSpeed = 2;
    this.steerStrength = 0.1;
    this.velocity = createVector(0, 0);

    this.fov = PI / 3;
    this.viewDistance = 300;

    this.wanderStrength = 0.2;

    this.desiredDirection = p5.Vector.random2D();

    this.target = null;

    this.hasFood = false;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.dir.heading());
    fill(0);
    triangle(0, 0, 20 / 1.5, 10 / 1.5, 0, 20 / 1.5);
    pop();
  }

  pickFood() {
    let foodStillThere = false;
    for (let i = 0; i < food.length; i++) {
      if (this.target == food[i]) {
        foodStillThere = true;
      }
      let d = dist(this.pos.x, this.pos.y, food[i].pos.x, food[i].pos.y);
      if (d < 10) {
        food.splice(i, 1);
        this.hasFood = true;
        this.target = null;
      }
    }
    if (!foodStillThere) this.target = null;
  }

  checkForFood() {
    //   checks if food in fov cone
    for (let i = 0; i < food.length; i++) {
      // check if food is in fov cone
      let d = dist(this.pos.x, this.pos.y, food[i].pos.x, food[i].pos.y);
      if (d < this.viewDistance) {
        let angle = atan2(
          food[i].pos.y - this.pos.y,
          food[i].pos.x - this.pos.x
        );
        if (angle > -this.fov / 2 && angle < this.fov / 2) {
          this.target = food[i];
          return;
        }
      }
    }
  }

  checkForTrail() {
    let trail = null;
    for (let i = 0; i < trails.length; i++) {
      if (trails[i].type === "food") {
        let d = dist(this.pos.x, this.pos.y, trails[i].pos.x, trails[i].pos.y);
        if (d < 5) {
          this.target = null;
        }
        if (!this.target)
          if (d < this.viewDistance) {
            /* let angle = atan2(
              trails[i].pos.y - this.pos.y,
              trails[i].pos.x - this.pos.x
            );
            if (angle > -this.fov / 2 && angle < this.fov / 2) { */
            if (!trail) trail = trails[i];
            if (trails[i].lifespan <= trail.lifespan) {
              trail = trails[i];
            }
            // }
          }
      }
    }
    if (trail) this.target = trail;
  }

  wanderBack() {
    let trailStillThere = false;
    let trail = new Trail(this.pos.x, this.pos.y, this.index, "food");

    for (let i = trails.length - 1; i >= 0; i--) {
      if (this.target == trails[i]) {
        trailStillThere = true;
      }
      if (trails[i].type === "trail" /*  && trails[i].owner === this.index */) {
        let d = dist(this.pos.x, this.pos.y, trails[i].pos.x, trails[i].pos.y);
        if (d < this.viewDistance) {
          if (trails[i].lifespan <= trail.lifespan) trail = trails[i];
        }

        if (d < 5) {
          trails.splice(i, 1);
          this.target = null;
          return;
        }
      }
    }
    if (!trailStillThere) this.target = null;
    if (trail.type == "trail") this.target = trail;
  }

  update() {
    if (this.hasFood) {
      // add food to trails every 60 frames
      if (frameCount % 15 == 0)
        trails.push(new Trail(this.pos.x, this.pos.y, this.index, "food"));
      this.wanderBack();
      //   check if reached home
      let d = dist(this.pos.x, this.pos.y, home.pos.x, home.pos.y);
      if (d < 20) {
        this.hasFood = false;
        this.target = null;
        this.checkForTrail();
      }
    } else {
      if (frameCount % 15 == 0)
        trails.push(new Trail(this.pos.x, this.pos.y, this.index, "trail"));
      this.checkForFood();
      this.checkForTrail();
      this.pickFood();
    }

    // let the ant wander
    if (this.target) {
      this.desiredDirection = p5.Vector.sub(this.target.pos, this.pos);
    } else {
      this.desiredDirection.rotate(
        random(-this.wanderStrength, this.wanderStrength)
      );
    }

    /* this.desiredDirection = p5.Vector.sub(
      createVector(mouseX, mouseY),
      this.pos
    ); */

    let desiredVelocity = this.desiredDirection.setMag(this.maxSpeed);
    let steer = p5.Vector.sub(desiredVelocity, this.dir);
    steer.limit(this.steerStrength);

    this.velocity.add(steer);
    this.velocity.limit(this.maxSpeed);

    this.pos.add(this.velocity);

    if (this.pos.x >= width) this.pos.x = 0;
    if (this.pos.y >= height) this.pos.y = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y < 0) this.pos.y = height;
    // set direction
    this.dir.set(this.velocity);
    this.dir.normalize();
  }
}

class Home {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.radius = 20;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    fill(0, 255, 0);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    pop();
  }
}

class Food {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.size = 10;
  }

  draw() {
    stroke(0);
    fill(0, 255, 0);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}
