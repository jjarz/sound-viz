let mic, fft;
let started = false;
let angle = 0;
let branches = 5;
let maxLevel = 4;

function setup() {
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6);
    canvas.parent('canvas-container');
    
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    fft.setInput(mic);
    
    colorMode(HSB);
    angleMode(DEGREES);
    
    const startButton = select('#startButton');
    startButton.mousePressed(toggleAudio);
}

function draw() {
    background(0, 0, 0, 10);
    translate(width/2, height/2);
    
    if (started) {
        let spectrum = fft.analyze();
        let waveform = fft.waveform();
        
        // Calculate different frequency bands for more detailed reactivity
        let bass = fft.getEnergy("bass");
        let mid = fft.getEnergy("mid");
        let treble = fft.getEnergy("treble");
        
        // Use bass for rotation speed
        angle += map(bass, 0, 255, 0.2, 2);
        
        // Use mid frequencies for branch count
        branches = map(mid, 0, 255, 3, 8);
        
        // Use treble for complexity (levels)
        maxLevel = map(treble, 0, 255, 2, 5);
        
        // Draw multiple layers of fractals
        for(let i = 0; i < 3; i++) {
            push();
            rotate(angle * (i * 0.5));
            
            // Draw main fractal
            drawFractal(0, 0, 200 + bass, 0, 0);
            
            // Draw mirror fractal
            rotate(180);
            drawFractal(0, 0, 200 + bass, 0, 0);
            pop();
        }
        
        // Add circular audio waveform
        push();
        noFill();
        beginShape();
        for (let i = 0; i < waveform.length; i++) {
            let r = map(waveform[i], -1, 1, 100, 200);
            let x = r * cos(i * 360/waveform.length);
            let y = r * sin(i * 360/waveform.length);
            let hue = map(i, 0, waveform.length, 160, 280);
            stroke(hue, 100, 100, 0.5);
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    } else {
        // Show waiting message
        push();
        translate(-width/2, -height/2); // Reset translation for text
        textAlign(CENTER, CENTER);
        textSize(24);
        fill(255);
        noStroke();
        text('Click "Start Microphone" to begin', width/2, height/2);
        pop();
    }
}

function drawFractal(x, y, size, level, branchAngle) {
    if (level >= maxLevel) return;
    
    // Get current audio data for visual effects
    let spectrum = fft.analyze();
    let energy = fft.getEnergy("bass", "treble");
    
    // Calculate color based on level and energy
    let hue = map(level, 0, maxLevel, 160, 280);
    let brightness = map(energy, 0, 255, 50, 100);
    
    // Draw connecting lines
    for (let i = 0; i < branches; i++) {
        let angle = (360 / branches) * i + branchAngle;
        let newSize = size * 0.67;
        
        // Calculate end points with some wave motion
        let endX = x + cos(angle + angle) * size;
        let endY = y + sin(angle + angle) * size;
        
        // Add some wave effect based on audio
        let wave = map(energy, 0, 255, 1, 1.5);
        endX *= wave;
        endY *= wave;
        
        // Draw line with glow effect
        push();
        for(let j = 3; j > 0; j--) {
            stroke(hue, 100, brightness, 1/j);
            strokeWeight(j * 2);
            line(x, y, endX, endY);
        }
        pop();
        
        // Recursive call for next level
        drawFractal(endX, endY, newSize, level + 1, angle);
    }
    
    // Add central point with glow
    push();
    for(let i = 3; i > 0; i--) {
        fill(hue, 100, brightness, 1/i);
        noStroke();
        circle(x, y, i * 5);
    }
    pop();
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