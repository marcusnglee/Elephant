<script>
  import '../app.css';
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            🐘 Elephant
          </h1>
          <span class="ml-3 text-sm text-gray-500">Knowledge Base</span>
        </div>
        
        <nav class="flex space-x-8">
          <a href="/" class="text-gray-600 hover:text-gray-900 transition-colors">
            Upload
          </a>
          <a href="/timeline" class="text-gray-600 hover:text-gray-900 transition-colors">
            Timeline
          </a>
        </nav>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <slot />
  </main>
</div>