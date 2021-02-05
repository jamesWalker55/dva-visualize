class Slider {
	constructor(ctx, initValue, boundingBox) {
		this.ctx = ctx;
		this.value = initValue;
		this.pos = {};
		this.pos._x = boundingBox[0];
		this.pos._y = boundingBox[1];
		this.pos._width = boundingBox[2];
		this.pos._height = boundingBox[3];
		// other vars
		this.update()
		this.ballPos = this.valueToBallPos(initValue);
		this.lineWidth = 2;
		this._lineWidth = 2;
		this.active_choice = "DIS";
		this.text_ratio = 0.8;
		this.text_buttons = {
			"DIS": {
				"color": "#81b29a",
				"l_offset": 0,
			},
			"VEL": {
				"color": "#f2cc8f",
				"l_offset": 1.8,
			},
			"ACC": {
				"color": "#e07a5f",
				"l_offset": 3.8,
			},
		}
		this.dragging_ball = false;
	}

	mousedown(mouseX, mouseY) {
		// text buttons
		let fontSize = this.pos.height*this.text_ratio;
		let textBox = [fontSize*2.5, fontSize];
		let h = this.pos.height;
		if (this._text_offset) {
			let offset_x = this._text_offset[0];
			let offset_y = this._text_offset[1];
			if (offset_y-textBox[1] < mouseY && mouseY < offset_y) {
				// at bar vertically
				for (let text in this.text_buttons) {
					let l_offset = this.text_buttons[text].l_offset;
					if (h*l_offset < mouseX && mouseX < h*(l_offset+1.6)) {
						this.active_choice = text;
					}
				}
				if (mouseX>h*6.0) {
					this.dragging_ball = true;
				}
			}
		}
	}

	ballPosToValue(x) {
		let h = this.pos.height;
		let l_limit = h*6.3;
		let r_limit = this.pos.x+this.pos.width-h*0.5;
		// let limited = Math.max(Math.min(x, r_limit), l_limit)
		return (x-l_limit)/(r_limit-l_limit);
	}

	valueToBallPos(value) {
		let h = this.pos.height;
		let l_limit = h*6.3;
		let r_limit = this.pos.x+this.pos.width-h*0.5;
		console.log(value, (r_limit-l_limit), l_limit);
		return value*(r_limit-l_limit)+l_limit;
	}

	mousemove(mouseX, mouseY) {
		if (this.dragging_ball) {
			let h = this.pos.height;
			let value, ballPos;
			let l_limit = h*6.3;
			let r_limit = this.pos.x+this.pos.width-h*0.5;
			this.ballPos = Math.max(Math.min(mouseX, r_limit), l_limit)
			this.value = this.ballPosToValue(this.ballPos);
		}
		// console.log(this.value);
	}

	mouseup(mouseX, mouseY) {
		this.dragging_ball = false;
	}

	/**
	 * sets line width, can be function
	 * @param {number|function} pixels width of lines
	 */
	setLineWidth(pixels) {
		this._lineWidth = pixels;
	}

	update() {
		// get newest data
		this.pos.x = (typeof this.pos._x == "function") ? this.pos._x() : this.pos._x;
		this.pos.y = (typeof this.pos._y == "function") ? this.pos._y() : this.pos._y;
		this.pos.width = (typeof this.pos._width == "function") ? this.pos._width() : this.pos._width;
		this.pos.height = (typeof this.pos._height == "function") ? this.pos._height() : this.pos._height;
		this.lineWidth = (typeof this._lineWidth == "function") ? this._lineWidth() : this._lineWidth;
	}

	drawText() {
		let h = this.pos.height;
		let font_inactive = h*this.text_ratio+"px sans-serif";
		let font_active = "bold "+h*this.text_ratio+"px sans-serif";
		function drawLabel(text, offset) {
			if (this.active_choice == text) {
				this.ctx.fillStyle = this.text_buttons[text].color;
				this.ctx.font = font_active;
			} else {
				this.ctx.fillStyle = "#f4f1de";
				this.ctx.font = font_inactive;
			}
			this.ctx.fillText(text, this.text_buttons[text].l_offset*h, 0);
		}
		this.ctx.save();
		this.ctx.textBaseline = "alphabetic";
		this.ctx.translate(h/5, h*(this.text_ratio/2 + 0.5));
		let transform = this.ctx.getTransform();
		this._text_offset = [transform.e, transform.f];
		drawLabel.call(this, 'DIS');
		drawLabel.call(this, 'VEL');
		drawLabel.call(this, 'ACC');
		this.ctx.restore();
	}

	drawBar() {
		let h = this.pos.height;
		this.ctx.save();
		this.ctx.strokeStyle = "#f4f1de";
		this.ctx.beginPath();
		this.ctx.moveTo(h*6.3,this.pos.height/2+this.lineWidth/2);
		this.ctx.lineTo(this.pos.x+this.pos.width-h*0.5,this.pos.height/2+this.lineWidth/2);
		this.ctx.stroke();
		this.ctx.restore();
	}

	drawBall() {
		let h = this.pos.height;
		this.ctx.save();
		this.ctx.translate( h*6.3 , this.pos.height/2+this.lineWidth/2 );
		this.ctx.fillStyle = this.text_buttons[this.active_choice].color;
		this.ctx.arc( this.ballPos-h*6.3 , 0 , h/3.5 , 0 , 2 * Math.PI);
		this.ctx.fill();
		this.ctx.restore();
	}

	draw() {
		// save context
		this.ctx.save();
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.translate(this.pos.x, this.pos.y);
		this.ctx.fillRect(0,0,this.pos.width+this.lineWidth,this.pos.height+this.lineWidth)
		this.drawBar();
		this.drawBall();
		this.drawText();
		// restore context
		this.ctx.restore();
	}
}