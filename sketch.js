let mic, fft;
let started = false;
let particles = [];
const numParticles = 100;

function setup() {
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6);
    canvas.parent('canvas-container');
    
    // Initialize audio input and FFT
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    
    // Connect mic to FFT for analysis
    fft.setInput(mic);
    
    // Create particles
    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }
    
    // Initial styling
    colorMode(HSB);
    noFill();
    
    // Setup button handler
    const startButton = select('#startButton');
    startButton.mousePressed(toggleAudio);
}

class Particle {
    constructor() {
        this.reset();
        this.angle = random(TWO_PI);
        this.radius = random(50, 150);
        this.speed = random(0.02, 0.05);
    }
    
    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.size = random(2, 5);
        this.alpha = 255;
        this.hue = random(160, 280); // Blue to purple range
    }
    
    update(energy) {
        this.angle += this.speed * energy;
        this.radius += energy * 0.5;
        
        if (this.radius > max(width, height)) {
            this.reset();
        }
        
        this.x = width/2 + cos(this.angle) * this.radius;
        this.y = height/2 + sin(this.angle) * this.radius;
    }
    
    draw() {
        stroke(this.hue, 100, 100, this.alpha);
        strokeWeight(this.size);
        point(this.x, this.y);
    }
}

function draw() {
    background(0, 0, 0, 20); // Slight trail effect
    
    if (started) {
        // Analyze the audio
        let spectrum = fft.analyze();
        let waveform = fft.waveform();
        
        // Calculate average energy
        let energy = 0;
        for (let i = 0; i < spectrum.length; i++) {
            energy += spectrum[i];
        }
        energy = energy / spectrum.length / 255;
        
        // Update and draw particles
        push();
        blendMode(ADD);
        particles.forEach(p => {
            p.update(energy);
            p.draw();
        });
        pop();
        
        // Draw center circle
        let radius = 100 + energy * 50;
        noFill();
        strokeWeight(2);
        for (let i = 0; i < 3; i++) {
            let alpha = map(i, 0, 2, 255, 50);
            stroke(200, 100, 100, alpha);
            circle(width/2, height/2, radius + i * 10);
        }
        
        // Draw waveform
        push();
        beginShape();
        noFill();
        strokeWeight(2);
        stroke(200, 100, 100, 100);
        for (let i = 0; i < waveform.length; i++) {
            let angle = map(i, 0, waveform.length, 0, TWO_PI);
            let r = map(waveform[i], -1, 1, radius - 20, radius + 20);
            let x = width/2 + cos(angle) * r;
            let y = height/2 + sin(angle) * r;
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
        
    } else {
        // Show waiting message
        textAlign(CENTER, CENTER);
        textSize(24);
        fill(255);
        noStroke();
        text('Click "Start Microphone" to begin', width/2, height/2);
    }
}

window.toggleAudio = function() {
    if (!started) {
        userStartAudio();
        mic.start();
        started = true;
        select('#startButton').html('Stop Microphone');
    } else {
        mic.stop();
        started = false;
        select('#startButton').html('Start Microphone');
    }
}

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.6);
}