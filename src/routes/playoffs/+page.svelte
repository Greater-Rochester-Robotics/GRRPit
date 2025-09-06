<script lang="ts">
    import { onMount } from "svelte";
    import Schedule from "$lib/components/Schedule.svelte";
    import UpNext from "$lib/components/UpNext.svelte";
    import { Conduit } from "$lib/Conduit";
    import { EventPhase, type EventState } from "$lib/EventState";
    import { Settings } from "$lib/Settings";

    const settings = await Settings.getAll();
    const conduit = new Conduit(settings);

    let event: EventState = $state(conduit.emptyState());
    const update = async () => (event = await conduit.fetchState(EventPhase.PLAYOFFS));

    await update();
    onMount(() => {
        const interval = setInterval(update, 10_000);
        return () => clearInterval(interval);
    });
</script>

<main>
    <div id="container">
        <UpNext {event} />
        <Schedule {event} {conduit} />
    </div>
</main>

<style>
    main {
        display: flex;
        height: 100vh;
        justify-content: center;
        align-items: center;
        background: linear-gradient(rgb(38, 38, 40), rgb(26, 26, 28));
    }

    #container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2vh;
    }
</style>
