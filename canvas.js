/**
    Copyright (c) 2018 by David Zakrzewski (https://codepen.io/bts/pen/BygMzB)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var field = document.getElementById("field");
var f = field.getContext("2d");

var stars = {};
var starIndex = 0;
var numStars = 0;
var acceleration = 1;
var starsToDraw = (field.width * field.height) / 200;
if (getUrlParameter("stars")) {
    starsToDraw = getUrlParameter("stars");
}
if (getUrlParameter("accel")) {
    acceleration = getUrlParameter("accel");
}


function Star() {
    // all stars come from the middle
    this.X = field.width / 2;
    this.Y = field.height / 2;

    // the star gets a speed in a random direction
    this.SX = Math.random() * 10 - 5;
    this.SY = Math.random() * 10 - 5;

    // the star does not start exactly in the middle, but rather somewhere within a square in the center
    var start = field.width > field.height ? field.width : field.height;

    this.X += this.SX * start / 10;
    this.Y += this.SY * start / 10;

    // when first drawn the stars are 1x1 pixel
    this.W = 1;
    this.H = 1;

    this.age = 0;

    starIndex++;
    stars[starIndex] = this;

    this.ID = starIndex;
    this.C = "#ffffff";
}

Star.prototype.Draw = function () {
    // displace position by speed
    this.X += this.SX;
    this.Y += this.SY;

    // the speed is multiplied by 1.02
    this.SX += this.SX / (50 / acceleration);
    this.SY += this.SY / (50 / acceleration);

    this.age++;

    // At three moments in their lifecycle, the size gets bigger for the star
    if (this.age === Math.floor(50 / acceleration) || this.age === Math.floor(150 / acceleration) || this.age === Math.floor(300 / acceleration)) {
        this.W++;
        this.H++;
    }

    // If the star gets out of the frame, we delete it
    if (this.X + this.W < 0 || this.X > field.width ||
        this.Y + this.H < 0 || this.Y > field.height)
    {
        delete stars[this.ID];
        numStars--;
    }

    // draw the star
    f.fillStyle = this.C;
    f.fillRect(this.X, this.Y, this.W, this.H);
};

field.width = window.innerWidth;
field.height = window.innerHeight;

function draw() {
    if (field.width !== window.innerWidth)
        field.width = window.innerWidth;
    if (field.height !== window.innerHeight)
        field.height = window.innerHeight;

    // Play with the "a" value to create streams...it's fun!
    f.fillStyle = "rgba(0, 0, 0, 0.8)";
    f.fillRect(0, 0, field.width, field.height);

    for (var i = numStars; i < starsToDraw; i++) {
        new Star();
        numStars++;
    }

    for (var star in stars) {
        stars[star].Draw();
    }
}

// Original timing of the screensaver
setInterval(draw, 40);
