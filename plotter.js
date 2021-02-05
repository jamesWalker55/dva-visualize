class Plotter {
	/**
	 * creates a graph
	 * @param  {Object} object   Any object, must be passed by reference
	 * @param  {String} property Which property of the object to plot
	 * @param  {number[]|function[]} boundingBox Array of x, y, width, height
	 * @param  {number|function} min Min value of graph, can be a function
	 * @param  {number|function} max Max value of graph, can be a function
	 * @param  {number} historySize Number of data to store
	 */
	constructor(ctx, object, property, boundingBox, min, max, debug=false) {
		// assign arguments
		this.ctx = ctx;
		this.objToGraph = object;
		this.objProp = property;
		this._min = min;
		this._max = max;
		this.debug = debug;
		this.pos = {};
		this.pos._x = boundingBox[0];
		this.pos._y = boundingBox[1];
		this.pos._width = boundingBox[2];
		this.pos._height = boundingBox[3];
		// setup other variables
		this.wrap = false;
		let historySize = 300;
		this.history = new Array(historySize);
		this.path = {};
		this.lineWidth = 2;
		this._lineWidth = 2;
		this.invert = false;
	}

	static newPathBounding(width, height) {
		let path = new Path2D();
		path.rect(0,0,width,height);
		return path;
	}

	/**
	 * @param  {boolean} wrap Whether to allow wrapping between top and bottom
	 */
	setWrap(wrap) {
		this.wrap = wrap;
	}

	/**
	 * sets line width, can be function
	 * @param {number|function} pixels width of lines
	 */
	setLineWidth(pixels) {
		this._lineWidth = pixels;
	}

	setInvert(invert) {
		this.invert = invert;
	}

	addData() {
		let data = this.objToGraph[this.objProp]
		let normalized = (data-this.min) / (this.max-this.min);
		normalized = Math.min(Math.max(0, normalized), 1)
		if (!this.invert) normalized = 1-normalized;
		if (this.debug) console.log(data, normalized, this.min, this.max);
		this.history.shift();
		this.history.push(normalized);
	}

	update(dt) {
		// get newest data
		this.min = (typeof this._min == "function") ? this._min() : this._min;
		this.max = (typeof this._max == "function") ? this._max() : this._max;
		this.pos.x = (typeof this.pos._x == "function") ? this.pos._x() : this.pos._x;
		this.pos.y = (typeof this.pos._y == "function") ? this.pos._y() : this.pos._y;
		this.pos.width = (typeof this.pos._width == "function") ? this.pos._width() : this.pos._width;
		this.pos.height = (typeof this.pos._height == "function") ? this.pos._height() : this.pos._height;
		this.lineWidth = (typeof this._lineWidth == "function") ? this._lineWidth() : this._lineWidth;
		// offset x, y, width, height by stroke width
		this.pos.x += this.lineWidth/2;
		this.pos.y += this.lineWidth/2;
		this.pos.width -= this.lineWidth;
		this.pos.height -= this.lineWidth;
		// add data
		this.addData();
		this.path.bounding = this.constructor.newPathBounding(this.pos.width, this.pos.height)
	}

	drawBG() {
		// save context
		this.ctx.save();
		this.ctx.translate(this.pos.x-this.lineWidth/2, this.pos.y-this.lineWidth/2);
		// draw bounding box
		this.ctx.fillRect(0,0,this.pos.width+this.lineWidth,this.pos.height+this.lineWidth)
		// restore context
		this.ctx.restore();
	}

	draw() {
		// save context
		this.ctx.save();
		this.ctx.lineWidth = this.lineWidth;
		this.ctx.translate(this.pos.x, this.pos.y);
		// draw bounding box
		this.ctx.stroke(this.path.bounding);
		// draw mid line
		this.ctx.save();
		this.ctx.setLineDash([10]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.pos.x,this.pos.height/2);
		this.ctx.lineTo(this.pos.x+this.pos.width,this.pos.height/2);
		this.ctx.stroke();
		this.ctx.restore();
		// draw graph
		this.drawGraph();
		// restore context
		this.ctx.restore();
	}

	drawGraph(width, height) {
		let dx = this.pos.width/(this.history.length-1);
		// move to current origin
		this.ctx.moveTo(0,0);
		this.ctx.beginPath();
		if (this.wrap) {
			for (var i = 0; i < this.history.length; i++) {
				// let previous = this.history[i-1];
				if (Math.abs(this.history[i-1]-this.history[i]) > 0.95) {
					this.ctx.moveTo(i*dx, this.history[i]*this.pos.height);
				} else {
					this.ctx.lineTo(i*dx, this.history[i]*this.pos.height);
				}
			}
		} else {
			for (var i = 0; i < this.history.length; i++) {
				this.ctx.lineTo(i*dx, this.history[i]*this.pos.height);
			}
		}
		this.ctx.stroke();
	}
}