import ApiService from '../services/api.js';

// Search component for handling artwork search functionality
const Search = {
  state: {
    lastQuery: null,
    isSearching: false,
    hasSearched: false,
    filter: 'Title'
  },
  
  // Initialize the search component
  async init() {
    this.createSearchUI();
    this.addEventListeners();
  },

  // Create search UI elements
  createSearchUI() {
    const container = document.querySelector('.container');
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container mb-4';
    searchContainer.id = 'searchContainer';
    
    searchContainer.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Search Artworks</h5>
          <div class="row g-3">
            <div class="col-md-5">
              <input type="text" id="searchInput" class="form-control" placeholder="Search by title, artist, or keyword...">
            </div>
            <div class="col-md-3">
              <select id="filterSelect" class="form-select">
                <option value="Title" selected>Title</option>
                <option value="Artist">Artist</option>
                <option value="Medium">Medium</option>
                <option value="Classification">Classification</option>
                <option value="Department">Department</option>
                <option value="all">All Fields</option>
              </select>
            </div>
            <div class="col-md-4">
              <button id="searchBtn" class="btn btn-danger w-100">Search</button>
            </div>
          </div>
          <div class="mt-3" id="searchStatus"></div>
        </div>
      </div>
    `;
    
    if (container.firstChild) {
      container.insertBefore(searchContainer, container.firstChild);
    } else {
      container.appendChild(searchContainer);
    }
  },

  // Add event listeners to search elements
  addEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    
    searchBtn.addEventListener('click', () => {
      this.performSearch();
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performSearch();
      }
    });
    
    filterSelect.addEventListener('change', (e) => {
      this.state.filter = e.target.value;
    });
    
    const searchStatus = document.getElementById('searchStatus');
    searchStatus.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'clearSearch') {
        this.clearSearch();
      }
    });
  },

  // Execute search based on input
  async performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (!query) {
      this.updateSearchStatus('Please enter a search term');
      return;
    }
    
    this.state.isSearching = true;
    this.state.lastQuery = query;
    
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'flex';
    
    this.updateSearchStatus('Searching...');
    
    const searchParams = {
      q: query,
      field: this.state.filter
    };
    
    try {
      const results = await ApiService.searchArtworks(searchParams);
      this.displaySearchResults(results, query);
    } catch (error) {
      this.updateSearchStatus(`Search failed: ${error.message}`, true);
    } finally {
      this.state.isSearching = false;
      this.state.hasSearched = true;
      
      spinner.style.display = 'none';
    }
  },

  // Display search results in the UI
  displaySearchResults(results, query) {
    const container = document.getElementById('artworksContainer');
    const pagination = document.getElementById('pagination');
    const galleryTitle = document.querySelector('#mainGallery h2');
    
    if (galleryTitle) {
      let titleText = `Search Results for "${query}"`;
      if (this.state.filter !== 'all') {
        titleText += ` in ${this.state.filter}`;
      }
      galleryTitle.textContent = titleText;
    }
    
    if (pagination) {
      pagination.style.display = 'none';
    }
    
    this.updateSearchStatus(`Found ${results.length} results. <a href="#" id="clearSearch">Clear search</a>`);
    
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p class="my-5">No artworks found matching your search.</p></div>';
      return;
    }
    
    results.forEach(artwork => {
      const artistText = artwork.Artist && Array.isArray(artwork.Artist) 
        ? artwork.Artist.join(', ') 
        : (artwork.Artist || 'Unknown Artist');
        
      const imageUrl = artwork.ImageURL || 'https://placehold.co/400x400?text=No+Image';
      
      const artworkCard = document.createElement('div');
      artworkCard.className = 'col-md-4 col-lg-3 mb-4';
      artworkCard.innerHTML = `
        <div class="card h-100">
          <div class="card-img-top">
            <img src="${imageUrl}" class="card-img-top" alt="${artwork.Title || 'Artwork'}" 
                 onerror="this.src='https://placehold.co/400x400?text=Image+Error';">
          </div>
          <div class="card-body">
            <h5 class="card-title">${artwork.Title || 'Untitled'}</h5>
            <p class="card-text text-muted">${artistText}</p>
            <p class="card-text"><small>${artwork.Date || 'No date'}</small></p>
          </div>
          <div class="card-footer bg-transparent border-top-0 text-center">
            <button class="btn btn-sm btn-outline-primary view-btn" data-id="${artwork.ObjectID}">
              View Details
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(artworkCard);
    });
    
    this.addViewListeners();
  },

  // Add event listeners to view buttons
  addViewListeners() {
    document.querySelectorAll('.view-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        try {
          const artworkId = e.currentTarget.dataset.id;
          
          const GalleryModule = await import('./gallery.js');
          const Gallery = GalleryModule.default;
          
          Gallery.viewDetails(artworkId);
        } catch (error) {
          alert('Could not view artwork details. Please try again.');
        }
      });
    });
  },

  // Clear search and return to gallery view
  async clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    
    if (searchInput) searchInput.value = '';
    if (filterSelect) filterSelect.value = 'Title';
    
    this.state.filter = 'Title';
    this.state.hasSearched = false;
    this.state.lastQuery = null;
    
    this.updateSearchStatus('');
    
    const galleryTitle = document.querySelector('#mainGallery h2');
    if (galleryTitle) {
      galleryTitle.textContent = 'Artwork Gallery';
    }
    
    const pagination = document.getElementById('pagination');
    if (pagination) {
      pagination.style.display = 'flex';
    }
    
    try {
      const GalleryModule = await import('./gallery.js');
      const Gallery = GalleryModule.default;
      
      const spinner = document.getElementById('spinner');
      if (spinner) {
        spinner.style.display = 'flex';
      }
      
      await Gallery.loadArtworks(1);
    } catch (error) {
      // Handle error silently
    } finally {
      const spinner = document.getElementById('spinner');
      if (spinner) {
        spinner.style.display = 'none';
      }
    }
  },

  // Update search status message
  updateSearchStatus(message, isError = false) {
    const searchStatus = document.getElementById('searchStatus');
    
    searchStatus.innerHTML = message;
    
    if (isError) {
      searchStatus.classList.add('text-danger');
    } else {
      searchStatus.classList.remove('text-danger');
    }
  }
};

export default Search;