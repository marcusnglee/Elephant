<script>
  let { item, isLast = false } = $props();
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('text/') || mimeType.includes('document')) return '📝';
    return '📎';
  }
</script>

<article class="bg-white group hover:bg-gray-50/50 transition-all duration-300 p-8 lg:p-12">
  <!-- Editorial header -->
  <header class="flex items-start justify-between mb-6">
    <div class="space-y-1">
      <time class="text-caption text-gray-500 tracking-wide">
        {formatTime(item.uploadedAt)}
      </time>
      <p class="text-caption text-gray-400 tracking-wide">
        by {item.uploadedBy}
      </p>
    </div>
  </header>
  
  <!-- Content grid -->
  <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">
    <!-- Media preview -->
    <div class="lg:col-span-1">
      {#if item.mimeType.startsWith('image/')}
        <img 
          src="/media/{item.filename}" 
          alt={item.title || item.originalName}
          class="w-full aspect-square object-cover bg-gray-100 transition-all duration-300 group-hover:shadow-lg"
          loading="lazy"
        />
      {:else}
        <div class="w-full aspect-square bg-gray-100 flex items-center justify-center">
          <div class="text-center text-gray-400">
            <div class="w-8 h-8 bg-current/20 rounded mx-auto mb-3"></div>
            <div class="text-xs font-medium uppercase tracking-wider">
              {item.mimeType.split('/')[0]}
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Title -->
      <h3 class="text-headline text-black">
        {item.title || item.originalName}
      </h3>
      
      <!-- Description -->
      {#if item.description}
        <p class="text-body text-gray-600 leading-relaxed">
          {item.description}
        </p>
      {/if}
      
      <!-- Tags -->
      {#if item.tags && item.tags.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each item.tags as tag}
            <span class="text-caption text-gray-500 tracking-wide">
              #{tag}
            </span>
          {/each}
        </div>
      {/if}
      
      <!-- Metadata -->
      <div class="flex flex-wrap items-center gap-4 text-caption text-gray-400 tracking-wide">
        <span>{formatFileSize(item.fileSize)}</span>
        <span>•</span>
        <span>{item.temporalContext.timeOfDay}</span>
        <span>•</span>
        <span>{item.temporalContext.season}</span>
      </div>
    </div>
  </div>
  
  <!-- Actions -->
  <footer class="flex justify-end gap-6 mt-8 pt-6 border-t border-gray-100">
    <button class="text-caption text-gray-400 hover:text-black transition-colors tracking-wide">
      View Details →
    </button>
    <button class="text-caption text-gray-400 hover:text-black transition-colors tracking-wide">
      Create Connection →
    </button>
  </footer>
</article>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>