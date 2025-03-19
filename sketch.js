let mic, fft;
let started = false;

function setup() {
    const canvas = createCanvas(windowWidth * 0.8, windowHeight * 0.6);
    canvas.parent('canvas-container');
    
    // Initialize audio input and FFT
    mic = new p5.AudioIn();
    fft = new p5.FFT(0.8, 1024);
    
    // Connect mic to FFT for analysis
    fft.setInput(mic);
    
    // Setup button handler
    const startButton = select('#startButton');
    startButton.mousePressed(toggleAudio);
    
    // Initial styling
    colorMode(HSB);
    noFill();
}

function draw() {
    background(0);
    
    if (started) {
        // Analyze the frequency spectrum
        let spectrum = fft.analyze();
        
        // Draw the spectrum
        beginShape();
        for (let i = 0; i < spectrum.length; i++) {
            let x = map(i, 0, spectrum.length, 0, width);
            let h = map(spectrum[i], 0, 255, height, 0);
            
            // Calculate color based on frequency
            let hue = map(i, 0, spectrum.length, 0, 360);
            stroke(hue, 100, 100);
            strokeWeight(2);
            
            vertex(x, h);
        }
        endShape();
        
        // Draw waveform
        let waveform = fft.waveform();
        beginShape();
        stroke(255);
        strokeWeight(1);
        for (let i = 0; i < waveform.length; i++) {
            let x = map(i, 0, waveform.length, 0, width);
            let y = map(waveform[i], -1, 1, height/2 - 50, height/2 + 50);
            vertex(x, y);
        }
        endShape();
    } else {
        // Show waiting message
        textAlign(CENTER, CENTER);
        textSize(24);
        fill(255);
        noStroke();
        text('Click "Start Microphone" to begin', width/2, height/2);
    }
}

function toggleAudio() {
    if (!started) {
        // Start audio input
        userStartAudio();
        mic.start();
        started = true;
        select('#startButton').html('Stop Microphone');
    } else {
        // Stop audio input
        mic.stop();
        started = false;
        select('#startButton').html('Start Microphone');
    }
}

function windowResized() {
    resizeCanvas(windowWidth * 0.8, windowHeight * 0.6);
}