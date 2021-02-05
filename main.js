"use strict";

class TimeKeeper {
	constructor() {
		this.now = this.constructor.getSecAndMilisec();
		this.dt = 0;
	}

	step() {
		let previous_time = this.now;
		this.now = this.constructor.getSecAndMilisec();
		this.dt = this.now - previous_time;
		if (this.dt<0) this.dt += 60000;
	}

	static getSecAndMilisec() {
		let time = new Date();
		return time.getSeconds()*1000 + time.getMilliseconds();
	}
}

function getCanvas() {
	return document.getElementById("canvas");
}

function startLoop(memory) {
	update(memory);
}


function lineWidthFunction(num) {
	let side = windowHeight();
	return side/num;
}

function init() {
	let mem = {};
	mem.ctx = getCanvas().getContext("2d");
	// circle
	mem.circle = new WrappingCircle(mem.ctx, 0, 100, 30);
	// plots
	mem.plotAccel = new Plotter( mem.ctx,
		mem.circle, "accel",
		[0,0,windowWidth,()=>windowHeight()/9*2],
		-60,
		60);
	mem.plotAccel.setLineWidth(()=>lineWidthFunction(120));
	mem.plotVelo = new Plotter( mem.ctx,
		mem.circle, "speed",
		[0,()=>windowHeight()/9*2,windowWidth,()=>windowHeight()/9*2],
		-2000,
		2000);
	mem.plotVelo.setLineWidth(()=>lineWidthFunction(120));
	mem.plotDisp = new Plotter( mem.ctx,
		mem.circle, "x",
		[0,()=>windowHeight()/9*4,windowWidth,()=>windowHeight()/9*2],
		0,
		windowWidth);
	mem.plotDisp.setLineWidth(()=>lineWidthFunction(120));
	mem.plotDisp.setWrap(true);
	// slider
	mem.slider = new Slider(mem.ctx, 0.5,
		[0,()=>windowHeight()/9*6,windowWidth,()=>windowHeight()/9*0.5])
	mem.slider.setLineWidth(()=>lineWidthFunction(300));
	mem.circle.linkSlider(mem.slider);
	return mem;
}

function update(mem) {
	tk.step();
	// do calculations
	mem.plotAccel.update(tk.dt);
	mem.plotVelo.update(tk.dt);
	mem.plotDisp.update(tk.dt);
	mem.circle.update(tk.dt, mem.mouseX, mem.mouseY);
	mem.slider.update();
	// call draw
	window.requestAnimationFrame(()=>draw(mem));
}

function draw(mem) {
	let ctx = mem.ctx
	ctx.clearRect(0,0,windowWidth(),windowHeight());
	// draw stuff
	// ctx.lineWidth = 2;
	// diuasghdsakjdaskbdajsdlkja
	ctx.strokeStyle = "#e07a5f";
	mem.plotAccel.draw();
	ctx.strokeStyle = "#f2cc8f";
	mem.plotVelo.draw();
	ctx.strokeStyle = "#81b29a";
	mem.plotDisp.draw();
	ctx.strokeStyle = '#3d405b';
	ctx.fillStyle = '#3d405b';
	mem.slider.draw();
	ctx.lineWidth = lineWidthFunction(100);
	mem.circle.draw("stroke");
	// call update
	update(mem)
}

function setupEvents(mem) {
	window.addEventListener('resize', resizeCanvas);
	getCanvas().addEventListener('mousemove', e => setMousePos(e, mem));
	// slider events
	getCanvas().addEventListener('mousedown', e => mem.slider.mousedown(e.offsetX, e.offsetY));
	getCanvas().addEventListener('mousemove', e => mem.slider.mousemove(e.offsetX, e.offsetY));
	getCanvas().addEventListener('mouseup', e => mem.slider.mouseup(e.offsetX, e.offsetY));
}

function resizeCanvas() {
	let width = document.getElementById("full-screen").clientWidth;
	let height = document.getElementById("full-screen").clientHeight;
	getCanvas().width  = width;
	getCanvas().height = height;
}

function setMousePos(e, mem) {
	mem.mouseX = e.clientX;
	mem.mouseY = e.clientY;
}

let tk = new TimeKeeper()
let mem = init();
setupEvents(mem);
resizeCanvas()
startLoop(mem);