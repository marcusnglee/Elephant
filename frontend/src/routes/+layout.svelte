<script>
  import '../app.css';
</script>

<div class="min-h-screen bg-white">
  <!-- Minimalist header -->
  <header class="bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/80">
    <div class="max-w-5xl mx-auto px-6 lg:px-8">
      <div class="flex items-center justify-between py-6">
        <!-- Logo area -->
        <div class="flex items-baseline space-x-4">
          <a href="/" class="text-display text-black tracking-tight">
            LL.phant
          </a>
        </div>
        
        <!-- Geometric Navigation -->
        <nav class="flex items-center space-x-6">
          <a 
            href="/" 
            class="group p-2 hover:bg-gray-50 transition-all"
            title="Timeline"
          >
            <!-- Square (Timeline) -->
            <div class="w-3 h-3 bg-gray-600 group-hover:bg-black transition-colors"></div>
          </a>
          <a 
            href="/upload" 
            class="group p-2 hover:bg-gray-50 transition-all"
            title="Upload"
          >
            <!-- Triangle (Upload) -->
            <div class="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-gray-600 group-hover:border-b-black transition-colors"></div>
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
        <div class="w-1 h-1 bg-gray-300 rounded-full mx-auto"></div>
      </div>
    </div>
  </footer>
</div>