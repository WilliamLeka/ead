// Updated Search component with AJAX implementation
import Api from '../services/api.js';
import Gallery from './gallery.js';

const Search = {
  state: {
    lastQuery: null,
    isSearching: false,
    hasSearched: false,
    filter: 'Title',
    department: '',
    classification: ''
  },
  
  // Initialize the search component
  async init() {
    this.createSearchUI();
    this.addEventListeners();
    
    // Add spinner if not exists
    if (!document.getElementById('spinner')) {
      const spinnerDiv = document.createElement('div');
      spinnerDiv.id = 'spinner';
      spinnerDiv.className = 'spinner-overlay';
      spinnerDiv.style.display = 'none';
      spinnerDiv.innerHTML = `
        <div class="spinner-border text-danger" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `;
      document.body.appendChild(spinnerDiv);
    }
    
    // Get filter options for advanced search
    try {
      const options = await Api.getFilterOptions();
      this.populateFilterOptions(options);
    } catch (error) {
      console.error("Failed to load filter options:", error);
    }
  },

  // Create search UI elements with advanced filters
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
              <button id="searchBtn" class="btn btn-danger">
                <i class="fas fa-search me-1"></i>Search
              </button>
              <button id="advancedSearchToggle" class="btn btn-outline-secondary ms-2">
                <i class="fas fa-sliders-h me-1"></i>Filters
              </button>
            </div>
          </div>
          
          <!-- Advanced Search Options (Hidden by default) -->
          <div id="advancedSearch" class="row g-3 mt-2" style="display: none;">
            <div class="col-md-6">
              <label for="departmentFilter" class="form-label">Department</label>
              <select id="departmentFilter" class="form-select">
                <option value="">All Departments</option>
                <!-- Will be populated dynamically -->
              </select>
            </div>
            <div class="col-md-6">
              <label for="classificationFilter" class="form-label">Classification</label>
              <select id="classificationFilter" class="form-select">
                <option value="">All Classifications</option>
                <!-- Will be populated dynamically -->
              </select>
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

  // Populate filter dropdown options
  populateFilterOptions(options) {
    const departmentSelect = document.getElementById('departmentFilter');
    const classificationSelect = document.getElementById('classificationFilter');
    
    if (departmentSelect && options.departments) {
      options.departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
      });
    }
    
    if (classificationSelect && options.classifications) {
      options.classifications.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classificationSelect.appendChild(option);
      });
    }
  },

  // Add event listeners to search elements
  addEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const advancedSearchToggle = document.getElementById('advancedSearchToggle');
    const departmentFilter = document.getElementById('departmentFilter');
    const classificationFilter = document.getElementById('classificationFilter');
    
    // Toggle advanced search options
    if (advancedSearchToggle) {
      advancedSearchToggle.addEventListener('click', () => {
        const advancedSearch = document.getElementById('advancedSearch');
        if (advancedSearch) {
          advancedSearch.style.display = advancedSearch.style.display === 'none' ? 'flex' : 'none';
          advancedSearchToggle.innerHTML = advancedSearch.style.display === 'none' ? 
            '<i class="fas fa-sliders-h me-1"></i>Filters' : 
            '<i class="fas fa-times me-1"></i>Hide Filters';
        }
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.performSearch();
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
    }
    
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.state.filter = e.target.value;
      });
    }
    
    if (departmentFilter) {
      departmentFilter.addEventListener('change', (e) => {
        this.state.department = e.target.value;
      });
    }
    
    if (classificationFilter) {
      classificationFilter.addEventListener('change', (e) => {
        this.state.classification = e.target.value;
      });
    }
    
    const searchStatus = document.getElementById('searchStatus');
    if (searchStatus) {
      searchStatus.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'clearSearch') {
          this.clearSearch();
        }
      });
    }
  },

  // Execute search based on input using AJAX
  performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (!query && !this.state.department && !this.state.classification) {
      this.updateSearchStatus('Please enter a search term or select filters');
      return;
    }
    
    this.state.isSearching = true;
    this.state.lastQuery = query;
    
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'flex';
    
    this.updateSearchStatus('Searching...');
    
    const searchParams = {
      q: query,
      field: this.state.filter,
      department: this.state.department,
      classification: this.state.classification
    };
    
    // Create AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/search?${this.buildQueryString(searchParams)}`, true);
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const results = JSON.parse(xhr.responseText);
          this.displaySearchResults(results, query);
        } catch (error) {
          this.updateSearchStatus('Error parsing search results', true);
          console.error('Error parsing search results:', error);
        }
      } else {
        this.updateSearchStatus(`Search failed with status: ${xhr.status}`, true);
      }
      
      this.state.isSearching = false;
      this.state.hasSearched = true;
      
      if (spinner) spinner.style.display = 'none';
    };
    
    xhr.onerror = () => {
      this.updateSearchStatus('Search request failed. Please try again.', true);
      this.state.isSearching = false;
      if (spinner) spinner.style.display = 'none';
    };
    
    xhr.send();
  },
  
  // Build query string for search parameters
  buildQueryString(params) {
    const queryParams = new URLSearchParams();
    
    if (params.q && params.q.trim() !== '') {
      queryParams.append('q', params.q.trim());
    } else if (params.department || params.classification) {
      queryParams.append('q', '*');
    }
    
    if (params.field && params.field !== 'all') {
      queryParams.append('field', params.field);
    }
    
    if (params.department && params.department.trim() !== '') {
      queryParams.append('department', params.department);
    }
    
    if (params.classification && params.classification.trim() !== '') {
      queryParams.append('classification', params.classification);
    }
    
    if (queryParams.toString() === '') {
      queryParams.append('q', '*');
    }
    
    return queryParams.toString();
  },

  // Display search results in the UI
  displaySearchResults(results, query) {
    const container = document.getElementById('artworksContainer');
    const pagination = document.getElementById('pagination');
    const galleryTitle = document.querySelector('#mainGallery h2');
    
    if (!container) return;
    
    if (galleryTitle) {
      let titleText = `Search Results`;
      if (query) titleText += ` for "${query}"`;
      if (this.state.filter !== 'all' && query) {
        titleText += ` in ${this.state.filter}`;
      }
      if (this.state.department) {
        titleText += ` | Department: ${this.state.department}`;
      }
      if (this.state.classification) {
        titleText += ` | Classification: ${this.state.classification}`;
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
            <button class="btn btn-sm btn-outline-primary view-artwork" data-id="${artwork.ObjectID}">
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
    document.querySelectorAll('.view-artwork').forEach(button => {
      button.addEventListener('click', async (e) => {
        try {
          const artworkId = e.currentTarget.dataset.id;
          Gallery.viewDetails(artworkId);
        } catch (error) {
          console.error('Could not view artwork details:', error);
          alert('Could not view artwork details. Please try again.');
        }
      });
    });
  },

  // Clear search and return to gallery view
  clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const departmentFilter = document.getElementById('departmentFilter');
    const classificationFilter = document.getElementById('classificationFilter');
    
    if (searchInput) searchInput.value = '';
    if (filterSelect) filterSelect.value = 'Title';
    if (departmentFilter) departmentFilter.value = '';
    if (classificationFilter) classificationFilter.value = '';
    
    this.state.filter = 'Title';
    this.state.department = '';
    this.state.classification = '';
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
    
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'flex';
    
    Gallery.loadArtworks(1).finally(() => {
      if (spinner) spinner.style.display = 'none';
    });
  },

  // Update search status message
  updateSearchStatus(message, isError = false) {
    const searchStatus = document.getElementById('searchStatus');
    if (!searchStatus) return;
    
    searchStatus.innerHTML = message;
    
    if (isError) {
      searchStatus.classList.add('text-danger');
    } else {
      searchStatus.classList.remove('text-danger');
    }
  }
};

export default Search;