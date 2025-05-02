/**
 * API service for MoMA Art Collection
 * Handles communication with the server
 */

const ApiService = {
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
   * Fetch artworks with pagination (READ)
   */
  async getArtworks(page = 1, limit = 12) {
    this.logDebug(`Getting artworks page ${page} with limit ${limit}`);
    
    try {
      const response = await fetch(`/api/artworks?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch artworks: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
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
      const response = await fetch(`/api/artworks/${id}`);
      
      if (!response.ok) {
        throw new Error('Artwork not found');
      }
      
      return await response.json();
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
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artworkData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create artwork');
      }
      
      return await response.json();
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
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(artworkData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update artwork');
      }
      
      return await response.json();
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
      const response = await fetch(`/api/artworks/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete artwork');
      }
      
      return await response.json();
    } catch (error) {
      this.logError(`Failed to delete artwork with ID ${id}`, error);
      throw error;
    }
  },
  
  /**
   * Search artworks 
   */
  async searchArtworks(params) {
    try {
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
      
      const searchQuery = params.q || '';
      this.logDebug(`Searching for: "${searchQuery}" in field: ${params.field || 'all'}`);
      this.logDebug(`Filters: department=${params.department || 'any'}, classification=${params.classification || 'any'}`);
      
      // Make request
      const url = `/api/search?${queryParams.toString()}`;
      this.logDebug(`Making search request to: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
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

export default ApiService;