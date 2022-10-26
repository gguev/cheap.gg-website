<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  const title = $page.url.searchParams.get('q')
  let data

  onMount(async () => {
    const res = await fetch(`/api/game/${title}`)
    data = await res.json()
    console.log(data)
    return  
  })  
</script>

<main>
  <h1>Results for {title}</h1>

</main>