"use strict";

function mod(n, m) {
	return ((n % m) + m) % m;
}

function pathCircle(radius) {
	let circle = new Path2D();
	circle.arc(0, 0, radius, 0, 2 * Math.PI);
	return circle;
}

function windowWidth() {
	return document.getElementById("full-screen").clientWidth;
}

function windowHeight() {
	return document.getElementById("full-screen").clientHeight;
}

function averageWindowSides() {
	let width = document.getElementById("full-screen").clientWidth;
	let height = document.getElementById("full-screen").clientHeight;
	return (width+height)/2;
}