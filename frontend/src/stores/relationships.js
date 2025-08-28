import { writable } from 'svelte/store';

// Store for relationships
export const relationships = writable([]);

// Store for graph data
export const graphData = writable({ nodes: [], edges: [] });

// Store for relationship creation UI state
export const relationshipUI = writable({
  isCreating: false,
  selectedItemA: null,
  selectedItemB: null,
  showCreateDialog: false
});

// API base URL - use relative URL for Vite proxy
const API_BASE = '/api';

// Create a new relationship
export async function createRelationship(relationshipData) {
  try {
    relationshipUI.update(state => ({ ...state, isCreating: true }));

    const response = await fetch(`${API_BASE}/relationships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(relationshipData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Create relationship failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Update relationships store
    relationships.update(rels => [...rels, result.relationship]);
    
    // Refresh graph data
    await fetchGraphData();
    
    relationshipUI.update(state => ({
      ...state,
      isCreating: false,
      showCreateDialog: false,
      selectedItemA: null,
      selectedItemB: null
    }));

    return result.relationship;
    
  } catch (error) {
    relationshipUI.update(state => ({ ...state, isCreating: false }));
    throw error;
  }
}

// Fetch all relationships
export async function fetchRelationships(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    // Add filters if provided
    if (filters.itemId) params.append('itemId', filters.itemId);
    if (filters.createdBy) params.append('createdBy', filters.createdBy);
    if (filters.relationshipType) params.append('relationshipType', filters.relationshipType);
    
    const url = `${API_BASE}/relationships${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch relationships: ${response.statusText}`);
    }
    
    const result = await response.json();
    relationships.set(result.relationships);
    return result.relationships;
    
  } catch (error) {
    console.error('Error fetching relationships:', error);
    throw error;
  }
}

// Get a specific relationship
export async function getRelationship(itemA, itemB) {
  try {
    const response = await fetch(`${API_BASE}/relationships/${itemA}/${itemB}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Relationship doesn't exist
      }
      throw new Error(`Failed to get relationship: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.relationship;
    
  } catch (error) {
    console.error('Error getting relationship:', error);
    throw error;
  }
}

// Update an existing relationship
export async function updateRelationship(itemA, itemB, updates) {
  try {
    const response = await fetch(`${API_BASE}/relationships/${itemA}/${itemB}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Update relationship failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Update the relationship in the store
    relationships.update(rels => 
      rels.map(rel => 
        (rel.itemA === itemA && rel.itemB === itemB) || 
        (rel.itemA === itemB && rel.itemB === itemA) 
          ? result.relationship 
          : rel
      )
    );
    
    // Refresh graph data
    await fetchGraphData();
    
    return result.relationship;
    
  } catch (error) {
    console.error('Error updating relationship:', error);
    throw error;
  }
}

// Delete a relationship
export async function deleteRelationship(itemA, itemB) {
  try {
    const response = await fetch(`${API_BASE}/relationships/${itemA}/${itemB}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Delete relationship failed: ${response.statusText}`);
    }
    
    // Remove from relationships store
    relationships.update(rels => 
      rels.filter(rel => 
        !((rel.itemA === itemA && rel.itemB === itemB) || 
          (rel.itemA === itemB && rel.itemB === itemA))
      )
    );
    
    // Refresh graph data
    await fetchGraphData();
    
    return true;
    
  } catch (error) {
    console.error('Error deleting relationship:', error);
    throw error;
  }
}

// Get all relationships for a specific media item
export async function getRelationshipsForItem(itemId) {
  try {
    const response = await fetch(`${API_BASE}/media/${itemId}/relationships`);
    
    if (!response.ok) {
      throw new Error(`Failed to get relationships for item: ${response.statusText}`);
    }
    
    const result = await response.json();
    return {
      mediaItem: result.mediaItem,
      relationships: result.relationships
    };
    
  } catch (error) {
    console.error('Error getting relationships for item:', error);
    throw error;
  }
}

// Fetch graph data for visualization
export async function fetchGraphData() {
  try {
    const response = await fetch(`${API_BASE}/relationships/graph`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch graph data: ${response.statusText}`);
    }
    
    const result = await response.json();
    graphData.set(result.graph);
    return result.graph;
    
  } catch (error) {
    console.error('Error fetching graph data:', error);
    throw error;
  }
}

// UI Helper functions
export function startCreatingRelationship(itemA, itemB = null) {
  relationshipUI.update(state => ({
    ...state,
    selectedItemA: itemA,
    selectedItemB: itemB,
    showCreateDialog: true
  }));
}

export function cancelCreatingRelationship() {
  relationshipUI.update(state => ({
    ...state,
    showCreateDialog: false,
    selectedItemA: null,
    selectedItemB: null
  }));
}

// Helper to check if two items already have a relationship
export async function checkRelationshipExists(itemA, itemB) {
  try {
    const relationship = await getRelationship(itemA, itemB);
    return relationship !== null;
  } catch (error) {
    return false;
  }
}