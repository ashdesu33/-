let ringWidth, ringHeight, strokeWidth;
let easedX = 0, easedY = 0, easedZ = 0; // For easing
let positionHistory = []; // Store the last 10 positions

function setup() {
  createCanvas(windowWidth, windowHeight); // Fullscreen canvas
  noSmooth(); // Disable smoothing for pixelated effect
  frameRate(60);
}

function draw() {
  background(255, 253, 195); // Light background

  // Fetch accelerometer data from HTML
  const x = parseFloat(select("#x").html()) || 0;
  const y = parseFloat(select("#y").html()) || 0;
  const z = parseFloat(select("#z").html()) || 0;

  // Eased transitions for x, y, and z
  easedX += (x - easedX) * 0.1; // Adjust easing factor (0.1 = smooth, 1 = instant)
  easedY += (y - easedY) * 0.1;
  easedZ += (z - easedZ) * 0.1;

  // Store the eased positions in the history
  positionHistory.push({ x: easedX, y: easedY });
  if (positionHistory.length > 10) {
    positionHistory.shift(); // Keep only the last 10 positions
  }

  // Draw rectangles based on the last 10 positions
  drawMappedRectangles();

  // Draw dithering ring
  drawDitheringRing(easedX, easedY, easedZ);
}

// Draw rectangles at the last 10 x and y positions
function drawMappedRectangles() {
  for (let i = 0; i < positionHistory.length; i++) {
    const pos = positionHistory[i];

    // Map the position to the canvas
    const mappedX = map(pos.x, -10, 10, 50, width - 50);
    const mappedY = map(pos.y, -10, 10, 50, height - 50);

    // Draw the rectangle
    fill(0, 0, 0, 50); // Semi-transparent black
    stroke(0);
    rect(mappedX, mappedY, 30, 30); // Constant size

    // Draw the x, y values inside the rectangle
    fill(0);
    noStroke();
    textSize(10);
    textAlign(CENTER, CENTER);
    text(`x:${nf(pos.x, 1, 1)}\ny:${nf(pos.y, 1, 1)}`, mappedX + 15, mappedY + 15); // Centered label
  }
}

// Draw a dithering ring based on eased x, y, z values
function drawDitheringRing(x, y, z) {
  push();
  translate(width / 2, height / 2); // Center the ring

  // Map eased values for ring dimensions and stroke width
  ringWidth = map(x, -10, 10, 50, width / 2);
  ringHeight = map(y, -10, 10, 50, height / 2);
  strokeWidth = map(z, -20, 10, 2, 20);

  const pixelSize = 3; // Size of each "dithered" pixel
  for (let angle = 0; angle < 360; angle += 2) {
    // Convert angle to radians
    const rad = radians(angle);

    // Add randomness to create the dithered effect
    const xNoise = random(-pixelSize / 2, pixelSize / 2);
    const yNoise = random(-pixelSize / 2, pixelSize / 2);

    // Compute ring pixel position
    const posX = ringWidth * cos(rad) + xNoise;
    const posY = ringHeight * sin(rad) + yNoise;

    // Fragmented brightness
    const brightness = 0;

    // Draw pixel fragment
    noStroke();
    fill(brightness);
    rect(posX, posY, pixelSize, pixelSize); // Pixelated fragment
  }
  pop();
}
