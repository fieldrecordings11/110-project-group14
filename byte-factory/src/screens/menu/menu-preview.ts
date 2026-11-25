import '../../index.css';
import { MenuScreenController } from './MenuScreenController';

// Preview uses the same screen as the app, with simple placeholder actions.
const root = document.getElementById('menu-preview');
if (root) {
  const menu = new MenuScreenController(
    () => console.log('Play clicked'),
    () => console.log('Hangman clicked'),
  );
  menu.mount(root);
}
