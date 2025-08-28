<script>
  import { onMount } from 'svelte';
  import { getRelationshipsForItem, deleteRelationship } from '../stores/relationships.js';
  import { uploadedFiles } from '../stores/media.js';
  
  export let itemId;
  
  let relationships = [];
  let mediaItem = null;
  let loading = true;
  let error = null;
  let allFiles = [];
  
  onMount(() => {
    const unsubscribe = uploadedFiles.subscribe(files => {
      allFiles = files || [];
    });
    loadRelationships();
    return unsubscribe;
  });
  
  async function loadRelationships() {
    if (!itemId) return;
    
    loading = true;
    error = null;
    
    try {
      const result = await getRelationshipsForItem(itemId);
      mediaItem = result.mediaItem;
      relationships = result.relationships;
    } catch (err) {
      error = err.message || 'Failed to load relationships';
    } finally {
      loading = false;
    }
  }
  
  // Get the "other" item in a relationship (not the current item)
  function getOtherItem(relationship) {
    const otherId = relationship.itemA === itemId ? relationship.itemB : relationship.itemA;
    return allFiles.find(file => file.id === otherId);
  }
  
  // Get relationship direction text
  function getRelationshipText(relationship) {
    const isFromCurrent = relationship.itemA === itemId;
    const otherItem = getOtherItem(relationship);
    
    if (isFromCurrent) {
      return `${relationship.relationshipType} "${otherItem?.title || otherItem?.originalName || `#${relationship.itemB}`}"`;
    } else {
      return `"${otherItem?.title || otherItem?.originalName || `#${relationship.itemA}`}" ${relationship.relationshipType} this`;
    }
  }
  
  async function handleDeleteRelationship(relationship) {
    if (!confirm('Are you sure you want to delete this relationship?')) {
      return;
    }
    
    try {
      await deleteRelationship(relationship.itemA, relationship.itemB);
      // Reload relationships
      await loadRelationships();
    } catch (err) {
      console.error('Failed to delete relationship:', err);
      alert('Failed to delete relationship: ' + err.message);
    }
  }
  
  function getStrengthColor(strength) {
    if (strength >= 0.8) return 'bg-green-100 text-green-800';
    if (strength >= 0.6) return 'bg-yellow-100 text-yellow-800';
    if (strength >= 0.4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }
  
  function getStrengthLabel(strength) {
    if (strength >= 0.8) return 'Strong';
    if (strength >= 0.6) return 'Medium';
    if (strength >= 0.4) return 'Weak';
    return 'Very Weak';
  }
  
  // Refresh when itemId changes
  $: if (itemId) {
    loadRelationships();
  }
</script>

<div class="bg-white rounded-lg shadow p-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">
    Relationships
    {#if !loading && relationships.length > 0}
      <span class="text-sm font-normal text-gray-500">({relationships.length})</span>
    {/if}
  </h3>
  
  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="w-1 h-1 bg-black rounded-full animate-pulse"></div>
    </div>
  {:else if error}
    <div class="text-center py-4">
      <div class="w-2 h-2 bg-red-300 rounded-full mx-auto mb-2"></div>
      <p class="text-sm text-gray-600">Error loading relationships</p>
      <button 
        on:click={loadRelationships}
        class="text-xs text-gray-500 hover:text-black underline"
      >
        Retry
      </button>
    </div>
  {:else if relationships.length === 0}
    <div class="text-center py-8 text-gray-500">
      <div class="w-2 h-2 bg-gray-200 rounded-full mx-auto mb-4"></div>
      <p class="text-sm">No connections</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each relationships as relationship (relationship.itemA + '-' + relationship.itemB)}
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-medium text-gray-900 mb-1">
                {getRelationshipText(relationship)}
              </div>
              
              {#if relationship.description}
                <p class="text-gray-600 text-sm mb-2">
                  {relationship.description}
                </p>
              {/if}
              
              <div class="flex items-center space-x-4 text-xs text-gray-500">
                <span class="flex items-center">
                  <span class="inline-block w-2 h-2 rounded-full {getStrengthColor(relationship.strength)} mr-1"></span>
                  {getStrengthLabel(relationship.strength)} ({relationship.strength})
                </span>
                
                <span>
                  By {relationship.createdBy}
                </span>
                
                <span>
                  {new Date(relationship.createdAt).toLocaleDateString()}
                </span>
                
                {#if relationship.tags && relationship.tags.length > 0}
                  <div class="flex space-x-1">
                    {#each relationship.tags as tag}
                      <span class="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {tag}
                      </span>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
            
            <div class="ml-4 flex space-x-2">
              <button
                on:click={() => handleDeleteRelationship(relationship)}
                class="text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>