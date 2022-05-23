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
      fill(255, 0, 0, this.lifespan);
      ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
    } else {
      fill(0, 0, 255, this.lifespan);
      ellipse(this.pos.x, this.pos.y, this.radius, this.radius);
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
    this.maxSpeed = 2;
    this.steerStrength = 0.1;
    this.velocity = createVector(0, 0);

    this.fov = PI / 3;
    this.viewDistance = 100;

    this.wanderStrength = 0.2;

    this.desiredDirection = p5.Vector.random2D();

    this.target = null;

    this.hasFood = null;

    this.mode = "wander";
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.dir.heading());
    fill(0);
    triangle(0, 0, 20 / 1.5, 10 / 1.5, 0, 20 / 1.5);
    if (this.hasFood) {
      stroke(0);
      fill(0, 255, 0);
      ellipse(20 / 1.5, 10 / 1.5, 10, 10);
    }
    // draw fov arc
    noStroke();
    // make it start from tip of ant

    fill(255, 0, 0, 30);
    arc(
      20 / 1.5,
      10 / 1.5,
      this.viewDistance * 2,
      this.viewDistance * 2,
      -this.fov / 2,
      this.fov / 2
    );
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
        this.target = home;
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
        let angle = atan2(
          food[i].pos.y - this.pos.y,
          food[i].pos.x - this.pos.x
        );
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
        // if (trails[i].type === "food") {
        let d = dist(this.pos.x, this.pos.y, trails[i].pos.x, trails[i].pos.y);
        /* if (d <= 5) {
          this.target = null;
        } */
        if (d <= this.viewDistance) {
          this.mode = "follow";
          this.target = trails[i].food;
          return;
          /* let angle = atan2(
              trails[i].pos.y - this.pos.y,
              trails[i].pos.x - this.pos.x
            );
            if (angle > -this.fov / 2 && angle < this.fov / 2) { */
          /* if (trails[i].lifespan <= weakest) {
            weakest = trails[i].lifespan;
            trail = trails[i];
          } */
          // }
          // }
        }
      }
    // if (trail) this.target = trail;
  }

  wanderBack() {
    let trailStillThere = false;
    let trail = new Trail(this.pos.x, this.pos.y, this.index, "food");

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
          // trails.splice(i, 1);
          this.target = null;
          trails[i].delete();
          return;
        }
      }
    }
    if (!trailStillThere) this.target = null;
    if (trail.type == "trail") this.target = trail;
  }

  update() {
    if (this.target && this.mode == "follow") {
      let d = dist(
        this.pos.x,
        this.pos.y,
        this.target.pos.x,
        this.target.pos.y
      );
      if (d <= 100) {
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
      // this.wanderBack();
      //   check if reached home
      let d = dist(this.pos.x, this.pos.y, home.pos.x, home.pos.y);
      if (d <= home.radius) {
        home.food++;
        this.hasFood = null;
        this.target = null;
        this.checkForTrail();
      }
    } else {
      // if (frameCount % 15 == 0)
      // trails.push(new Trail(this.pos.x, this.pos.y, this.index, "trail"));
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

    // steer away if too close to edge of screen
    if (
      this.pos.x < this.viewDistance ||
      this.pos.x > width - this.viewDistance ||
      this.pos.y < this.viewDistance ||
      this.pos.y > height - this.viewDistance
    ) {
      // raycast to find intersection with screen edge
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.dir.x * this.viewDistance,
        this.pos.y + this.dir.y * this.viewDistance
      );
      // draw the ray
      /* let angle = atan2(
        this.pos.y - this.target.pos.y,
        this.pos.x - this.target.pos.x
      );
      if (angle > -this.fov / 2 && angle < this.fov / 2) {
        this.desiredDirection.rotate(PI);
      } */
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

    if (this.pos.x >= width - 10) this.pos.x = width - 10;
    if (this.pos.y >= height - 10) this.pos.y = height - 10;
    if (this.pos.x <= 10) this.pos.x = 10;
    if (this.pos.y <= 10) this.pos.y = 10;
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
