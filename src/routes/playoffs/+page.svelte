<script lang="ts">
    import { onMount } from "svelte";
    import Schedule from "$lib/components/Schedule.svelte";
    import UpNext from "$lib/components/UpNext.svelte";
    import { Conduit } from "$lib/Conduit";
    import { EventPhase, type EventState } from "$lib/EventState";
    import { Settings } from "$lib/Settings";
    import PlayoffBracket from "$lib/components/PlayoffBracket.svelte";
    import Time from "$lib/components/Time.svelte";
    import Alliances from "$lib/components/Alliances.svelte";

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
    <div id="left">
        <Time {event} />
        <span style="height: 0.5vw;"></span>
        <Alliances {event} />
    </div>
    <div id="right">
        <UpNext {event} />
        <PlayoffBracket {event} />
    </div>
</main>

<style>
    main {
        display: flex;
        height: 100vh;
        justify-content: center;
        background: linear-gradient(rgb(26, 26, 28), rgb(32, 32, 34));
    }

    #left {
        padding: 0 2vw;
        gap: 0.5vw;
        justify-content: center;
    }

    #right {
        padding: 0 3vw;
        flex-grow: 1;
        background-color: rgb(44, 44, 46);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.16);
        justify-content: space-evenly;
        align-items: center;
    }

    #left,
    #right {
        display: flex;
        flex-direction: column;
    }
</style>
