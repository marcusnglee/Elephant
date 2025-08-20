<script>
  let { 
    files = [],
    oncontextcomplete,
    onback
  } = $props();
  
  let activeFileIndex = $state(0);
  let filesWithContext = $state([]);
  
  // Initialize context data for each file
  $effect(() => {
    if (files.length > 0 && filesWithContext.length === 0) {
      filesWithContext = files.map(fileData => ({
        ...fileData,
        context: {
          title: '',
          description: '',
          uploadThoughts: '',
          tags: []
        }
      }));
    }
  });
  
  function addTag(fileIndex, event) {
    if (event.key === 'Enter' && event.target.value.trim()) {
      const tag = event.target.value.trim();
      if (!filesWithContext[fileIndex].context.tags.includes(tag)) {
        filesWithContext[fileIndex].context.tags = [...filesWithContext[fileIndex].context.tags, tag];
      }
      event.target.value = '';
    }
  }
  
  function removeTag(fileIndex, tagIndex) {
    filesWithContext[fileIndex].context.tags = filesWithContext[fileIndex].context.tags.filter((_, i) => i !== tagIndex);
  }
  
  function handleSubmit() {
    // Validate that each file has required context
    // At minimum, check that each file has a title
    for (let i = 0; i < filesWithContext.length; i++) {
      const fileData = filesWithContext[i];
      if (!fileData.context.title.trim()) {
        alert(`Please add a title for file ${i + 1}: ${fileData.file.name}`);
        activeFileIndex = i; // Focus on the file that needs attention
        return;
      }
    }
    
    // All validation passed, proceed with upload
    oncontextcomplete?.({ filesWithContext });
  }
  
  function handleBack() {
    onback?.();
  }
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
</script>

<div class="space-y-6">
  <!-- File tabs for navigation -->
  {#if filesWithContext.length > 1}
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        {#each filesWithContext as fileData, index}
          <button
            class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm"
            class:border-blue-500={index === activeFileIndex}
            class:text-blue-600={index === activeFileIndex}
            class:border-transparent={index !== activeFileIndex}
            class:text-gray-500={index !== activeFileIndex}
            onclick={() => activeFileIndex = index}
          >
            File {index + 1}
            {#if fileData.context.title}
              - {fileData.context.title.slice(0, 20)}{fileData.context.title.length > 20 ? '...' : ''}
            {/if}
          </button>
        {/each}
      </nav>
    </div>
  {/if}
  
  <!-- Current file context form -->
  {#if filesWithContext.length > 0}
    {@const currentFile = filesWithContext[activeFileIndex]}
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- File preview -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">File Preview</h3>
        
        <div class="border border-gray-200 rounded-lg p-4">
          {#if currentFile.preview}
            <img 
              src={currentFile.preview} 
              alt={currentFile.file.name}
              class="w-full h-64 object-cover rounded"
            />
          {:else}
            <div class="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
              <div class="text-center">
                <svg class="h-16 w-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <p class="mt-2 text-sm text-gray-500">{currentFile.file.type}</p>
              </div>
            </div>
          {/if}
          
          <div class="mt-4">
            <p class="font-medium text-gray-900">{currentFile.file.name}</p>
            <p class="text-sm text-gray-500">{formatFileSize(currentFile.file.size)}</p>
          </div>
        </div>
      </div>
      
      <!-- Context form -->
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-gray-900">Add Context</h3>
        
        <div class="space-y-4">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              bind:value={currentFile.context.title}
              placeholder="Give this file a meaningful title"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <!-- Description -->
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              bind:value={currentFile.context.description}
              placeholder="Describe what this file shows or contains"
              rows="3"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <!-- Upload thoughts -->
          <div>
            <label for="thoughts" class="block text-sm font-medium text-gray-700">
              Your Thoughts
            </label>
            <textarea
              id="thoughts"
              bind:value={currentFile.context.uploadThoughts}
              placeholder="Why is this meaningful to you? What memories or feelings does it evoke?"
              rows="3"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <!-- Tags -->
          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div class="mt-1 space-y-2">
              <!-- Existing tags -->
              {#if currentFile.context.tags.length > 0}
                <div class="flex flex-wrap gap-2">
                  {#each currentFile.context.tags as tag, tagIndex}
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                      <button
                        type="button"
                        onclick={() => removeTag(activeFileIndex, tagIndex)}
                        class="ml-1 h-4 w-4 rounded-full hover:bg-blue-200 flex items-center justify-center"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                      </button>
                    </span>
                  {/each}
                </div>
              {/if}
              
              <!-- Add tag input -->
              <input
                type="text"
                placeholder="Type a tag and press Enter"
                onkeydown={(e) => addTag(activeFileIndex, e)}
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="text-xs text-gray-500">
                Use tags like: family, vacation, work, inspiration, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Navigation between files -->
    {#if filesWithContext.length > 1}
      <div class="flex justify-between items-center pt-6 border-t">
        <button
          onclick={() => activeFileIndex = Math.max(0, activeFileIndex - 1)}
          disabled={activeFileIndex === 0}
          class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Previous
        </button>
        
        <span class="text-sm text-gray-500">
          {activeFileIndex + 1} of {filesWithContext.length}
        </span>
        
        <button
          onclick={() => activeFileIndex = Math.min(filesWithContext.length - 1, activeFileIndex + 1)}
          disabled={activeFileIndex === filesWithContext.length - 1}
          class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    {/if}
  {/if}
  
  <!-- Action buttons -->
  <div class="flex justify-between pt-6 border-t">
    <button
      onclick={handleBack}
      class="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
    >
      Back to Files
    </button>
    
    <button
      onclick={handleSubmit}
      class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
      Upload Files
    </button>
  </div>
</div>