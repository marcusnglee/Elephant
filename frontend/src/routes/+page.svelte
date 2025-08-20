<script>
  import UploadZone from '../components/UploadZone.svelte';
  import ContextCapture from '../components/ContextCapture.svelte';
  import { uploadedFiles, uploadFiles } from '../stores/media.js';
  
  let selectedFiles = $state([]);
  let uploadStep = $state('select'); // 'select' | 'context' | 'uploading' | 'complete'
  
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
  <div class="text-center">
    <h2 class="text-3xl font-bold text-gray-900">Share Your Media</h2>
    <p class="mt-2 text-lg text-gray-600">
      Upload files and add context to build your knowledge base
    </p>
  </div>

  {#if uploadStep === 'select'}
    <UploadZone onfilesselected={handleFilesSelected} />
  
  {:else if uploadStep === 'context'}
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">
          Add Context to Your Files
        </h3>
        <button 
          onclick={resetUpload}
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to file selection
        </button>
      </div>
      
      <ContextCapture 
        files={selectedFiles} 
        oncontextcomplete={handleContextComplete}
        onback={resetUpload}
      />
    </div>
  
  {:else if uploadStep === 'uploading'}
    <div class="text-center py-12">
      <div class="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full mx-auto"></div>
      <p class="mt-4 text-gray-600">Uploading your files...</p>
    </div>
  
  {:else if uploadStep === 'complete'}
    <div class="text-center py-12 space-y-4">
      <div class="text-green-600">
        <svg class="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Upload Complete!</h3>
      <p class="text-gray-600">Your files have been added to your knowledge base.</p>
      <button 
        onclick={resetUpload}
        class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Upload More Files
      </button>
    </div>
  {/if}
  
  <!-- Recent uploads preview -->
  {#if $uploadedFiles.length > 0 && uploadStep === 'select'}
    <div class="mt-12 border-t pt-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Uploads</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {#each $uploadedFiles.slice(0, 6) as file}
          <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {#if file.mimeType.startsWith('image/')}
              <img 
                src="/media/{file.filename}" 
                alt={file.title || file.originalName}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center text-gray-500">
                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>