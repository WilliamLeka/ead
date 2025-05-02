/* API Service for MoMA Art Collection*/

const Api = {
  // API methods for artwork data
  
  // Get artworks with pagination
  async getArtworks(page = 1, limit = 12) {
    try {
      const response = await fetch(`/api/artworks?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch artworks`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Get a specific artwork by ID
  async getArtworkById(id) {
    try {
      const response = await fetch(`/api/artworks/${id}`);
      
      if (!response.ok) {
        throw new Error('Artwork not found');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Create a new artwork
  async createArtwork(artworkData) {
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
      throw error;
    }
  },
  
  // Update an existing artwork
  async updateArtwork(id, artworkData) {
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
      throw error;
    }
  },
  
  // Delete an artwork
  async deleteArtwork(id) {
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
      throw error;
    }
  },
  
  // Search artworks
  async searchArtworks(params) {
    try {
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
      
      const url = `/api/search?${queryParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search failed`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
  
  // Get filter options for dropdown menus
  async getFilterOptions() {
    try {
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
      throw error;
    }
  }
};

export default Api;