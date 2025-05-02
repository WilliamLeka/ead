// Main application file
import Gallery from './components/gallery.js';
import Search from './components/search.js';

document.addEventListener('DOMContentLoaded', () => {
  Search.init();
  Gallery.init();
});