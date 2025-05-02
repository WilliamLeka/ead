/* API Service for MoMA Art Collection using AJAX */

const Api = {
  // Debug mode toggle
  DEBUG: true,
  
  /**
   * Log debug messages
   */
  logDebug(message, data) {
    if (this.DEBUG) {
      console.log(`[API Debug] ${message}`);
      if (data !== undefined) {
        console.log(data);
      }
    }
  },
  
  /**
   * Log errors
   */
  logError(message, error) {
    console.error(`[API Error] ${message}`);
    if (error) {
      console.error(error);
    }
  },
  
  /**
   * Create a new XMLHttpRequest with Promise wrapper
   */
  ajaxRequest(method, url, data = null) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      
      if (method !== 'GET' && data) {
        xhr.setRequestHeader('Content-Type', 'application/json');
      }
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Error parsing response'));
          }
        } else {
          reject(new Error(`Request failed with status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network error occurred'));
      };
      
      if (method === 'GET' || !data) {
        xhr.send();
      } else {
        xhr.send(JSON.stringify(data));
      }
    });
  },
  
  /**
   * Fetch artworks with pagination (READ)
   */
  async getArtworks(page = 1, limit = 12) {
    this.logDebug(`Getting artworks page ${page} with limit ${limit}`);
    
    try {
      return await this.ajaxRequest('GET', `/api/artworks?page=${page}&limit=${limit}`);
    } catch (error) {
      this.logError('Failed to get artworks', error);
      throw error;
    }
  },
  
  /**
   * Fetch artwork by ID (READ)
   */
  async getArtworkById(id) {
    this.logDebug(`Getting artwork with ID: ${id}`);
    
    try {
      return await this.ajaxRequest('GET', `/api/artworks/${id}`);
    } catch (error) {
      this.logError(`Failed to get artwork with ID ${id}`, error);
      throw error;
    }
  },
  
  /**
   * Create new artwork (CREATE)
   */
  async createArtwork(artworkData) {
    this.logDebug(`Creating new artwork: ${artworkData.Title}`, artworkData);
    
    try {
      return await this.ajaxRequest('POST', '/api/artworks', artworkData);
    } catch (error) {
      this.logError('Failed to create artwork', error);
      throw error;
    }
  },
  
  /**
   * Update artwork (UPDATE)
   */
  async updateArtwork(id, artworkData) {
    this.logDebug(`Updating artwork with ID: ${id}`, artworkData);
    
    try {
      return await this.ajaxRequest('PUT', `/api/artworks/${id}`, artworkData);
    } catch (error) {
      this.logError(`Failed to update artwork with ID ${id}`, error);
      throw error;
    }
  },
  
  /**
   * Delete artwork (DELETE)
   */
  async deleteArtwork(id) {
    this.logDebug(`Deleting artwork with ID: ${id}`);
    
    try {
      return await this.ajaxRequest('DELETE', `/api/artworks/${id}`);
    } catch (error) {
      this.logError(`Failed to delete artwork with ID ${id}`, error);
      throw error;
    }
  },
  
  /**
   * Search artworks with advanced filtering
   */
  async searchArtworks(params) {
    // Handle different param formats
    let queryParams = new URLSearchParams();
    
    if (typeof params === 'string') {
      // If params is a string, use as query
      queryParams.append('q', params);
    } else {
      // Add query if provided
      if (params.q && params.q.trim() !== '') {
        queryParams.append('q', params.q.trim());
      } else if (params.department || params.classification) {
        // If no query but has filters, use wildcard
        queryParams.append('q', '*');
      }
      
      // Add filters if provided
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
    
    // If no parameters, use default wildcard query
    if (queryParams.toString() === '') {
      queryParams.append('q', '*');
    }
    
    const searchQuery = typeof params === 'object' ? (params.q || '') : params;
    this.logDebug(`Searching for: "${searchQuery}"`);
    
    try {
      const url = `/api/search?${queryParams.toString()}`;
      return await this.ajaxRequest('GET', url);
    } catch (error) {
      this.logError(`Search failed`, error);
      throw error;
    }
  },
  
  /**
   * Get filter options (hardcoded for now)
   */
  async getFilterOptions() {
    this.logDebug('Getting filter options');
    
    try {
      // Hardcoded values since endpoint isn't available
      return {
        departments: [
          'Architecture & Design',
          'Drawings',
          'Film',
          'Media and Performance',
          'Painting & Sculpture',
          'Photography',
          'Prints & Illustrated Books'
        ],
        classifications: [
          'Architecture',
          'Design',
          'Drawing',
          'Film',
          'Installation',
          'Painting',
          'Photography',
          'Print',
          'Sculpture'
        ]
      };
    } catch (error) {
      this.logError('Failed to get filter options', error);
      throw error;
    }
  }
};

export default Api;