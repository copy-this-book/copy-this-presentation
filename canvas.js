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

var fillBlue = false;
var fillYellow = false;
var stars = {};
var texts = [];
var images = [];
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
    this.C = "#2d3e9f";
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

function Text(text, key, pitch) {
    this.text = text;
    this.charCode = key.charCodeAt(0);
    this.fontSize = 0;
    this.S = 1;
    this.stableSize = 100;
    this.stableWidth = field.width * 0.8;
    this.toStart = false;
    this.toStop = true;
    this.pitch = pitch;
    texts.push(this);
}

Text.prototype.Draw = function () {
    f.font = this.fontSize + "px 'Glacial Indifference'";
    f.textAlign = 'center';

    f.fillText(this.text, field.width / 2, field.height / 2);
    if (!this.toStart || (f.measureText(this.text).width > this.stableWidth && this.toStop)) {
        // Don’t make image any larger;
        return;
    }
    this.fontSize += this.S;
    this.S = this.S * 1.03;
    if (this.fontSize > 1600) {
        this.fontSize = 0;
        this.S = 1;
        this.toStart = false;
        this.toStop = true;
    }
};

function Img(path, key, pitch) {
    var self = this;
    this.width = 0;
    this.height = 0;
    this.ratio = 1;
    this.S = 1;
    this.stableSize = 700;
    this.stableWidth = field.width * 0.8;
    this.stableHeight = field.height * 0.8;
    this.toStart = false;
    this.toStop = true;
    this.img = new Image();
    this.imgAvailable = false;
    this.img.onload = function() {
        self.ratio = self.img.height / self.img.width;
        self.imgAvailable = true;
    };
    this.img.src = path;
    this.charCode = key.charCodeAt(0);
    this.pitch = pitch;
    images.push(this);
}

Img.prototype.Draw = function () {
    if(this.imgAvailable) {
        f.drawImage(this.img, (field.width / 2 - .5 * this.width), (field.height / 2 - .5 * this.height), this.width, this.height);
    }
    if (!this.toStart || ((this.height > this.stableHeight || this.width > this.stableWidth) && this.toStop)) {
        // Don’t make image any larger;
        return;
    }
    this.width += this.S;
    this.height += this.S * this.ratio;
    this.S = this.S * 1.03;
    if (this.height > field.height && this.width > field.width) {
        this.width = this.height = 0;
        this.S = 1;
        this.toStart = false;
        this.toStop = true;
    }
};

field.width = window.innerWidth;
field.height = window.innerHeight;

var elements = [
    new Img("./images/author-schema.svg", "q", 0),
    new Img("./images/original-expression-island.svg", "w", 1),
    new Img("./images/graphic-design.svg", "e", 2),
    new Text("Artists create from abstract ideas", "r", 3),

    new Img("./images/square.svg", "a", 4),
    new Text("Online @ 13:15", "s", 5),
    new Img("./images/schema-public-domain.svg", "d", 6),
    new Img("./images/vermeer.svg", "f", 7),

    new Img("./images/elsa.png", "j", 12),
    new Img("./images/rama-deckchair.png", "k", 13),
    new Img("./images/rama-fellatio.png", "l", 14),
    new Img("./images/apartment.jpg", ";", 15),

//    new Text("❤", "n", 16),
    new Text("Short break", "n", 16),
    new Text("Parody?", "m", 17),
    new Text("Quotation?", ",", 18),
    new Img("./images/cover-3d.svg", ".", 19)
];

function draw() {
    requestAnimationFrame(draw);
    if (field.width !== window.innerWidth)
        field.width = window.innerWidth;
    if (field.height !== window.innerHeight)
        field.height = window.innerHeight;

    // Play with the "a" value to create streams...it's fun!
    f.fillStyle = "rgba(255, 251, 105, 0.7)";
    f.fillRect(0, 0, field.width, field.height);

    for (var i = numStars; i < starsToDraw; i++) {
        new Star();
        numStars++;
    }

    for (var star in stars) {
        stars[star].Draw();
    }

    images.forEach(function (image) {
        image.Draw();
    });

    texts.forEach(function (text) {
        text.Draw();
    });

    if (fillBlue) {
        f.fillStyle = "rgba(45, 62, 159, 1)";
        f.fillRect(0, 0, field.width, field.height);
    }

    if (fillYellow) {
        f.fillStyle = "rgba(255, 251, 105, 1)";
        f.fillRect(0, 0, field.width, field.height);
    }

}

draw();

// Create a hash where we can look up elements (images, texts) by charCode or pitch
elementsLookUp = {};
elementsLookUpPitch = {};
elements.forEach(function(e) {
    elementsLookUp[e.charCode] = e;
    elementsLookUpPitch[e.pitch] = e;
});

var i;
var resetElement = function () {
    i = -1;
};
resetElement();
var previousElement = function() {
    if (i === 0) {
        return false;
    }
    if (elements[i] && elements[i].toStart && elements[i].toStop) {
        return elements[i];
    }
    i--;
    console.log(i);
    return elements[i];
};
var nextElement = function() {
    if (i === (elements.length - 1)) {
        return false;
    }
    if (elements[i] && elements[i].toStart && elements[i].toStop) {
        return elements[i];
    }
    i++;
    console.log(i);
    return elements[i];
};

function handleElement(element) {
    if (!element) {
        return;
    }
    if (!element.toStart){
        element.toStart = true;
    } else if (element.toStop) {
        element.toStop = false;
    }
}

document.onkeypress = function(e) {
    e = e || window.event;
    var charCode = (typeof e.which === "number") ? e.which : e.keyCode;
    console.log(charCode);
    console.log("Character typed: " + String.fromCharCode(charCode));

    var element = elementsLookUp[charCode];
    handleElement(element);
};

/* Also allow cycling through the images with the arrow keys */
document.onkeydown = function(e) {
    var el;
    e = e || window.event;
    var charCode = (typeof e.which === "number") ? e.which : e.keyCode;
    console.log(charCode);
    switch(e.which) {
        case 37: // left
            el = previousElement();
            if (el) {
                handleElement(el)
            }
            break;
        case 39: // right
            el = nextElement();
            if (el) {
                handleElement(el)
            }
            break;
        default:
            return; // exit this handler for other keys};
    }
    e.preventDefault();
};

navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function onMIDISuccess(midiAccess) {
    console.log("succesfully requested MIDI access");
    var inputs = midiAccess.inputs.values();
    console.log(inputs);
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = getMIDIMessage;
    }
}

function getMIDIMessage(midiMessage) {
    var data = midiMessage.data;
    // sanity check:
    if (!data || data.length !== 3) {
        return;
    }
    console.log(data);
    // IMAGES
    if ([151, 152].indexOf(data[0]) > -1 && data[2] === 127) {
        var pitch = data[1];
        if (data[0] === 152) {
            pitch += 12;
        }
        console.log(pitch);
        var element = elementsLookUpPitch[pitch];
        handleElement(element);
    }
    // PREVIOUS NEXT
    if (data[0] === 182) {
        if (data[0] && data[1] === 64) {
            var el;
            if (data[2] === 1) {
                el = nextElement();
                if (el) {
                    handleElement(el)
                }
            }
            if (data[2] === 127) {
                el = previousElement();
                if (el) {
                    handleElement(el)
                }
            }
        }
    }
    // BLUE SCREEN
    if (data[0] === 144 && data[1] === 88 && data[2] === 127) {
        fillBlue = true;
    }
    if (data[0] === 144 && data[1] === 88 && data[2] === 0) {
        fillBlue = false;
    }

    if (data[0] === 150 && data[1] === 65 && data[2] === 127) {
        elements.forEach(function (e) {
            if (e.toStart && e.toStop) {
                handleElement(e);
            }
        });
        resetElement();
    }

    /*
    // We are only interested in note on messages,
    // of all channels!!
    if (data[2] === 127) {
        var pitch = data[1];
        if (data[0] === 146) {
            pitch += 12;
        }
        var element = elementsLookUpPitch[pitch];
        handleElement(element);
    } */
}
