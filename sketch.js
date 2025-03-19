let mic, fft;
let started = false;
let currentStyle = 1;
let spectrum;
let waveform;
let angle = 0;

function setup() {
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6, WebGL);
    canvas.parent('canvas-container');
    
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    fft.setInput(mic);
    
    colorMode(RGB);
    
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
            // Add more cases for other styles
        }
    } else {
        displayStartMessage();
    }
}

function drawWaveLayers() {
    translate(-width/2, -height/2); // Reset WebGL transform for 2D drawing
    noFill();
    
    // Draw multiple wave layers with different colors and offsets
    for (let j = 0; j < 5; j++) {
        beginShape();
        // Different color for each layer
        stroke(100 + j * 30, 150 + j * 20, 255, 200 - j * 30);
        strokeWeight(2);
        
        for (let i = 0; i < waveform.length; i++) {
            let x = map(i, 0, waveform.length, 0, width);
            let offset = map(j, 0, 4, 0, 100); // Vertical offset for each layer
            let y = map(waveform[i], -1, 1, height/2 - offset, height/2 + offset);
            vertex(x, y);
        }
        endShape();
    }
}

function drawSpectrumBars() {
    translate(-width/2, -height/2); // Reset WebGL transform for 2D drawing
    
    let barWidth = width / spectrum.length;
    for (let i = 0; i < spectrum.length; i++) {
        let amp = spectrum[i];
        let y = map(amp, 0, 255, height, 0);
        
        // Color gradient based on frequency
        if (i < spectrum.length/3) {
            fill(255, 0, 0, 200); // Red for low frequencies
        } else if (i < spectrum.length * 2/3) {
            fill(255, 255, 0, 200); // Yellow for mid frequencies
        } else {
            fill(0, 255, 0, 200); // Green for high frequencies
        }
        
        noStroke();
        rect(i * barWidth, y, barWidth, height - y);
    }
}

function draw3DBlob() {
    // Keep WebGL transform for 3D drawing
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.02);
    
    let bassValue = fft.getEnergy("bass");
    let midValue = fft.getEnergy("mid");
    let trebleValue = fft.getEnergy("treble");
    
    // Create blob using spherical coordinates
    noFill();
    stroke(100, 200, 255);
    strokeWeight(2);
    
    let radius = 150 + map(bassValue, 0, 255, 0, 50);
    
    beginShape(POINTS);
    for (let lat = 0; lat <= 180; lat += 10) {
        for (let lon = 0; lon <= 360; lon += 10) {
            let x = radius * sin(lat) * cos(lon);
            let y = radius * sin(lat) * sin(lon);
            let z = radius * cos(lat);
            
            // Distort the sphere based on audio
            let distortion = map(midValue, 0, 255, 1, 1.5);
            let noiseVal = noise(x * 0.02 + frameCount * 0.01, 
                               y * 0.02, 
                               z * 0.02) * distortion;
            
            x *= noiseVal;
            y *= noiseVal;
            z *= noiseVal;
            
            vertex(x, y, z);
        }
    }
    endShape();
}

function changeStyle(style) {
    currentStyle = style;
    // Reset any style-specific variables if needed
}

function toggleAudio() {
    if (!started) {
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