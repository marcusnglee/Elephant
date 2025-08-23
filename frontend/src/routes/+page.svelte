<script>
  import { onMount } from 'svelte';
  import UploadZone from '../components/UploadZone.svelte';
  import ContextCapture from '../components/ContextCapture.svelte';
  import { uploadedFiles, uploadFiles, fetchMediaItems } from '../stores/media.js';
  
  let selectedFiles = $state([]);
  let uploadStep = $state('select'); // 'select' | 'context' | 'uploading' | 'complete'
  
  // Load existing media items when the page loads
  onMount(async () => {
    try {
      await fetchMediaItems();
    } catch (error) {
      console.error('Failed to load existing media items:', error);
    }
  });
  
  function handleFilesSelected(event) {
    selectedFiles = event.files;
    uploadStep = 'context';
  }
  
  async function handleContextComplete(event) {
    // Files with context are in event.filesWithContext
    uploadStep = 'uploading';
    
    try {
      const result = await uploadFiles(event.filesWithContext);
      console.log('Upload successful:', result);
      uploadStep = 'complete';
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
      uploadStep = 'context'; // Go back to context step to retry
    }
  }
  
  function resetUpload() {
    selectedFiles = [];
    uploadStep = 'select';
  }
</script>

<svelte:head>
  <title>Upload - Elephant Knowledge Base</title>
</svelte:head>

<div class="space-y-8">
  <!-- Magazine-style hero section -->
  <header class="container-reading text-center mb-16">
    <h1 class="text-headline text-black mb-6 text-balance">
      Preserve the moments<br>that shape your story
    </h1>
    <p class="text-body text-gray-600 mb-8 text-balance">
      Every shared memory becomes part of something larger—a living archive of your friendship, 
      where context and connection transform simple files into meaningful narratives.
    </p>
    <div class="flex items-center justify-center gap-6">
      <a 
        href="/timeline" 
        class="text-caption text-gray-500 hover:text-black transition-colors tracking-wide"
      >
        Browse Timeline →
      </a>
    </div>
  </header>

  {#if uploadStep === 'select'}
    <UploadZone onfilesselected={handleFilesSelected} />
  
  {:else if uploadStep === 'context'}
    <div class="container-narrow space-y-12">
      <header class="text-center">
        <h2 class="text-headline text-black mb-4">
          Give your files meaning
        </h2>
        <p class="text-body text-gray-600 mb-8">
          Context transforms ordinary files into memorable stories
        </p>
        <button 
          onclick={resetUpload}
          class="text-caption text-gray-400 hover:text-black transition-colors tracking-wide"
        >
          ← Choose different files
        </button>
      </header>
      
      <ContextCapture 
        files={selectedFiles} 
        oncontextcomplete={handleContextComplete}
        onback={resetUpload}
      />
    </div>
  
  {:else if uploadStep === 'uploading'}
    <div class="container-narrow text-center py-16">
      <div class="w-1 h-1 bg-black rounded-full mx-auto animate-pulse mb-8"></div>
      <p class="text-body text-gray-600">Uploading your files...</p>
    </div>
  
  {:else if uploadStep === 'complete'}
    <div class="container-narrow text-center py-16 space-y-8">
      <div class="w-2 h-2 bg-black rounded-full mx-auto"></div>
      <div class="space-y-4">
        <h3 class="text-headline text-black">Files added to your story</h3>
        <p class="text-body text-gray-600">
          Your memories are now part of the archive, ready to connect with future moments.
        </p>
      </div>
      <button 
        onclick={resetUpload}
        class="btn-primary"
      >
        Add More Memories
      </button>
    </div>
  {/if}
  
  <!-- Recent uploads - magazine style -->
  {#if $uploadedFiles.length > 0 && uploadStep === 'select'}
    <section class="mt-20 border-t border-gray-200 pt-16">
      <header class="container-narrow text-center mb-12">
        <h3 class="text-headline text-black mb-4">Recent additions</h3>
        <a 
          href="/timeline" 
          class="text-caption text-gray-400 hover:text-black transition-colors tracking-wide"
        >
          View complete timeline →
        </a>
      </header>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {#each $uploadedFiles.slice(0, 8) as file}
          <article class="group cursor-pointer">
            <div class="aspect-square bg-gray-50 overflow-hidden mb-3 transition-all duration-300 group-hover:shadow-lg">
              {#if file.mimeType.startsWith('image/')}
                <img 
                  src="/media/{file.filename}" 
                  alt={file.title || file.originalName}
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <div class="text-center">
                    <div class="w-6 h-6 bg-black/10 rounded mx-auto mb-2"></div>
                    <div class="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {file.mimeType.split('/')[0]}
                    </div>
                  </div>
                </div>
              {/if}
            </div>
            <div class="space-y-1">
              <h4 class="text-sm font-medium text-black truncate">
                {file.title || file.originalName}
              </h4>
              <p class="text-xs text-gray-500 tracking-wide">
                {new Date(file.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/if}
</div>