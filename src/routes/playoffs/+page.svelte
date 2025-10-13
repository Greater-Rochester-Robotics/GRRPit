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
        <Alliances {event} />
    </div>
    <div id="right">
        <div id="up-next-container">
            <UpNext {event} />
        </div>
        <PlayoffBracket {event} />
    </div>
</main>

<style>
    main {
        display: flex;
        height: 100vh;
        justify-content: center;
    }

    #left {
        padding: 0 1vw;
        gap: 0.5vw;
        margin: 1vw;
        justify-content: center;
        background-color: rgb(46, 46, 48);
        box-shadow: 0 0 0.8vw 0.3vw rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1.2vw;
    }

    #right {
        flex-grow: 1;
        justify-content: center;
        align-items: center;
        gap: 0.5vw;
    }

    #left,
    #right {
        display: flex;
        flex-direction: column;
    }

    #up-next-container {
        width: 95%;
    }
</style>
