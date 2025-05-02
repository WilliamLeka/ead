// Minimal Search component
import ApiService from '../services/api.js';

const Search = {
  state: { lastQuery: null, isSearching: false, hasSearched: false, filter: 'Title' },
  
  // Initialize component
  async init() {
    this.createSearchUI();
    this.addEventListeners();
  },

  // Create search UI
  createSearchUI() {
    const container = document.querySelector('.container');
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container mb-4';
    searchContainer.id = 'searchContainer';
    
    searchContainer.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title mb-3">Search Artworks</h5>
          <form id="searchForm">
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
              <div class="col-md-4 d-flex">
                <button type="submit" id="searchBtn" class="btn btn-danger flex-grow-1">
                  Search
                </button>
                <button type="button" id="advancedSearchBtn" class="btn btn-outline-secondary ms-2">
                  <i class="fas fa-sliders-h"></i>
                </button>
              </div>
            </div>
            
            <div class="collapse mt-3" id="advancedSearchCollapse">
              <div class="card card-body bg-light">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Department</label>
                    <select id="departmentFilter" class="form-select form-select-sm">
                      <option value="">Any Department</option>
                      <option value="Architecture & Design">Architecture & Design</option>
                      <option value="Drawings">Drawings</option>
                      <option value="Film">Film</option>
                      <option value="Media and Performance">Media and Performance</option>
                      <option value="Painting & Sculpture">Painting & Sculpture</option>
                      <option value="Photography">Photography</option>
                      <option value="Prints & Illustrated Books">Prints & Illustrated Books</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Classification</label>
                    <select id="classificationFilter" class="form-select form-select-sm">
                      <option value="">Any Classification</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Design">Design</option>
                      <option value="Drawing">Drawing</option>
                      <option value="Film">Film</option>
                      <option value="Installation">Installation</option>
                      <option value="Painting">Painting</option>
                      <option value="Photography">Photography</option>
                      <option value="Print">Print</option>
                      <option value="Sculpture">Sculpture</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </form>
          
          <div class="mt-3" id="searchStatus"></div>
        </div>
      </div>
    `;
    
    container.insertBefore(searchContainer, container.firstChild || null);
    new bootstrap.Collapse(document.getElementById('advancedSearchCollapse'), {toggle: false});
  },

  // Add event listeners
  addEventListeners() {
    const searchForm = document.getElementById('searchForm');
    const advancedBtn = document.getElementById('advancedSearchBtn');
    const filterSelect = document.getElementById('filterSelect');
    const searchStatus = document.getElementById('searchStatus');
    const deptFilter = document.getElementById('departmentFilter');
    const classFilter = document.getElementById('classificationFilter');
    
    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      this.performSearch();
    });
    
    advancedBtn.addEventListener('click', () => 
      bootstrap.Collapse.getInstance(document.getElementById('advancedSearchCollapse')).toggle());
    
    filterSelect.addEventListener('change', e => this.state.filter = e.target.value);
    
    searchStatus.addEventListener('click', e => {
      if (e.target && e.target.id === 'clearSearch') this.clearSearch();
    });
    
    [deptFilter, classFilter].forEach(filter => 
      filter.addEventListener('change', () => {
        if (this.state.hasSearched) this.performSearch();
      }));
  },

  // Perform search
  async performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const dept = document.getElementById('departmentFilter').value;
    const classification = document.getElementById('classificationFilter').value;
    
    if (!query && !dept && !classification) {
      this.updateSearchStatus('Please enter a search term or select a filter');
      return;
    }
    
    this.state.isSearching = true;
    this.state.lastQuery = query;
    
    this.updateSearchStatus('Searching...');
    
    const results = await ApiService.searchArtworks({
      q: query, 
      field: this.state.filter,
      department: dept,
      classification: classification
    });
    
    this.displaySearchResults(results, query, dept, classification);
    this.state.isSearching = false;
    this.state.hasSearched = true;
  },

  // Display results
  displaySearchResults(results, query, dept, classification) {
    const container = document.getElementById('artworksContainer');
    const pagination = document.getElementById('pagination');
    const title = document.querySelector('#mainGallery h2');
    
    if (pagination) pagination.style.display = 'none';
    
    this.updateSearchStatus(`Found ${results.length} results. <a href="#" id="clearSearch">Clear search</a>`);
    
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p class="my-5">No artworks found matching your search criteria.</p></div>';
      return;
    }
    
    results.forEach(artwork => {
      const artist = artwork.Artist && Array.isArray(artwork.Artist) 
        ? artwork.Artist.join(', ') : (artwork.Artist || 'Unknown Artist');
      const img = artwork.ImageURL || 'https://placehold.co/400x400?text=No+Image';
      
      const card = document.createElement('div');
      card.className = 'col-md-4 col-lg-3 mb-4';
      card.innerHTML = `
        <div class="card h-100">
          <div class="card-img-top">
            <img src="${img}" class="card-img-top" alt="${artwork.Title || 'Artwork'}" 
                 onerror="this.src='https://placehold.co/400x400?text=Image+Error';">
          </div>
          <div class="card-body">
            <h5 class="card-title">${artwork.Title || 'Untitled'}</h5>
            <p class="card-text text-muted">${artist}</p>
            <p class="card-text"><small>${artwork.Date || 'No date'}</small></p>
          </div>
          <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-primary view-btn" data-id="${artwork.ObjectID}">
              <i class="fas fa-eye me-1"></i>View
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(card);
    });
    
    this.addCardListeners();
  },

  // Add card listeners
  addCardListeners() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        const id = e.currentTarget.dataset.id;
        const Gallery = (await import('./gallery.js')).default;
        Gallery.viewDetails(id);
      });
    });
  },
  
  // Update status
  updateSearchStatus(message) {
    const status = document.getElementById('searchStatus');
    status.innerHTML = message;
  },

  // Clear search
  async clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterSelect').value = 'Title';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('classificationFilter').value = '';
    
    this.state.filter = 'Title';
    this.state.hasSearched = false;
    this.state.lastQuery = null;
    
    this.updateSearchStatus('');
    
    const title = document.querySelector('#mainGallery h2');
    if (title) title.textContent = 'Artwork Gallery';
    
    const pagination = document.getElementById('pagination');
    if (pagination) pagination.style.display = 'flex';
    
    const Gallery = (await import('./gallery.js')).default;
    await Gallery.loadArtworks(1);
  }
};

export default Search;