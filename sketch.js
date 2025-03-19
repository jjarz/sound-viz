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
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6, WebGL);
    canvas.parent('canvas-container');
    
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    fft.setInput(mic);
    
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

function draw() {
    background(0);
    
    if (started) {
        spectrum = fft.analyze();
        waveform = fft.waveform();
        
        switch(currentStyle) {
            case 1:
                drawWaveLayers();
                break;
            case 2:
                drawSpectrumBars();
                break;
            case 3:
                draw3DBlob();
                break;
            case 4:
                drawParticles();
                break;
            case 5:
                drawCircularSpectrum();
                break;
            case 6:
                drawMatrix();
                break;
        }
    } else {
        displayStartMessage();
    }
}

// [Previous functions remain the same: drawWaveLayers, drawSpectrumBars, draw3DBlob]

function drawParticles() {
    translate(-width/2, -height/2);
    let bassValue = fft.getEnergy("bass");
    let trebleValue = fft.getEnergy("treble");
    
    // Update and draw particles
    for (let p of particles) {
        // Modify particle behavior based on audio
        let speedMult = map(bassValue, 0, 255, 1, 2);
        p.x += p.speedX * speedMult;
        p.y += p.speedY * speedMult;
        
        // Create connections between nearby particles
        for (let other of particles) {
            let d = dist(p.x, p.y, other.x, other.y);
            if (d < 100) {
                stroke(0, 255, 255, map(d, 0, 100, 255, 0));
                strokeWeight(1);
                line(p.x, p.y, other.x, other.y);
            }
        }
        
        // Particle appearance
        let size = p.size + map(trebleValue, 0, 255, 0, 5);
        fill(0, 255, 255);
        noStroke();
        circle(p.x, p.y, size);
        
        // Screen wrapping
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
    }
}

function drawCircularSpectrum() {
    let bassValue = fft.getEnergy("bass");
    let midValue = fft.getEnergy("mid");
    
    // Rotate the entire visualization
    rotateZ(frameCount * 0.01);
    
    // Draw multiple circular layers
    for (let layer = 0; layer < 3; layer++) {
        let radius = 100 + layer * 50 + map(bassValue, 0, 255, 0, 30);
        let points = spectrum.length / 3;
        
        beginShape();
        noFill();
        strokeWeight(2);
        
        for (let i = 0; i < points; i++) {
            let angle = map(i, 0, points, 0, TWO_PI);
            let amp = spectrum[i + layer * points];
            let r = radius + map(amp, 0, 255, 0, 100);
            let x = r * cos(angle);
            let y = r * sin(angle);
            
            // Color based on frequency and layer
            let hue = map(i, 0, points, 0, 255);
            stroke(hue, 255, 255);
            
            vertex(x, y);
            
            // Add some decorative elements
            if (amp > 200) {
                push();
                translate(x, y);
                rotate(angle);
                line(0, 0, 20, 0);
                pop();
            }
        }
        endShape(CLOSE);
    }
}

function drawMatrix() {
    translate(-width/2, -height/2);
    let bassValue = fft.getEnergy("bass");
    textSize(14);
    textAlign(CENTER, CENTER);
    
    // Update and draw matrix characters
    for (let char of matrix) {
        // Speed affected by bass
        char.y += char.speed * map(bassValue, 0, 255, 0.5, 2);
        
        // Color based on position and audio
        let greenValue = map(char.y, 0, height, 255, 50);
        fill(0, greenValue, 0);
        
        // Draw character
        text(char.value, char.x, char.y);
        
        // Randomly change value
        if (random(1) < 0.1) {
            char.value = floor(random(2));
        }
        
        // Reset position when reaching bottom
        if (char.y > height) {
            char.y = 0;
            char.x = random(width);
        }
    }
}

function changeStyle(style) {
    currentStyle = style;
    // Reset any style-specific variables if needed
    if (style === 4) {
        // Reset particles
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: random(-width/2, width/2),
                y: random(-height/2, height/2),
                size: random(2, 8),
                speedX: random(-2, 2),
                speedY: random(-2, 2)
            });
        }
    }
}

// [Previous functions remain the same: toggleAudio, windowResized]