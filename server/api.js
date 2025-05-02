/* API service for MoMA Art Collection */

const ApiService = {
  DEBUG: true,
  
  // Log debug message
  logDebug(m, d) {
    if (this.DEBUG) console.log(`[API Debug] ${m}`, d);
  },
  
  // Log error message
  logError(m, e) {
    console.error(`[API Error] ${m}`, e);
  },
  
  // Get artwork list with pagination
  async getArtworks(page = 1, limit = 12) {
    try {
      const res = await fetch(`/api/artworks?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      this.logError('Failed to get artworks', e);
      throw e;
    }
  },
  
  // Get specific artwork by ID
  async getArtworkById(id) {
    try {
      const res = await fetch(`/api/artworks/${id}`);
      if (!res.ok) throw new Error('Artwork not found');
      return await res.json();
    } catch (e) {
      this.logError(`Failed to get artwork ${id}`, e);
      throw e;
    }
  },
  
  // Create new artwork
  async createArtwork(data) {
    try {
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Create failed');
      return await res.json();
    } catch (e) {
      this.logError('Failed to create artwork', e);
      throw e;
    }
  },
  
  // Update existing artwork
  async updateArtwork(id, data) {
    try {
      const res = await fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Update failed');
      return await res.json();
    } catch (e) {
      this.logError(`Failed to update artwork ${id}`, e);
      throw e;
    }
  },
  
  // Delete artwork
  async deleteArtwork(id) {
    try {
      const res = await fetch(`/api/artworks/${id}`, {method: 'DELETE'});
      if (!res.ok) throw new Error('Delete failed');
      return await res.json();
    } catch (e) {
      this.logError(`Failed to delete artwork ${id}`, e);
      throw e;
    }
  },
  
  // Search for artworks with filters
  async searchArtworks(params) {
    try {
      let qp = new URLSearchParams();
      
      if (typeof params === 'string') {
        qp.append('q', params);
      } else {
        if (params.q?.trim()) qp.append('q', params.q.trim());
        else if (params.department || params.classification) qp.append('q', '*');
        
        if (params.field && params.field !== 'all') qp.append('field', params.field);
        if (params.department?.trim()) qp.append('department', params.department);
        if (params.classification?.trim()) qp.append('classification', params.classification);
      }
      
      if (qp.toString() === '') qp.append('q', '*');
      
      const res = await fetch(`/api/search?${qp.toString()}`);
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      return await res.json();
    } catch (e) {
      this.logError(`Search failed`, e);
      throw e;
    }
  },
  
  // Get filter options for search
  async getFilterOptions() {
    return {
      departments: [
        'Architecture & Design', 'Drawings', 'Film', 'Media and Performance',
        'Painting & Sculpture', 'Photography', 'Prints & Illustrated Books'
      ],
      classifications: [
        'Architecture', 'Design', 'Drawing', 'Film', 'Installation',
        'Painting', 'Photography', 'Print', 'Sculpture'
      ]
    };
  }
};

export default ApiService;