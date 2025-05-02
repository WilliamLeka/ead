// Gallery component for displaying artworks
import Api from '../services/api.js';

const Gallery = {
  currentPage: 1,
  totalPages: 1,
  isShowingFavorites: false, // Track if we're showing favorites view
  
  // Initialize gallery and load initial artworks
  async init() {
    await this.loadArtworks(1);
    this.addGalleryHeader();
  },
  
  // Add gallery header with buttons
  addGalleryHeader() {
    const container = document.querySelector('#mainGallery h2');
    if (!container) return;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'd-flex justify-content-between align-items-center mb-4';
    
    const title = container.textContent;
    container.textContent = '';
    
    // Get saved favorites
    let favorites = this.getFavorites();
    
    // Create header with buttons
    buttonContainer.innerHTML = `
      <h2>${title}</h2>
      <div class="d-flex">
        <button id="favoritesBtn" class="btn ${this.isShowingFavorites ? 'btn-warning' : 'btn-outline-warning'} me-2">
          <i class="fas fa-star me-1"></i>${this.isShowingFavorites ? 'Show All Artworks' : 'Favorites'}
        </button>
        <button id="createArtworkBtn" class="btn btn-success">
          <i class="fas fa-plus-circle me-1"></i>Add New Artwork
        </button>
      </div>
    `;
    
    container.parentNode.insertBefore(buttonContainer, container);
    container.remove();
    
    // Add button listeners
    document.getElementById('createArtworkBtn').addEventListener('click', () => {
      this.showForm('create');
    });
    
    document.getElementById('favoritesBtn').addEventListener('click', () => {
      this.toggleFavoritesView();
    });
  },
  
  // Toggle between favorites and all artworks views
  async toggleFavoritesView() {
    this.isShowingFavorites = !this.isShowingFavorites;
    
    // Update button appearance
    const favoritesBtn = document.getElementById('favoritesBtn');
    if (favoritesBtn) {
      favoritesBtn.innerHTML = `
        <i class="fas fa-star me-1"></i>${this.isShowingFavorites ? 'Show All Artworks' : 'Favorites'}
      `;
      favoritesBtn.classList.toggle('btn-warning', this.isShowingFavorites);
      favoritesBtn.classList.toggle('btn-outline-warning', !this.isShowingFavorites);
    }
    
    const pagination = document.getElementById('pagination');
    if (pagination) {
      pagination.style.display = this.isShowingFavorites ? 'none' : 'flex';
    }
    
    // Load appropriate content
    if (this.isShowingFavorites) {
      await this.showFavorites();
    } else {
      await this.loadArtworks(1);
    }
  },
  
  // Load artworks with pagination
  async loadArtworks(page, limit = 12) {
    const data = await Api.getArtworks(page, limit);
    
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    
    this.renderArtworks(data.artworks);
    this.renderPagination();
    
    // Reset favorites state
    this.isShowingFavorites = false;
  
  },
  
  // Get favorites from localStorage
  getFavorites() {
    const savedFavorites = localStorage.getItem('artworkFavorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  },
  
  // Show favorites view
  async showFavorites() {
    const favorites = this.getFavorites();
    const container = document.getElementById('artworksContainer');
    if (!container) return;
    
    // Show empty state if no favorites
    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
            <h4>No Favorite Artworks</h4>
            <p class="text-muted">You haven't added any artworks to your favorites yet.</p>
        </div>
      `;
      
      // Add browse button listener
      document.getElementById('browseArtworksBtn')?.addEventListener('click', () => {
        this.toggleFavoritesView();
      });
      return;
    }
    
    // Fetch and display favorite artworks
    const artworks = [];
    for (const id of favorites) {
      const artwork = await Api.getArtworkById(id);
      artworks.push(artwork);
    }
    
    this.renderArtworks(artworks, true);
  },
  
  // Render artworks to the page
  renderArtworks(artworks, isFavoritesView = false) {
    const container = document.getElementById('artworksContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get favorites for highlighting
    const favorites = this.getFavorites();
    
    // Create artwork cards
    artworks.forEach(artwork => {
      const artistText = artwork.Artist && Array.isArray(artwork.Artist) 
        ? artwork.Artist.join(', ') 
        : (artwork.Artist || 'Unknown Artist');
        
      const imageUrl = artwork.ImageURL || 'https://placehold.co/400x400?text=No+Image';
      const isFavorite = favorites.includes(artwork.ObjectID);
      
      // Create card element
      const artworkCard = document.createElement('div');
      artworkCard.className = 'col-md-4 col-lg-3 mb-4';
      artworkCard.innerHTML = `
        <div class="card h-100 ${isFavorite ? 'border-warning' : ''}">
          <div class="card-img-top position-relative">
            <img src="${imageUrl}" class="img-fluid w-100" alt="${artwork.Title}" 
                 onerror="this.src='https://placehold.co/400x400?text=Image+Error';" style="height: 200px; object-fit: cover;">
            ${isFavorite ? '<div class="favorite-badge"><i class="fas fa-star text-warning"></i></div>' : ''}
          </div>
          <div class="card-body">
            <h5 class="card-title">${artwork.Title || 'Untitled'}</h5>
            <p class="card-text text-muted">${artistText}</p>
            <p class="card-text"><small>${artwork.Date || 'No date'}</small></p>
          </div>
          <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between">
            <button class="btn btn-sm btn-outline-primary view-artwork" data-id="${artwork.ObjectID}">
              <i class="fas fa-eye me-1"></i>View
            </button>
            <button class="btn btn-sm ${isFavorite ? 'btn-warning' : 'btn-outline-warning'} favorite-btn" 
                    data-id="${artwork.ObjectID}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
              <i class="fas fa-star"></i>
            </button>
          </div>
        </div>
      `;
      
      container.appendChild(artworkCard);
    });
    
    this.addCardListeners();
  },
  
  // Add event listeners to card buttons
  addCardListeners() {
    // View button listeners
    document.querySelectorAll('.view-artwork').forEach(button => {
      button.addEventListener('click', async (e) => {
        const artworkId = e.currentTarget.dataset.id;
        this.viewDetails(artworkId);
      });
    });
    
    // Favorite button listeners
    document.querySelectorAll('.favorite-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const artworkId = parseInt(e.currentTarget.dataset.id);
        this.toggleFavorite(artworkId, e.currentTarget);
      });
    });
  },
  
  // Toggle favorite status for an artwork
  toggleFavorite(artworkId, button) {
    let favorites = this.getFavorites();
    const index = favorites.indexOf(artworkId);
    const isFavoritesView = this.isShowingFavorites;
    
    if (index === -1) {
      // Add to favorites
      favorites.push(artworkId);
      button.classList.remove('btn-outline-warning');
      button.classList.add('btn-warning');
      button.title = 'Remove from favorites';
      
      // Update card appearance
      const card = button.closest('.card');
      if (card) {
        card.classList.add('border-warning');
        
        if (!card.querySelector('.favorite-badge')) {
          const imgContainer = card.querySelector('.card-img-top');
          const badge = document.createElement('div');
          badge.className = 'favorite-badge';
          badge.innerHTML = '<i class="fas fa-star text-warning"></i>';
          imgContainer.appendChild(badge);
        }
      }
    } else {
      // Remove from favorites
      favorites.splice(index, 1);
      button.classList.remove('btn-warning');
      button.classList.add('btn-outline-warning');
      button.title = 'Add to favorites';
      
      // Update card appearance
      const card = button.closest('.card');
      if (card) {
        card.classList.remove('border-warning');
        const badge = card.querySelector('.favorite-badge');
        if (badge) badge.remove();
      }
      
      // Remove card from view if in favorites view
      if (isFavoritesView) {
        const cardContainer = button.closest('.col-md-4');
        if (cardContainer) {
          cardContainer.classList.add('fade-out');
          setTimeout(() => {
            cardContainer.remove();
            
            // Check if no more favorites
            if (favorites.length === 0) {
              this.showFavorites();
            }
          }, 300);
        }
      }
    }
    
    // Save to localStorage
    localStorage.setItem('artworkFavorites', JSON.stringify(favorites));
  },
  
  // View artwork details
  async viewDetails(artworkId) {
    const artwork = await Api.getArtworkById(artworkId);
    this.showModal(artwork);
  },
  
  // Show artwork details in modal
  showModal(artwork) {
    // Create modal if it doesn't exist
    if (!document.getElementById('artworkModal')) {
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal fade';
      modalDiv.id = 'artworkModal';
      modalDiv.tabIndex = '-1';
      modalDiv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modalDiv);
    }
    
    // Format artwork data
    const artistText = artwork.Artist && Array.isArray(artwork.Artist) 
      ? artwork.Artist.join(', ') 
      : (artwork.Artist || 'Unknown Artist');
    
    const nationality = artwork.Nationality && Array.isArray(artwork.Nationality) 
      ? artwork.Nationality.join(', ') 
      : (artwork.Nationality || 'Unknown');
    
    const bio = artwork.ArtistBio && Array.isArray(artwork.ArtistBio) 
      ? artwork.ArtistBio.join(', ') 
      : (artwork.ArtistBio || '');
      
    const imageUrl = artwork.ImageURL || 'https://placehold.co/600x600?text=No+Image';
    
    // Check favorite status
    const favorites = this.getFavorites();
    const isFavorite = favorites.includes(artwork.ObjectID);
    
    // Build modal HTML
    const modal = document.getElementById('artworkModal');
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${artwork.Title || 'Untitled'}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <div class="position-relative">
                  <img src="${imageUrl}" class="img-fluid mb-3 rounded" alt="${artwork.Title}" 
                       onerror="this.src='https://placehold.co/600x600?text=Image+Error';">
                  ${isFavorite ? '<div class="position-absolute top-0 end-0 p-2"><i class="fas fa-star text-warning fa-2x"></i></div>' : ''}
                </div>
              </div>
              <div class="col-md-6">
                <h6 class="mb-3">${artistText}</h6>
                ${bio ? `<p class="text-muted">${bio}</p>` : ''}
                ${nationality !== 'Unknown' ? `<p><strong>Nationality:</strong> ${nationality}</p>` : ''}
                <p><strong>Date:</strong> ${artwork.Date || 'Unknown'}</p>
                <p><strong>Medium:</strong> ${artwork.Medium || 'Unknown'}</p>
                ${artwork.Dimensions ? `<p><strong>Dimensions:</strong> ${artwork.Dimensions}</p>` : ''}
                ${artwork.Department ? `<p><strong>Department:</strong> ${artwork.Department}</p>` : ''}
                ${artwork.Classification ? `<p><strong>Classification:</strong> ${artwork.Classification}</p>` : ''}
                ${artwork.CreditLine ? `<p><strong>Credit Line:</strong> ${artwork.CreditLine}</p>` : ''}
                ${artwork.AccessionNumber ? `<p><strong>Accession Number:</strong> ${artwork.AccessionNumber}</p>` : ''}
              </div>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <div>
              <button type="button" class="btn ${isFavorite ? 'btn-warning' : 'btn-outline-warning'} favorite-modal-btn" data-id="${artwork.ObjectID}">
                <i class="fas fa-star me-1"></i>${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div>
            <div>
              <button type="button" class="btn btn-outline-primary edit-artwork-btn" data-id="${artwork.ObjectID}">
                <i class="fas fa-edit me-1"></i>Edit
              </button>
              <button type="button" class="btn btn-outline-danger delete-artwork-btn" data-id="${artwork.ObjectID}">
                <i class="fas fa-trash-alt me-1"></i>Delete
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Show modal and add event listeners
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Edit button listener
    modal.querySelector('.edit-artwork-btn').addEventListener('click', () => {
      bsModal.hide();
      this.showForm('edit', artwork);
    });
    
    // Delete button listener
    modal.querySelector('.delete-artwork-btn').addEventListener('click', () => {
      bsModal.hide();
      this.showDeleteConfirm(artwork);
    });
    
    // Favorite button listener
    modal.querySelector('.favorite-modal-btn').addEventListener('click', (e) => {
      const artworkId = parseInt(e.currentTarget.dataset.id);
      let favorites = this.getFavorites();
      const index = favorites.indexOf(artworkId);
    
      
      // Save to localStorage
      localStorage.setItem('artworkFavorites', JSON.stringify(favorites));
      
      // Update card in the background if visible
      this.updateCardAfterFavoriteToggle(artworkId, index === -1, bsModal);
    });
  },
  
  // Update card appearance after favorite toggle in modal
  updateCardAfterFavoriteToggle(artworkId, isAdding, bsModal) {
    const card = document.querySelector(`.card .favorite-btn[data-id="${artworkId}"]`);
    if (!card) return;
    
    const container = card.closest('.card');
    if (!container) return;
    
    if (isAdding) {
      // Item was added to favorites
      container.classList.add('border-warning');
      const imgContainer = container.querySelector('.card-img-top');
      if (imgContainer && !imgContainer.querySelector('.favorite-badge')) {
        const badge = document.createElement('div');
        badge.className = 'favorite-badge';
        badge.innerHTML = '<i class="fas fa-star text-warning"></i>';
        imgContainer.appendChild(badge);
      }
      card.classList.remove('btn-outline-warning');
      card.classList.add('btn-warning');
    } else {
      // Item was removed from favorites
      container.classList.remove('border-warning');
      const badge = container.querySelector('.favorite-badge');
      if (badge) badge.remove();
      card.classList.remove('btn-warning');
      card.classList.add('btn-outline-warning');
      
      // Handle card removal in favorites view
      if (this.isShowingFavorites) {
        const cardContainer = container.closest('.col-md-4');
        if (cardContainer) {
          cardContainer.classList.add('fade-out');
          setTimeout(() => {
            cardContainer.remove();
            
            // Check if there are no more favorites
            const favorites = this.getFavorites();
            if (favorites.length === 0) {
              bsModal.hide();
              this.showFavorites();
            }
          }, 300);
        }
      }
    }
  },
  
  // Show artwork form for create/edit
  showForm(mode, artwork = null) {
    // Create modal if it doesn't exist
    if (!document.getElementById('artworkFormModal')) {
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal fade';
      modalDiv.id = 'artworkFormModal';
      modalDiv.tabIndex = '-1';
      modalDiv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modalDiv);
    }
    
    const isCreate = mode === 'create';
    const title = isCreate ? 'Add New Artwork' : 'Edit Artwork';
    const submitText = isCreate ? 'Create' : 'Update';
    
    // Set form data
    const formData = artwork || {};
    const artistValue = formData.Artist && Array.isArray(formData.Artist) 
      ? formData.Artist.join(', ') 
      : (formData.Artist || '');
    
    // Build form HTML
    const modal = document.getElementById('artworkFormModal');
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="artworkForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="title" class="form-label">Title*</label>
                  <input type="text" class="form-control" id="title" name="Title" 
                         value="${formData.Title || ''}" required>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="artist" class="form-label">Artist</label>
                  <input type="text" class="form-control" id="artist" name="Artist" 
                         value="${artistValue}">
                  <small class="form-text text-muted">For multiple artists, separate with commas</small>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="date" class="form-label">Date</label>
                  <input type="text" class="form-control" id="date" name="Date" 
                         value="${formData.Date || ''}">
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="medium" class="form-label">Medium</label>
                  <input type="text" class="form-control" id="medium" name="Medium" 
                         value="${formData.Medium || ''}">
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="department" class="form-label">Department</label>
                  <select class="form-select" id="department" name="Department">
                    <option value="" ${!formData.Department ? 'selected' : ''}>Select Department</option>
                    <option value="Architecture & Design" ${formData.Department === 'Architecture & Design' ? 'selected' : ''}>Architecture & Design</option>
                    <option value="Drawings" ${formData.Department === 'Drawings' ? 'selected' : ''}>Drawings</option>
                    <option value="Film" ${formData.Department === 'Film' ? 'selected' : ''}>Film</option>
                    <option value="Media and Performance" ${formData.Department === 'Media and Performance' ? 'selected' : ''}>Media and Performance</option>
                    <option value="Painting & Sculpture" ${formData.Department === 'Painting & Sculpture' ? 'selected' : ''}>Painting & Sculpture</option>
                    <option value="Photography" ${formData.Department === 'Photography' ? 'selected' : ''}>Photography</option>
                    <option value="Prints & Illustrated Books" ${formData.Department === 'Prints & Illustrated Books' ? 'selected' : ''}>Prints & Illustrated Books</option>
                  </select>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="classification" class="form-label">Classification</label>
                  <select class="form-select" id="classification" name="Classification">
                    <option value="" ${!formData.Classification ? 'selected' : ''}>Select Classification</option>
                    <option value="Architecture" ${formData.Classification === 'Architecture' ? 'selected' : ''}>Architecture</option>
                    <option value="Design" ${formData.Classification === 'Design' ? 'selected' : ''}>Design</option>
                    <option value="Drawing" ${formData.Classification === 'Drawing' ? 'selected' : ''}>Drawing</option>
                    <option value="Film" ${formData.Classification === 'Film' ? 'selected' : ''}>Film</option>
                    <option value="Installation" ${formData.Classification === 'Installation' ? 'selected' : ''}>Installation</option>
                    <option value="Painting" ${formData.Classification === 'Painting' ? 'selected' : ''}>Painting</option>
                    <option value="Photography" ${formData.Classification === 'Photography' ? 'selected' : ''}>Photography</option>
                    <option value="Print" ${formData.Classification === 'Print' ? 'selected' : ''}>Print</option>
                    <option value="Sculpture" ${formData.Classification === 'Sculpture' ? 'selected' : ''}>Sculpture</option>
                  </select>
                </div>
                
                <div class="col-md-12 mb-3">
                  <label for="imageUrl" class="form-label">Image URL</label>
                  <input type="url" class="form-control" id="imageUrl" name="ImageURL" 
                         value="${formData.ImageURL || ''}">
                  <small class="form-text text-muted">Enter a valid URL for the artwork image</small>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="dimensions" class="form-label">Dimensions</label>
                  <input type="text" class="form-control" id="dimensions" name="Dimensions" 
                         value="${formData.Dimensions || ''}">
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="creditLine" class="form-label">Credit Line</label>
                  <input type="text" class="form-control" id="creditLine" name="CreditLine" 
                         value="${formData.CreditLine || ''}">
                </div>
                
                <div class="col-md-12 mb-3">
                  <label for="accessionNumber" class="form-label">Accession Number</label>
                  <input type="text" class="form-control" id="accessionNumber" name="AccessionNumber" 
                         value="${formData.AccessionNumber || ''}">
                </div>
              </div>
              
              ${isCreate ? '' : `<input type="hidden" name="ObjectID" value="${formData.ObjectID}">`}
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="saveArtworkBtn">
              <i class="fas fa-save me-1"></i>${submitText}
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Show modal and add event listeners
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Save button listener
    document.getElementById('saveArtworkBtn').addEventListener('click', async () => {
      const form = document.getElementById('artworkForm');
      
      // Simple form validation
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      
      // Process form data
      const formData = new FormData(form);
      const artworkData = {};
      
      for (const [key, value] of formData.entries()) {
        artworkData[key] = value.trim();
      }
      
      // Process artist field as array
      if (artworkData.Artist) {
        artworkData.Artist = artworkData.Artist.split(',').map(artist => artist.trim()).filter(a => a);
      }
      
      // Save or update artwork
      if (isCreate) {
        await Api.createArtwork(artworkData);
      } else {
        const id = artworkData.ObjectID;
        delete artworkData.ObjectID;
        await Api.updateArtwork(id, artworkData);
      }
      
      bsModal.hide();
      
      // Refresh view
      if (this.isShowingFavorites) {
        await this.showFavorites();
      } else {
        await this.loadArtworks(this.currentPage);
      }
    });
  },
  
  // Show delete confirmation
  showDeleteConfirm(artwork) {
    // Create modal if it doesn't exist
    if (!document.getElementById('deleteConfirmModal')) {
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal fade';
      modalDiv.id = 'deleteConfirmModal';
      modalDiv.tabIndex = '-1';
      modalDiv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modalDiv);
    }
    
    const artistText = artwork.Artist && Array.isArray(artwork.Artist) 
      ? artwork.Artist.join(', ') 
      : (artwork.Artist || 'Unknown Artist');
    
    // Build confirmation modal
    const modal = document.getElementById('deleteConfirmModal');
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Artwork</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this artwork?</p>
            <p><strong>Title:</strong> ${artwork.Title || 'Untitled'}</p>
            <p><strong>Artist:</strong> ${artistText}</p>
            <p class="text-danger"><small>This action cannot be undone.</small></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">
              <i class="fas fa-trash-alt me-1"></i>Delete
            </button>
          </div>
        </div>
      </div>
    `;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Delete button listener
    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
      await Api.deleteArtwork(artwork.ObjectID);
      
      // Remove from favorites if present
      const savedFavorites = localStorage.getItem('artworkFavorites');
      if (savedFavorites) {
        let favorites = JSON.parse(savedFavorites);
        const index = favorites.indexOf(artwork.ObjectID);
        if (index > -1) {
          favorites.splice(index, 1);
          localStorage.setItem('artworkFavorites', JSON.stringify(favorites));
        }
      }
      
      bsModal.hide();
      
      // Refresh view
      if (this.isShowingFavorites) {
        await this.showFavorites();
      } else {
        await this.loadArtworks(this.currentPage);
      }
    });
  },
  
  // Render pagination controls
  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    // Hide pagination in favorites view
    if (this.isShowingFavorites) {
      pagination.style.display = 'none';
      return;
    } else {
      pagination.style.display = 'flex';
    }
    
    pagination.innerHTML = '';
    
    // Add previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>`;
    pagination.appendChild(prevLi);
    
    // Add page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageLi = document.createElement('li');
      pageLi.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
      pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pagination.appendChild(pageLi);
    }
    
    // Add next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>`;
    pagination.appendChild(nextLi);
    
    this.addPaginationEvents();
  },
  
  // Add pagination event listeners
  addPaginationEvents() {
    const self = this;
    document.querySelectorAll('.page-link').forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Previous page
        if (index === 0 && self.currentPage > 1) {
          self.loadArtworks(self.currentPage - 1);
          return;
        }
        
        // Next page
        if (index === document.querySelectorAll('.page-link').length - 1 && self.currentPage < self.totalPages) {
          self.loadArtworks(self.currentPage + 1);
          return;
        }
        
        // Specific page number
        if (index > 0 && index < document.querySelectorAll('.page-link').length - 1) {
          const pageNumber = parseInt(link.textContent);
          if (pageNumber !== self.currentPage) {
            self.loadArtworks(pageNumber);
          }
        }
      });
    });
  }
};

export default Gallery;