"use strict";

class Circle {
	constructor(ctx, x, y, radius) {
		this.ctx = ctx;
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.path = this.constructor.newPath2D(radius);
	}

	get coord() {
		return [this.x, this.y];
	}

	move_to(x,y) {
		this.x = x;
		this.y = y;
	}

	move_by(x,y) {
		this.move_to(this.x+x, this.y+y)
	}

	update(dt) {
		// dt is ms*1000
	}

	draw(mode="fill") {
		this.ctx.save();
		this.ctx.translate(this.x, this.y);
		if (mode=="fill") {
			this.ctx.fill(this.path);
		} else {
			this.ctx.stroke(this.path);
		}
		this.ctx.restore();
	}

	static newPath2D(radius) {
		let path = new Path2D();
		path.arc(0, 0, radius, 0, 2 * Math.PI);
		return path;
	}
}

class WrappingCircle extends Circle {
	constructor(ctx, x, y, radius) {
		super(ctx, x, y, radius);
		this.speed = 0;
		this.accel = 0;
	}

	linkSlider(slider) {
		this.slider = slider;
	}

	/**
	 * determine speed of circle
	 * @return {number} pixels per second
	 */
	setSpeed(mouseX, mouseY) {
		// let new_speed = this.speed - 200;
		// if (new_speed<-2000) new_speed += 2000*2;
		// return new_speed;
		switch (this.slider.active_choice) {
			case "DIS":
			this.x = this.slider.value * windowWidth();
			if (this.last_x) {
				if (!this.last_speed) {
					this.speed = (this.x-this.last_x)*50
					this.last_speed = this.speed
				} else {
					this.speed = ((this.x-this.last_x)*50 + this.last_speed) / 2
					this.last_speed = this.speed
				}
				this.last_x = this.x
			} else {
				this.speed = 0
				this.last_x = this.x
			}
			return;
			case "VEL":
			this.speed = (this.slider.value-0.5)*3000;
			return;
			case "ACC":
			this.speed += (this.slider.value-0.5)*20;
			return;
		}
	}

	/**
	 * update accel attribute, used by graphs
	 */
	updateAccel() {
		this._prev_accel = this.accel;
		if ( !(this.previous_speed === undefined) ) {
			if (!this._prev_accel) {
				this.accel = this.speed-this.previous_speed;
			} else {
				this.accel = ((this.speed-this.previous_speed)+this._prev_accel)/2;
			}
			
		}
	}

	set_y(y) {
		this.move_to(this.x, y);
	}

	update(dt, mouseX, mouseY) {
		if (dt==0) return;

		super.update(dt);

		this.previous_speed = this.speed;
		this.setSpeed(mouseX, mouseY);
		this.updateAccel();
		if (this.slider.active_choice=="VEL" || this.slider.active_choice=="ACC") {
			this.move_by(this.speed*dt/1000, 0);
		}
		this.set_y(windowHeight()/9*7.75);
	}

	move_to(x,y) {
		let mod_x = mod(x + this.radius, this.ctx.canvas.clientWidth + this.radius*2)-this.radius
		let mod_y = mod(y + this.radius, this.ctx.canvas.clientHeight + this.radius*2)-this.radius
		super.move_to(mod_x,mod_y);
	}
}