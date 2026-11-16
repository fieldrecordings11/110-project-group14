// byte-factory/src/hangman/main.ts
import '../index.css'; 
import { HangmanMinigame } from './HangmanMinigame';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Instantiate the minigame (no container needed in the constructor)
  const hangmanGame = new HangmanMinigame();
  
  // 2. Open it with a level ID (e.g., 'demo')
  hangmanGame.open('demo');
});