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
  
  <!-- Minimalist drop zone -->
  <div
    class="upload-zone bg-gray-50 rounded-none p-16 lg:p-20 text-center cursor-pointer group"
    class:dragover={isDragOver}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    ondrop={handleDrop}
    onclick={openFileDialog}
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === 'Enter' && openFileDialog()}
  >
    <div class="space-y-8 max-w-md mx-auto">
      <!-- Minimal icon -->
      <div class="text-gray-300 group-hover:text-gray-400 transition-colors">
        <div class="w-2 h-2 bg-current rounded-full mx-auto mb-4"></div>
        <div class="w-16 h-px bg-current mx-auto"></div>
      </div>
      
      <div class="space-y-4">
        <h3 class="text-headline text-black">
          {isDragOver ? 'Release to upload' : 'Choose your files'}
        </h3>
        <p class="text-body text-gray-600">
          Drop files here or <span class="text-black font-medium">click to browse</span>
        </p>
        <p class="text-caption text-gray-400 tracking-wide">
          Images • Videos • Documents • Audio
        </p>
      </div>
    </div>
  </div>
  
  <!-- Selected files preview -->
  {#if selectedFiles.length > 0}
    <section class="container-narrow space-y-8">
      <header class="text-center">
        <h3 class="text-headline text-black mb-2">
          {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} ready
        </h3>
        <p class="text-caption text-gray-500 tracking-wide">
          Continue to add context and meaning
        </p>
      </header>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each selectedFiles as fileData}
          <article class="group">
            <div class="aspect-square bg-gray-100 overflow-hidden mb-3">
              {#if fileData.preview}
                <img 
                  src={fileData.preview} 
                  alt={fileData.file.name}
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="w-full h-full bg-gray-50 flex items-center justify-center">
                  <div class="text-center text-gray-400">
                    <div class="w-6 h-6 bg-current/20 rounded mx-auto mb-2"></div>
                    <div class="text-xs font-medium uppercase tracking-wider">
                      {fileData.file.type.split('/')[0] || 'file'}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
            
            <div class="space-y-1">
              <h4 class="text-sm font-medium text-black truncate" title={fileData.file.name}>
                {fileData.file.name}
              </h4>
              <p class="text-xs text-gray-500 tracking-wide">
                {formatFileSize(fileData.file.size)}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/if}
  
  <!-- Editorial guidelines -->
  <aside class="container-reading bg-gray-50 p-8 mt-16">
    <div class="space-y-6">
      <header>
        <div class="w-1 h-1 bg-black rounded-full mb-4"></div>
        <h4 class="text-caption text-black font-medium uppercase tracking-wider mb-4">
          Guidelines
        </h4>
      </header>
      
      <div class="space-y-4 text-body text-gray-600">
        <p>Each file becomes more meaningful when you provide context—think of titles that capture the essence, descriptions that tell the story, and tags that help you rediscover these moments later.</p>
        
        <p class="text-caption text-gray-500">
          Maximum file size: 100MB • Supported formats: Images, videos, documents, audio
        </p>
      </div>
    </div>
  </aside>
</div>