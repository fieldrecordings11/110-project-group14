import {showRoadmap} from './roadmap';

// This page is only for previewing the roadmap during development.
const container = document.getElementById('roadmap-preview');

if (container) {
  showRoadmap(container);
}
