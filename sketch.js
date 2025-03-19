let mic, fft;
let started = false;
let angle = 0;
let rings = 5;
let particles = [];

function setup() {
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6);
    canvas.parent('canvas-container');
    
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    fft.setInput(mic);
    
    colorMode(HSB);
    angleMode(DEGREES);
    
    // Initialize particles
    for (let i = 0; i < 200; i++) {
        particles.push(new Particle());
    }
    
    const startButton = select('#startButton');
    startButton.mousePressed(toggleAudio);
}

function draw() {
    background(0, 0, 0, 15);
    translate(width/2, height/2);
    
    if (started) {
        let spectrum = fft.analyze();
        let bass = fft.getEnergy("bass");
        let mid = fft.getEnergy("mid");
        let treble = fft.getEnergy("treble");
        
        // Rotate based on bass
        angle += map(bass, 0, 255, 0.1, 1);
        
        // Draw main mandala
        for (let ring = 0; ring < rings; ring++) {
            let ringRadius = map(ring, 0, rings - 1, 50, 200);
            let segments = 12 + ring * 4;
            
            push();
            rotate(angle * (ring % 2 ? -0.5 : 0.5));
            
            // Draw segments
            for (let i = 0; i < segments; i++) {
                let segmentAngle = (360 / segments) * i;
                let energy = map(spectrum[i % spectrum.length], 0, 255, 0.5, 1.5);
                
                push();
                rotate(segmentAngle);
                
                // Draw geometric pattern
                beginShape();
                noFill();
                for (let j = 0; j < 3; j++) {
                    let alpha = map(j, 0, 2, 1, 0.2);
                    stroke(200 + ring * 10, 80, 100, alpha);
                    strokeWeight(2 - j * 0.5);
                    
                    let x1 = ringRadius * energy;
                    let x2 = (ringRadius + 20) * energy;
                    
                    vertex(x1 * cos(0), x1 * sin(0));
                    bezierVertex(
                        x2 * cos(30), x2 * sin(30),
                        x2 * cos(60), x2 * sin(60),
                        x1 * cos(90), x1 * sin(90)
                    );
                }
                endShape();
                pop();
            }
            pop();
        }
        
        // Update and draw particles
        for (let particle of particles) {
            particle.update(bass, mid, treble);
            particle.draw();
        }
        
        // Draw center mandala
        push();
        rotate(-angle * 0.2);
        for (let i = 0; i < 8; i++) {
            let energyIndex = i * 4;
            let energy = map(spectrum[energyIndex], 0, 255, 20, 50);
            
            push();
            rotate(i * 45);
            noFill();
            for (let j = 0; j < 3; j++) {
                stroke(220, 80, 100, 1 - j * 0.3);
                strokeWeight(3 - j);
                arc(0, 0, energy + j * 10, energy + j * 10, -30, 30);
            }
            pop();
        }
        pop();
    } else {
        displayStartMessage();
    }
}

class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.angle = random(360);
        this.radius = random(50, 200);
        this.speed = random(0.2, 1);
        this.size = random(2, 5);
        this.hue = random(180, 260);
    }
    
    update(bass, mid, treble) {
        this.angle += this.speed;
        this.radius += sin(this.angle * 0.1) * 0.5;
        
        if (this.radius < 30 || this.radius > 250) {
            this.reset();
        }
    }
    
    draw() {
        let x = cos(this.angle) * this.radius;
        let y = sin(this.angle) * this.radius;
        
        push();
        translate(x, y);
        noStroke();
        for (let i = 0; i < 3; i++) {
            fill(this.hue, 80, 100, 1 - i * 0.3);
            circle(0, 0, this.size + i * 2);
        }
        pop();
    }
}

function displayStartMessage() {
    push();
    translate(-width/2, -height/2);
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255);
    noStroke();
    text('Click "Start Microphone" to begin', width/2, height/2);
    pop();
}

function toggleAudio() {
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