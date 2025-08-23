import { writable } from 'svelte/store';

// Store for uploaded files
export const uploadedFiles = writable([]);

// Store for upload progress
export const uploadProgress = writable({
  isUploading: false,
  current: 0,
  total: 0,
  currentFile: null
});

// API base URL
const API_BASE = 'http://localhost:3000/api';

// Upload files to the server
export async function uploadFiles(filesWithContext) {
  uploadProgress.update(state => ({
    ...state,
    isUploading: true,
    current: 0,
    total: filesWithContext.length
  }));

  try {
    const formData = new FormData();
    
    // Add files to FormData
    filesWithContext.forEach((fileData, index) => {
      formData.append('files', fileData.file);
      
      // Add metadata for each file
      if (fileData.context.title) {
        formData.append(`title_${fileData.file.name}`, fileData.context.title);
      }
      if (fileData.context.description) {
        formData.append(`description_${fileData.file.name}`, fileData.context.description);
      }
      if (fileData.context.tags.length > 0) {
        formData.append(`tags_${fileData.file.name}`, fileData.context.tags.join(','));
      }
    });

    const response = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      body: formData,
      // TODO: Add authentication headers when auth is implemented
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Update uploaded files store
    uploadedFiles.update(files => [...result.uploaded, ...files]);
    
    uploadProgress.update(state => ({
      ...state,
      isUploading: false,
      current: 0,
      total: 0,
      currentFile: null
    }));

    return result;
    
  } catch (error) {
    uploadProgress.update(state => ({
      ...state,
      isUploading: false,
      current: 0,
      total: 0,
      currentFile: null
    }));
    throw error;
  }
}

// Fetch all media items
export async function fetchMediaItems() {
  try {
    const response = await fetch(`${API_BASE}/media`);
    if (!response.ok) {
      throw new Error(`Failed to fetch media: ${response.statusText}`);
    }
    
    const result = await response.json();
    uploadedFiles.set(result.items);
    return result.items;
    
  } catch (error) {
    console.error('Error fetching media items:', error);
    throw error;
  }
}

// Update media item metadata
export async function updateMediaItem(id, updates) {
  try {
    const response = await fetch(`${API_BASE}/media/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Update the item in the store
    uploadedFiles.update(files => 
      files.map(file => file.id === id ? result.item : file)
    );
    
    return result.item;
    
  } catch (error) {
    console.error('Error updating media item:', error);
    throw error;
  }
}