<script lang="ts">
    let { children } = $props();
</script>

<svelte:boundary>
    {@render children()}

    {#snippet pending()}
        <div>
            <h1>Loading...</h1>
        </div>
    {/snippet}
</svelte:boundary>

<style>
    div {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    h1 {
        font-size: 2vw;
    }
</style>
