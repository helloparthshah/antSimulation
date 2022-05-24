class Trail {
  constructor(x, y, owner, type, food) {
    this.pos = createVector(x, y);
    this.type = type;
    this.owner = owner;
    this.lifespan = 400;
    this.radius = 5;
    this.food = new Food(food.pos.x, food.pos.y);
  }

  draw() {
    noStroke();
    if (this.type === "food") {
      if (isFoodTrail.checked()) {
        fill(255, 0, 0, this.lifespan);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
      }
    } else {
      if (isReturnTrail.checked()) {
        fill(0, 0, 255, this.lifespan);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
      }
    }
    this.lifespan--;
    if (this.lifespan < 0) {
      trails.splice(trails.indexOf(this), 1);
    }
  }

  delete() {
    trails.splice(trails.indexOf(this), 1);
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
    this.maxSpeed = 1.5;
    this.steerStrength = 0.1;
    this.velocity = createVector(0, 0);

    this.fov = PI / 3;
    this.viewDistance = 100;

    this.wanderStrength = 0.2;

    this.desiredDirection = p5.Vector.random2D();

    this.target = null;

    this.hasFood = null;

    this.mode = "wander";

    this.flag = false;

    this.image = antGIF;
  }

  draw() {
    push();
    rectMode(CENTER);
    if (!textures.checked()) {
      translate(this.pos.x, this.pos.y);
      rotate(this.dir.heading());
      fill(0);
      triangle(5, 0, -10, -10, -10, 10);
    } else {
      translate(this.pos.x, this.pos.y);
      rotate(this.dir.heading());
      push();
      rotate(PI / 2);
      imageMode(CENTER);
      image(antGIF, 0, 0, 20, 20);
      pop();
    }
    if (this.hasFood) {
      stroke(0);
      fill(0, 255, 0);
      ellipse(10, 0, 10, 10);
    }
    // draw fov arc
    noStroke();
    // make it start from tip of ant
    if (isFOV.checked()) {
      fill(255, 0, 0, 30);
      arc(
        0,
        0,
        this.viewDistance * 2,
        this.viewDistance * 2,
        -this.fov / 2,
        this.fov / 2
      );
    }
    pop();
  }

  pickFood() {
    let foodStillThere = false;
    for (let i = 0; i < food.length; i++) {
      if (this.target == food[i]) {
        foodStillThere = true;
      }
      let d = dist(this.pos.x, this.pos.y, food[i].pos.x, food[i].pos.y);
      if (d <= food[i].size) {
        this.mode = "return";
        this.hasFood = food[i];
        food.splice(i, 1);
        if (knowHome.checked()) {
          this.target = home;
        } else this.target = null;
        return;
      }
    }
    if (!foodStillThere && this.mode == "food") this.target = null;
  }

  checkForFood() {
    let nearest = null;
    let nearestDist = Infinity;
    //   checks if food in fov cone
    for (let i = 0; i < food.length; i++) {
      // check if food is in fov cone
      let d = dist(this.pos.x, this.pos.y, food[i].pos.x, food[i].pos.y);
      if (d < this.viewDistance) {
        // find angle with respect to this.dir
        let angle = this.dir.angleBetween(p5.Vector.sub(food[i].pos, this.pos));
        if (angle > -this.fov && angle < this.fov) {
          if (d < nearestDist) {
            nearestDist = d;
            nearest = food[i];
          }
        }
      }
    }
    if (nearest) {
      this.mode = "food";
      this.target = nearest;
    }
  }

  checkForTrail() {
    if (!this.target)
      for (let i = trails.length - 1; i >= 0; i--) {
        if (trails[i].type === "food") {
          let d = dist(
            this.pos.x,
            this.pos.y,
            trails[i].pos.x,
            trails[i].pos.y
          );
          if (d <= this.viewDistance) {
            if (
              dist(
                this.pos.x,
                this.pos.y,
                trails[i].food.pos.x,
                trails[i].food.pos.y
              ) <= this.viewDistance
            )
              continue;
            this.mode = "follow";
            this.target = trails[i].food;
            return;
          }
        }
      }
    // if (trail) this.target = trail;
  }

  wanderBack() {
    let trailStillThere = false;
    let trail = new Trail(this.pos.x, this.pos.y, this.index, "food", home);

    for (let i = trails.length - 1; i >= 0; i--) {
      if (this.target == trails[i]) {
        trailStillThere = true;
      }
      if (trails[i].type === "trail" && trails[i].owner === this.index) {
        let d = dist(this.pos.x, this.pos.y, trails[i].pos.x, trails[i].pos.y);
        if (d < this.viewDistance) {
          if (trails[i].lifespan <= trail.lifespan) trail = trails[i];
        }

        if (d < 5) {
          this.target = null;
          trails[i].delete();
          return;
        }
      }
    }
    if (!trailStillThere) this.target = home;
    if (trail.type == "trail") this.target = trail;
  }

  raycast(a, b, c, d) {
    let denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
    let numerator1 = (a.y - c.y) * (d.x - c.x) - (a.x - c.x) * (d.y - c.y);
    let numerator2 = (a.y - c.y) * (b.x - a.x) - (a.x - c.x) * (b.y - a.y);

    // Detect coincident lines (has a problem, read below)
    if (denominator == 0) return numerator1 == 0 && numerator2 == 0;

    let r = numerator1 / denominator;
    let s = numerator2 / denominator;

    return r >= 0 && r <= 1 && s >= 0 && s <= 1;
  }

  update() {
    if (this.target && this.mode == "follow") {
      let d = dist(
        this.pos.x,
        this.pos.y,
        this.target.pos.x,
        this.target.pos.y
      );
      if (d < this.viewDistance) {
        this.target = null;
        this.mode = "wander";
      }
    }
    if (this.hasFood) {
      // add food to trails every 60 frames
      if (frameCount % 15 == 0)
        trails.push(
          new Trail(this.pos.x, this.pos.y, this.index, "food", this.hasFood)
        );
      if (knowHome.checked()) {
        this.target = home;
      } else {
        this.wanderBack();
      }
      //   check if reached home
      let d = dist(this.pos.x, this.pos.y, home.pos.x, home.pos.y);
      if (d <= home.radius) {
        home.food++;
        this.hasFood = null;
        this.target = null;
        this.checkForTrail();
      }
    } else {
      if (frameCount % 15 == 0)
        trails.push(
          new Trail(this.pos.x, this.pos.y, this.index, "trail", home)
        );
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

    // raycast to find intersection with screen edge
    let a = this.pos;
    let b = createVector(
      a.x + this.dir.x * this.viewDistance,
      a.y + this.dir.y * this.viewDistance
    );
    let w1 = createVector(0, 0);
    let w2 = createVector(width, 0);
    let w3 = createVector(width, height);
    let w4 = createVector(0, height);
    // steer away if too close to edge of screen
    if (
      this.raycast(a, b, w1, w2) ||
      this.raycast(a, b, w3, w4) ||
      this.raycast(a, b, w2, w3) ||
      this.raycast(a, b, w4, w1)
    ) {
      // change direction to 90 degrees to the left if too close to left edge
      // this.desiredDirection.rotate(radians(90));
      let v = p5.Vector.mult(this.dir, this.viewDistance);
      v.rotate(random(-PI, PI));
      this.desiredDirection = p5.Vector.sub(v, this.pos);
    }

    if (
      this.pos.x >= width - this.viewDistance / 2 ||
      this.pos.x <= this.viewDistance / 2 ||
      this.pos.y >= height - this.viewDistance / 2 ||
      this.pos.y <= this.viewDistance / 2
    ) {
      this.desiredDirection = p5.Vector.sub(home.pos, this.pos);
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

    // set direction
    this.dir.set(this.velocity);
    this.dir.normalize();

    /* if (this.pos.x >= width - 10) this.pos.x = width - 10;
    if (this.pos.y >= height - 10) this.pos.y = height - 10;
    if (this.pos.x <= 10) this.pos.x = 10;
    if (this.pos.y <= 10) this.pos.y = 10; */
  }
}

class Home {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.radius = 40;
    this.food = 0;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    fill(0, 255, 0);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    fill(0, 0, 0);
    textAlign(CENTER);
    textSize(20);
    text(this.food, 0, this.radius / 2 - (20 * 2) / 3);
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
