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

<article class="group cursor-pointer" on:click={() => window.location.href = `/media/${item.id}`}>
  <!-- Preview-focused layout -->
  <div class="grid lg:grid-cols-4 gap-8 p-8 lg:p-12 hover:bg-gray-50/30 transition-all duration-300">
    <!-- Large media preview -->
    <div class="lg:col-span-2">
      {#if item.mimeType.startsWith('image/')}
        <img 
          src="/media/{item.filename}" 
          alt={item.title || item.originalName}
          class="w-full aspect-[4/3] object-cover bg-gray-100 transition-all duration-300 group-hover:shadow-lg"
          loading="lazy"
        />
      {:else if item.mimeType.startsWith('video/')}
        <div class="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center relative overflow-hidden">
          <video 
            src="/media/{item.filename}" 
            class="w-full h-full object-cover"
            preload="metadata"
          ></video>
          <div class="absolute inset-0 bg-black/10 flex items-center justify-center">
            <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <div class="w-0 h-0 border-l-[8px] border-r-0 border-t-[6px] border-b-[6px] border-l-black border-t-transparent border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      {:else}
        <div class="w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
          <div class="text-center text-gray-400">
            <div class="w-16 h-16 bg-current/10 rounded mx-auto mb-4 flex items-center justify-center">
              <div class="text-2xl">
                {#if item.mimeType.includes('pdf')}
                  📄
                {:else if item.mimeType.startsWith('audio/')}
                  🎵
                {:else}
                  📎
                {/if}
              </div>
            </div>
            <div class="text-sm font-medium uppercase tracking-wider">
              {item.mimeType.split('/')[0]}
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Compact content -->
    <div class="lg:col-span-2 space-y-4 flex flex-col justify-between">
      <div class="space-y-4">
        <!-- Title -->
        <h3 class="text-headline text-black group-hover:text-gray-800 transition-colors">
          {item.title || item.originalName}
        </h3>
        
        <!-- Description preview -->
        {#if item.description}
          <p class="text-body text-gray-600 line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        {/if}
        
        <!-- Tags -->
        {#if item.tags && item.tags.length > 0}
          <div class="flex flex-wrap gap-2">
            {#each item.tags.slice(0, 3) as tag}
              <span class="text-caption text-gray-500 tracking-wide">
                #{tag}
              </span>
            {/each}
            {#if item.tags.length > 3}
              <span class="text-caption text-gray-400">
                +{item.tags.length - 3}
              </span>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Minimal metadata footer -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-100">
        <div class="flex items-center gap-4 text-caption text-gray-400 tracking-wide">
          <time>{formatTime(item.uploadedAt)}</time>
          <span>•</span>
          <span>{formatFileSize(item.fileSize)}</span>
        </div>
        
        <div class="text-caption text-gray-400 group-hover:text-gray-600 transition-colors">
          #{item.id}
        </div>
      </div>
    </div>
  </div>
</article>

<style>
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>