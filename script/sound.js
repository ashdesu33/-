let isPlaying = false; // Track whether sound is playing
let primarySynth, additionalSynth; // Synthesizers
let scheduledEventID; // To track the scheduled playback event

// Initialize Synths
function initializeSynths() {
  primarySynth = new Tone.Synth().toDestination();
  additionalSynth = new Tone.Synth().toDestination();
}

// Function to stop the Tone.js Transport
function stopSound() {
  if (isPlaying) {
    isPlaying = false; // Mark playback as stopped

    // Stop the transport and cancel all scheduled events
    Tone.Transport.stop();
    Tone.Transport.cancel(0); // Cancel all scheduled events from the timeline

    // Release any active notes immediately
    if (primarySynth) primarySynth.triggerRelease();
    if (additionalSynth) additionalSynth.triggerRelease();

    console.log("Sound stopped.");
  }
}

// Function to start the Tone.js Transport
async function startSound() {
  if (!isPlaying) {
    isPlaying = true; // Mark playback as started

    // Initialize synths if not already done
    if (!primarySynth || !additionalSynth) {
      initializeSynths();
    }

    // Fetch and play the poem
    const poemFile = await fetchJSON('smallTheory.json');
    if (!poemFile || !poemFile.poem || !Array.isArray(poemFile.poem)) {
      console.error("Invalid or missing JSON file.");
      return;
    }

    schedulePoemPlayback(poemFile.poem); // Schedule the playback
    Tone.Transport.start();
    console.log("Sound started.");
  }
}

// Attach event listener to the button
document.getElementById("sound-button").addEventListener("click", function () {
  if (isPlaying) {
    stopSound();
    this.textContent = "Start Sound";
  } else {
    startSound();
    this.textContent = "Stop Sound";
  }
});

// Function to fetch JSON
async function fetchJSON(filePath) {
  const response = await fetch('../poems/' + filePath);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

// Calculate total movement
function calculateMovement(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

// Generate a new note from x, y, z
function generateNoteFromMovement(x, y, z) {
  const noteX = Math.floor(map(calculateMovement(x, y, z), 0, 20, 0, 7));
  const scale = ["C", "D", "E", "F", "G", "A", "B"];
  const octave = Math.floor(map(z, -10, 10, 3, 6));
  return `${scale[noteX % scale.length]}${octave}`;
}

// Schedule poem playback
function schedulePoemPlayback(poem) {
  let currentLine = 0; // Track the current line

  // Schedule playback with repeat
  scheduledEventID = Tone.Transport.scheduleRepeat((time) => {
    if (!isPlaying || currentLine >= poem.length) {
      stopSound(); // Stop when playback is finished or interrupted
      return;
    }

    const { text, speed } = poem[currentLine];
    if (text) {
      playLine(text, speed, time); // Play the current line
    }

    currentLine++; // Move to the next line
  }, "1m"); // Schedule every measure
}

// Play a line of the poem
function playLine(text, speed, time) {
  const notesToPlay = text.split("").map((char) => charToNote[char] || "C4");
  const duration = speed * 8 + "n";

  // Simulate reading accelerometer values
  const x = parseFloat(document.getElementById("x").textContent) || 0;
  const y = parseFloat(document.getElementById("y").textContent) || 0;
  const z = parseFloat(document.getElementById("z").textContent) || 0;

  // Calculate movement and additional note
  const totalMovement = calculateMovement(x, y, z);
  const additionalNote = generateNoteFromMovement(x, y, z);
  const adjustedDuration = duration;

  // Gradual character printing
  const displayElement = document.getElementById("note-display");
  displayElement.textContent = ""; // Clear previous text

  let currentIndex = 0;

  const intervalId = setInterval(() => {
    if (!isPlaying) {
      clearInterval(intervalId); // Stop printing if playback stops
      return;
    }

    if (currentIndex < text.length) {
      // Add the next character to the display
      console.log(text);
      displayElement.textContent += text[currentIndex];
      currentIndex++;
    } else {
      clearInterval(intervalId); // Stop interval when the text is fully printed
    }
  }, ); // Adjust speed multiplier for character display timing

  // Play each note in the line
  let currentTime = time;
  notesToPlay.forEach((note) => {
    if (!isPlaying) return; // Stop playing if the flag is false
    primarySynth.triggerAttackRelease(note, adjustedDuration, currentTime);
    additionalSynth.triggerAttackRelease(additionalNote, adjustedDuration, currentTime);
    currentTime += 0.25; // Increment timing
  });

  console.log("Playing line:", text);
}