<script>
  import '../app.css';
</script>

<div class="min-h-screen bg-white">
  <!-- Minimalist header with magazine-style typography -->
  <header class="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/80">
    <div class="max-w-5xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between py-6">
        <!-- Logo area -->
        <div class="flex items-baseline space-x-4">
          <a href="/" class="text-display text-black tracking-tight">
            Elephant
          </a>
          <span class="text-label text-gray-500 hidden sm:block">
            Knowledge Base
          </span>
        </div>
        
        <!-- Navigation -->
        <nav class="flex items-center space-x-1">
          <a 
            href="/" 
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
          >
            Upload
          </a>
          <a 
            href="/timeline" 
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
          >
            Timeline
          </a>
        </nav>
      </div>
    </div>
  </header>

  <!-- Main content with editorial spacing -->
  <main class="max-w-5xl mx-auto px-6 lg:px-8">
    <div class="py-12 lg:py-16">
      <slot />
    </div>
  </main>
  
  <!-- Clean footer -->
  <footer class="border-t border-gray-200 bg-white">
    <div class="max-w-5xl mx-auto px-6 lg:px-8 py-8">
      <div class="text-center">
        <p class="text-caption text-gray-500">
          A space for meaningful connections between friends
        </p>
      </div>
    </div>
  </footer>
</div>