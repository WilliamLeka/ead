/* API Service for MoMA Art Collection */

const Api = {
  // Debug toggle
  DEBUG: true,
  
  // Ajax request with Promise
  ajaxRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = 30000;
      
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              reject(new Error('Error parsing response: ' + error.message));
            }
          } else {
            reject(new Error(`Request failed with status: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };
      
      xhr.ontimeout = function() {
        reject(new Error('Request timed out'));
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error occurred'));
      };
      
      xhr.open(method, url, true);
      
      if (method !== 'GET' && data) {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }
      
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      
      if (method === 'GET' || !data) {
        xhr.send();
      } else {
        xhr.send(JSON.stringify(data));
      }
    });
  },
  
  // Get artworks with pagination
  async getArtworks(page = 1, limit = 12) {
    try {
      return await this.ajaxRequest('GET', `/api/artworks?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error(`[API Error] Failed to get artworks`, error);
      throw error;
    }
  },
  
  // Get artwork by ID
  async getArtworkById(id) {
    try {
      return await this.ajaxRequest('GET', `/api/artworks/${id}`);
    } catch (error) {
      console.error(`[API Error] Failed to get artwork with ID ${id}`, error);
      throw error;
    }
  },
  
  // Create new artwork
  async createArtwork(artworkData) {
    try {
      return await this.ajaxRequest('POST', '/api/artworks', artworkData);
    } catch (error) {
      console.error('[API Error] Failed to create artwork', error);
      throw error;
    }
  },
  
  // Update existing artwork
  async updateArtwork(id, artworkData) {
    try {
      return await this.ajaxRequest('PUT', `/api/artworks/${id}`, artworkData);
    } catch (error) {
      console.error(`[API Error] Failed to update artwork with ID ${id}`, error);
      throw error;
    }
  },
  
  // Delete artwork
  async deleteArtwork(id) {
    try {
      return await this.ajaxRequest('DELETE', `/api/artworks/${id}`);
    } catch (error) {
      console.error(`[API Error] Failed to delete artwork with ID ${id}`, error);
      throw error;
    }
  },
  
  // Search artworks with filters
  async searchArtworks(params) {
    let queryParams = new URLSearchParams();
    
    if (typeof params === 'string') {
      queryParams.append('q', params);
    } else {
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
    }
    
    if (queryParams.toString() === '') {
      queryParams.append('q', '*');
    }
    
    try {
      const url = `/api/search?${queryParams.toString()}`;
      return await this.ajaxRequest('GET', url);
    } catch (error) {
      console.error(`[API Error] Search failed`, error);
      throw error;
    }
  },
  
  // Get filter options
  async getFilterOptions() {
    try {
      return await this.ajaxRequest('GET', '/api/filters');
    } catch (error) {
      // Fallback to hardcoded values
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
  }
};

export default Api;