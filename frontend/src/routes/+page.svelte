<script>
  import { onMount } from 'svelte';
  import TimelineItem from '../components/TimelineItem.svelte';

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
  <title>Elephant</title>
</svelte:head>

<div class="max-w-4xl mx-auto space-y-6">

  <!-- Minimal loading state -->
  {#if loading}
    <div class="text-center py-16">
      <div class="w-1 h-1 bg-black rounded-full mx-auto animate-pulse"></div>
    </div>
  {:else if timelineData}
    <!-- Empty state -->
    {#if timelineData.items.length === 0}
      <div class="container-reading text-center py-20">
        <div class="w-2 h-2 bg-gray-200 rounded-full mx-auto mb-8"></div>
        <h3 class="text-headline text-black mb-4">Empty</h3>
        <a href="/upload" class="btn-primary">Upload</a>
      </div>
    {:else}
      <!-- Magazine-style timeline -->
      <div class="space-y-24">
        {#each Object.entries(timelineData.groupedByDate) as [date, items]}
          <section class="relative">
            
            
            <!-- Timeline items -->
            <div class="space-y-0">
              {#each items as item, index}
                <TimelineItem {item} isLast={index === items.length - 1} />
                {#if index !== items.length - 1}
                  <div class="border-b border-gray-100"></div>
                {/if}
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
      <h3 class="text-headline text-black mb-4">Error</h3>
      <button 
        onclick={loadTimeline}
        class="btn-primary"
      >
        Retry
      </button>
    </div>
  {/if}
</div>