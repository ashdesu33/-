let isPlaying = false; // Track whether sound is playing
let synthX, synthY, synthZ; // Synthesizers
const movementThreshold = 0.5; // Threshold for movement detection
let lastX = 0, lastY = 0, lastZ = 0; // Track last known positions

// Define a finer scale with multiple octaves
const finerScale = [
  "C", "D", "E", "F", "G", "A", "B",
  "C", "D", "E", "F", "G", "A", "B",
  "C", "D", "E", "F", "G", "A", "B"
];
const baseOctave = 3; // Starting octave

// Shared reverb and chorus effects for blending
const reverb = new Tone.Reverb({ decay: 2, wet: 0.4 }).toDestination();
const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(reverb).start();

// Initialize Synths with unified but distinct qualities
function initializeSynths() {
  synthX = new Tone.Synth({
    oscillator: { type: "sine" }, // Smooth tone
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1 },
  }).connect(chorus);

  synthY = new Tone.Synth({
    oscillator: { type: "triangle" }, // Slightly sharper tone
    envelope: { attack: 0.15, decay: 0.4, sustain: 0.5, release: 1.2 },
  }).connect(chorus);

  synthZ = new Tone.Synth({
    oscillator: { type: "sawtooth" }, // Bright and cutting
    envelope: { attack: 0.1, decay: 0.35, sustain: 0.4, release: 1 },
  }).connect(chorus);
}

// Function to map a value to a finer scale note
function mapToFinerScale(value, axis) {
  const index = Math.floor(map(value, 0.5, 10, 0, finerScale.length));
  const note = finerScale[index % finerScale.length];
  const octaveOffset = axis === "x" ? 0 : axis === "y" ? 1 : 2; // Offset octaves for each axis
  return `${note}${baseOctave + octaveOffset}`;
}

// Function to start continuous sound
function startContinuousSound() {
  if (!isPlaying) {
    isPlaying = true;

    if (!synthX || !synthY || !synthZ) {
      initializeSynths();
    }

    // Start a loop to check movement and play sounds
    Tone.Transport.scheduleRepeat((time) => {
      if (!isPlaying) return;

      // Get movement values from HTML
      const x = parseFloat(document.getElementById("x").textContent) || 0;
      const y = parseFloat(document.getElementById("y").textContent) || 0;
      const z = parseFloat(document.getElementById("z").textContent) || 0;

      // Calculate movement deltas
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      // Update pitch and volume based on movement changes
      if (deltaX > movementThreshold) {
        const noteX = mapToFinerScale(deltaX, "x");
        synthX.set({ frequency: Tone.Frequency(noteX).toFrequency() });
        synthX.triggerAttack(noteX, time); // Continuously play
      }

      if (deltaY > movementThreshold) {
        const noteY = mapToFinerScale(deltaY, "y");
        synthY.set({ frequency: Tone.Frequency(noteY).toFrequency() });
        synthY.triggerAttack(noteY, time); // Continuously play
      }

      if (deltaZ > movementThreshold) {
        const noteZ = mapToFinerScale(deltaZ, "z");
        synthZ.set({ frequency: Tone.Frequency(noteZ).toFrequency() });
        synthZ.triggerAttack(noteZ, time); // Continuously play
      }

      // Update last known positions
      lastX = x;
      lastY = y;
      lastZ = z;

      console.log(`x: ${x}, y: ${y}, z: ${z}, deltas: ${deltaX}, ${deltaY}, ${deltaZ}`);
    }, "128n"); // Check movement every very short interval

    Tone.Transport.start();
    console.log("Continuous sound started.");
  }
}

// Function to stop sound
function stopContinuousSound() {
  if (isPlaying) {
    isPlaying = false;
    Tone.Transport.stop();
    Tone.Transport.cancel(0); // Cancel all scheduled events

    synthX.triggerRelease();
    synthY.triggerRelease();
    synthZ.triggerRelease();

    console.log("Continuous sound stopped.");
  }
}

// Map a value to a range
function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Attach start/stop functionality to a button
document.getElementById("sound-button").addEventListener("click", function () {
  if (isPlaying) {
    stopContinuousSound();
    this.textContent = "Start Sound";
  } else {
    startContinuousSound();
    this.textContent = "Stop Sound";
  }
});

