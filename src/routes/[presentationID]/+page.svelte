<script lang="ts">
    import Arbo from "$lib/Arbo.svelte";

    let { data } = $props();
</script>

<Arbo bind:presentation={data.presentation} />
