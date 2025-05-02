// Gallery component for displaying artworks
import Api from '../services/api.js';

const Gallery = {
  currentPage: 1,
  totalPages: 1,
  
  // Initialize gallery
  async init() {
    await this.loadArtworks(1);
    this.addCreateButton();
  },
  
  // Add create artwork button
  addCreateButton() {
    const container = document.querySelector('#mainGallery h2');
    if (container) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'd-flex justify-content-between align-items-center mb-4';
      
      const title = container.textContent;
      container.textContent = '';
      
      buttonContainer.innerHTML = `
        <h2>${title}</h2>
        <button id="createArtworkBtn" class="btn btn-success">
          <i class="fas fa-plus-circle me-2"></i>Add New Artwork
        </button>
      `;
      
      container.parentNode.insertBefore(buttonContainer, container);
      container.remove();
      
      document.getElementById('createArtworkBtn').addEventListener('click', () => {
        this.showForm('create');
      });
    }
  },
  
  // Load artworks with pagination
  async loadArtworks(page, limit = 12) {
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'flex';
    
    const data = await Api.getArtworks(page, limit);
    
    this.currentPage = data.currentPage;
    this.totalPages = data.totalPages;
    
    this.renderArtworks(data.artworks);
    this.renderPagination();
    
    if (spinner) spinner.style.display = 'none';
  },
  
  // Render artworks to the page
  renderArtworks(artworks) {
    const container = document.getElementById('artworksContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (artworks.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p class="my-5">No artworks found.</p></div>';
      return;
    }
    
    artworks.forEach(artwork => {
      const artistText = artwork.Artist && Array.isArray(artwork.Artist) 
        ? artwork.Artist.join(', ') 
        : (artwork.Artist || 'Unknown Artist');
        
      const imageUrl = artwork.ImageURL || 'https://placehold.co/400x400?text=No+Image';
      
      const artworkCard = document.createElement('div');
      artworkCard.className = 'col-md-4 col-lg-3 mb-4';
      artworkCard.innerHTML = `
        <div class="card h-100">
          <div class="card-img-top">
            <img src="${imageUrl}" class="card-img-top" alt="${artwork.Title}" 
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
  
  // Add view button event listeners
  addViewListeners() {
    document.querySelectorAll('.view-artwork').forEach(button => {
      button.addEventListener('click', async (e) => {
        const artworkId = e.currentTarget.dataset.id;
        this.viewDetails(artworkId);
      });
    });
  },
  
  // View artwork details
  async viewDetails(artworkId) {
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.display = 'flex';
    
    const artwork = await Api.getArtworkById(artworkId);
    this.showModal(artwork);
    
    if (spinner) spinner.style.display = 'none';
  },
  
  // Show artwork details in modal
  showModal(artwork) {
    if (!document.getElementById('artworkModal')) {
      const modalDiv = document.createElement('div');
      modalDiv.className = 'modal fade';
      modalDiv.id = 'artworkModal';
      modalDiv.tabIndex = '-1';
      modalDiv.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modalDiv);
    }
    
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
                <img src="${imageUrl}" class="img-fluid mb-3" alt="${artwork.Title}" 
                     onerror="this.src='https://placehold.co/600x600?text=Image+Error';">
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
          <div class="modal-footer">
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
    `;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.querySelector('.edit-artwork-btn').addEventListener('click', () => {
      bsModal.hide();
      this.showForm('edit', artwork);
    });
    
    modal.querySelector('.delete-artwork-btn').addEventListener('click', () => {
      bsModal.hide();
      this.showDeleteConfirm(artwork);
    });
  },
  
  // Show artwork form for create/edit
  showForm(mode, artwork = null) {
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
    
    const formData = artwork || {};
    const artistValue = formData.Artist && Array.isArray(formData.Artist) 
      ? formData.Artist.join(', ') 
      : (formData.Artist || '');
    
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
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    document.getElementById('saveArtworkBtn').addEventListener('click', async () => {
      const form = document.getElementById('artworkForm');
      
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      
      const formData = new FormData(form);
      const artworkData = {};
      
      for (const [key, value] of formData.entries()) {
        artworkData[key] = value.trim();
      }
      
      if (artworkData.Artist) {
        artworkData.Artist = artworkData.Artist.split(',').map(artist => artist.trim()).filter(a => a);
      }
      
      const spinner = document.getElementById('spinner');
      if (spinner) spinner.style.display = 'flex';
      
      if (isCreate) {
        await Api.createArtwork(artworkData);
      } else {
        const id = artworkData.ObjectID;
        delete artworkData.ObjectID;
        await Api.updateArtwork(id, artworkData);
      }
      
      bsModal.hide();
      
      this.showNotification(
        isCreate ? 'Artwork created successfully' : 'Artwork updated successfully',
        'success'
      );
      
      await this.loadArtworks(this.currentPage);
      
      if (spinner) spinner.style.display = 'none';
    });
  },
  
  // Show delete confirmation
  showDeleteConfirm(artwork) {
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
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
      const spinner = document.getElementById('spinner');
      if (spinner) spinner.style.display = 'flex';
      
      await Api.deleteArtwork(artwork.ObjectID);
      
      bsModal.hide();
      
      this.showNotification(
        'Artwork deleted successfully',
        'success'
      );
      
      await this.loadArtworks(this.currentPage);
      
      if (spinner) spinner.style.display = 'none';
    });
  },
  
  // Show notification
  showNotification(message, type = 'info') {
    if (!document.getElementById('notificationContainer')) {
      const container = document.createElement('div');
      container.id = 'notificationContainer';
      container.className = 'position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    const container = document.getElementById('notificationContainer');
    const id = 'notification-' + Date.now();
    
    const notification = document.createElement('div');
    notification.id = id;
    notification.className = `toast align-items-center text-white bg-${type} border-0`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    
    notification.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    container.appendChild(notification);
    
    const toastInstance = new bootstrap.Toast(notification, {
      delay: 5000
    });
    toastInstance.show();
    
    notification.addEventListener('hidden.bs.toast', () => {
      notification.remove();
    });
  },
  
  // Render pagination
  renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>`;
    pagination.appendChild(prevLi);
    
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageLi = document.createElement('li');
      pageLi.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
      pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      pagination.appendChild(pageLi);
    }
    
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
        
        if (index === 0 && self.currentPage > 1) {
          self.loadArtworks(self.currentPage - 1);
          return;
        }
        
        if (index === document.querySelectorAll('.page-link').length - 1 && self.currentPage < self.totalPages) {
          self.loadArtworks(self.currentPage + 1);
          return;
        }
        
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