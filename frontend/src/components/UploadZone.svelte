<script>
  let { onfilesselected } = $props();
  
  let fileInput;
  let isDragOver = $state(false);
  let selectedFiles = $state([]);
  
  function handleDragOver(event) {
    event.preventDefault();
    isDragOver = true;
  }
  
  function handleDragLeave(event) {
    event.preventDefault();
    isDragOver = false;
  }
  
  function handleDrop(event) {
    event.preventDefault();
    isDragOver = false;
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }
  
  function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
  }
  
  function processFiles(files) {
    selectedFiles = files.map(file => ({
      file,
      id: crypto.randomUUID(),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    onfilesselected?.({ files: selectedFiles });
  }
  
  function openFileDialog() {
    fileInput.click();
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
  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    multiple
    accept="*/*"
    onchange={handleFileSelect}
    class="hidden"
  />
  
  <!-- Drop zone -->
  <div
    class="upload-zone border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer"
    class:dragover={isDragOver}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={openFileDialog}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && openFileDialog()}
  >
    <div class="space-y-4">
      <div class="text-gray-400">
        <svg class="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
      </div>
      
      <div>
        <p class="text-xl font-semibold text-gray-700">
          {isDragOver ? 'Drop your files here' : 'Upload your media files'}
        </p>
        <p class="text-gray-500 mt-2">
          Drag and drop files here, or <span class="text-blue-600 font-medium">click to browse</span>
        </p>
        <p class="text-sm text-gray-400 mt-1">
          Images, videos, documents, audio, and more
        </p>
      </div>
    </div>
  </div>
  
  <!-- File preview (if files are selected but not yet processed) -->
  {#if selectedFiles.length > 0}
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-900">
        Selected Files ({selectedFiles.length})
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each selectedFiles as fileData}
          <div class="border border-gray-200 rounded-lg p-4 space-y-3">
            {#if fileData.preview}
              <img 
                src={fileData.preview} 
                alt={fileData.file.name}
                class="w-full h-32 object-cover rounded"
              />
            {:else}
              <div class="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            {/if}
            
            <div>
              <p class="font-medium text-gray-900 truncate" title={fileData.file.name}>
                {fileData.file.name}
              </p>
              <p class="text-sm text-gray-500">
                {formatFileSize(fileData.file.size)}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Upload guidelines -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-blue-800">Upload Tips</h3>
        <div class="mt-2 text-sm text-blue-700">
          <ul class="list-disc pl-5 space-y-1">
            <li>Add meaningful titles and descriptions to help build relationships</li>
            <li>Use tags to categorize your media for easier discovery</li>
            <li>Share your thoughts about why this media is meaningful to you</li>
            <li>Maximum file size: 100MB per file</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>