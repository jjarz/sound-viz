let mic, fft;
let started = false;
let currentStyle = 1;
let spectrum;
let waveform;
let angle = 0;
let particles = [];
let matrix = [];
const PARTICLE_COUNT = 100;

function setup() {
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6, WEBGL); // Fixed: WebGL -> WEBGL
    canvas.parent('canvas-container');
    
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    
    colorMode(RGB);
    
    // Initialize particles for style 4
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: random(-width/2, width/2),
            y: random(-height/2, height/2),
            size: random(2, 8),
            speedX: random(-2, 2),
            speedY: random(-2, 2)
        });
    }

    // Initialize matrix for style 6
    for (let i = 0; i < 30; i++) {
        matrix[i] = {
            x: random(width),
            y: random(-height, 0),
            speed: random(5, 15),
            value: floor(random(2))
        };
    }
    
    const startButton = select('#startButton');
    startButton.mousePressed(toggleAudio);
}

function toggleAudio() {
    if (!started) {
        // Start audio context on user gesture
        userStartAudio().then(() => {
            mic.start();
            fft.setInput(mic);
            started = true;
            select('#startButton').html('Stop Microphone');
        }).catch(err => {
            console.error('Error starting audio:', err);
        });
    } else {
        mic.stop();
        started = false;
        select('#startButton').html('Start Microphone');
    }
}

function displayStartMessage() {
    push();
    translate(-width/2, -height/2); // Adjust for WEBGL mode
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Click "Start Microphone" to begin', width/2, height/2);
    pop();
}

// [Rest of your visualization functions remain the same...]

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.6);
}