// Define the notes
import zipToTz from 'zip-to-tz';
const tz = zipToTz('94110');
console.log(tz); 

const notes = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", 
    "C6", "D6", "E6", "F6", "G6", "A6", "B6"
  ];
  
  // Define the characters to map
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?;:'\"()-_[]{}<>@#$%^&*+=~`|\\ ";
  
  // Map each character to a note
  const charToNote = {};
  characters.split("").forEach((char, index) => {
    charToNote[char] = notes[index % notes.length];
  });

  