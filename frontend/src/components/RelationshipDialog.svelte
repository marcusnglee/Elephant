<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { relationshipUI, createRelationship, cancelCreatingRelationship } from '../stores/relationships.js';
  import { uploadedFiles } from '../stores/media.js';
  
  export let open = false;
  export let itemA = null;
  export let itemB = null;
  
  const dispatch = createEventDispatcher();
  
  let relationshipType = '';
  let description = '';
  let strength = 0.5;
  let tags = '';
  let isSubmitting = false;
  let error = null;
  let selectedItemB = itemB;
  
  // Get all uploaded files for item selection
  let allFiles = [];
  
  onMount(() => {
    const unsubscribe = uploadedFiles.subscribe(files => {
      allFiles = files || [];
    });
    return unsubscribe;
  });
  
  // Filter out itemA from available options for itemB
  $: availableFiles = allFiles.filter(file => file.id !== itemA?.id);
  
  async function handleSubmit() {
    if (!itemA || !selectedItemB || !relationshipType.trim()) {
      error = 'Please fill in all required fields';
      return;
    }
    
    isSubmitting = true;
    error = null;
    
    try {
      const relationshipData = {
        itemA: itemA.id,
        itemB: selectedItemB.id,
        relationshipType: relationshipType.trim(),
        description: description.trim() || undefined,
        strength: parseFloat(strength),
        tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : []
      };
      
      await createRelationship(relationshipData);
      dispatch('created');
      handleClose();
      
    } catch (err) {
      error = err.message || 'Failed to create relationship';
    } finally {
      isSubmitting = false;
    }
  }
  
  function handleClose() {
    cancelCreatingRelationship();
    resetForm();
  }
  
  function resetForm() {
    relationshipType = '';
    description = '';
    strength = 0.5;
    tags = '';
    selectedItemB = itemB;
    error = null;
  }
  
  // Preset relationship types for quick selection
  const presetTypes = [
    'reminds me of',
    'contrasts with',
    'follows from',
    'inspired by',
    'similar mood to',
    'opposite feeling from',
    'builds on',
    'related theme'
  ];
  
  function selectPreset(preset) {
    relationshipType = preset;
  }
</script>

{#if open}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Create Relationship</h2>
        
        <!-- Item A Display -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">From</label>
          <div class="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            {#if itemA}
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-blue-800 font-bold">#{itemA.id}</span>
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {itemA.title || itemA.originalName}
                </div>
                <div class="text-sm text-gray-500">
                  {itemA.mimeType} • {new Date(itemA.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Item B Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
          <select 
            bind:value={selectedItemB}
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value={null}>Select a media item...</option>
            {#each availableFiles as file (file.id)}
              <option value={file}>
                #{file.id} - {file.title || file.originalName}
              </option>
            {/each}
          </select>
        </div>
        
        <!-- Relationship Type -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Relationship Type *</label>
          <input
            type="text"
            bind:value={relationshipType}
            placeholder="e.g., 'reminds me of', 'contrasts with'..."
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          
          <!-- Preset buttons -->
          <div class="mt-2 flex flex-wrap gap-2">
            {#each presetTypes as preset}
              <button
                type="button"
                on:click={() => selectPreset(preset)}
                class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {preset}
              </button>
            {/each}
          </div>
        </div>
        
        <!-- Description -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            bind:value={description}
            placeholder="Optional: Explain the relationship in more detail..."
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
          ></textarea>
        </div>
        
        <!-- Strength Slider -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Strength: {strength}
          </label>
          <input
            type="range"
            bind:value={strength}
            min="0"
            max="1"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
          />
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>Weak (0.0)</span>
            <span>Strong (1.0)</span>
          </div>
        </div>
        
        <!-- Tags -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <input
            type="text"
            bind:value={tags}
            placeholder="Optional: comma-separated tags"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div class="text-xs text-gray-500 mt-1">
            Example: visual_similarity, color_theme, mood
          </div>
        </div>
        
        <!-- Error Display -->
        {#if error}
          <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        {/if}
        
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            on:click={handleClose}
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            on:click={handleSubmit}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting || !itemA || !selectedItemB || !relationshipType.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Relationship'}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3B82F6;
    cursor: pointer;
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #3B82F6;
    cursor: pointer;
    border: none;
  }
</style>