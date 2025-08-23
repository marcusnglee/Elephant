<script>
  import { onMount } from 'svelte';
  import TimelineItem from '../../components/TimelineItem.svelte';

  let timelineData = $state(null);
  let loading = $state(true);
  let currentPage = $state(1);

  async function loadTimeline() {
    loading = true;
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      const response = await fetch(`/api/media/timeline?${params}`);
      const data = await response.json();
      
      if (data.success) {
        timelineData = data;
      } else {
        console.error('Failed to load timeline:', data.error);
      }
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      loading = false;
    }
  }

  function handlePageChange(newPage) {
    currentPage = newPage;
    loadTimeline();
  }

  onMount(() => {
    loadTimeline();
  });
</script>

<svelte:head>
  <title>Timeline - Elephant Knowledge Base</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">
  <!-- Magazine-style header -->
  <header class="container-reading text-center mb-16">
    <h1 class="text-display text-black mb-6">Timeline</h1>
    <p class="text-body text-gray-600 mb-8">
      A chronological archive of shared moments, where each memory adds to your story
    </p>
    <a 
      href="/" 
      class="btn-primary"
    >
      Add New Memory
    </a>
  </header>

  <!-- Minimal loading state -->
  {#if loading}
    <div class="text-center py-16">
      <div class="w-1 h-1 bg-black rounded-full mx-auto animate-pulse"></div>
      <p class="text-caption text-gray-400 mt-4 tracking-wide">Loading timeline...</p>
    </div>
  {:else if timelineData}
    <!-- Empty state -->
    {#if timelineData.items.length === 0}
      <div class="container-reading text-center py-20">
        <div class="w-2 h-2 bg-gray-200 rounded-full mx-auto mb-8"></div>
        <h3 class="text-headline text-black mb-4">Your story begins here</h3>
        <p class="text-body text-gray-600 mb-8">
          Upload your first files to start building a timeline of shared memories.
        </p>
        <a href="/" class="btn-primary">Add First Memory</a>
      </div>
    {:else}
      <!-- Editorial timeline -->
      <div class="space-y-20">
        {#each Object.entries(timelineData.groupedByDate) as [date, items]}
          <section class="relative">
            <!-- Date header with magazine styling -->
            <header class="sticky top-16 bg-white/90 backdrop-blur-sm z-10 py-4 mb-12">
              <div class="container-narrow">
                <div class="border-b border-gray-200 pb-4">
                  <h2 class="text-headline text-black">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                </div>
              </div>
            </header>
            
            <!-- Timeline items with editorial spacing -->
            <div class="space-y-12">
              {#each items as item, index}
                <div class="timeline-item pl-6">
                  <div class="timeline-dot"></div>
                  <TimelineItem {item} isLast={index === items.length - 1} />
                </div>
              {/each}
            </div>
          </section>
        {/each}
      </div>

      <!-- Minimal pagination -->
      {#if timelineData.pagination.totalPages > 1}
        <nav class="container-narrow text-center py-16">
          <div class="flex justify-center items-center space-x-8">
            <button 
              onclick={() => handlePageChange(currentPage - 1)}
              disabled={!timelineData.pagination.hasPrev}
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span class="text-caption text-gray-500 tracking-wide">
              {timelineData.pagination.page} of {timelineData.pagination.totalPages}
            </span>
            
            <button 
              onclick={() => handlePageChange(currentPage + 1)}
              disabled={!timelineData.pagination.hasNext}
              class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </nav>
      {/if}
    {/if}
  {:else}
    <div class="container-reading text-center py-20">
      <div class="w-2 h-2 bg-red-300 rounded-full mx-auto mb-8"></div>
      <h3 class="text-headline text-black mb-4">Unable to load timeline</h3>
      <p class="text-body text-gray-600 mb-8">Something went wrong while loading your memories.</p>
      <button 
        onclick={loadTimeline}
        class="btn-primary"
      >
        Try Again
      </button>
    </div>
  {/if}
</div>