<script lang="ts">
    import { onMount } from "svelte";
    import Schedule from "$lib/components/Schedule.svelte";
    import UpNext from "$lib/components/UpNext.svelte";
    import { Conduit } from "$lib/Conduit";
    import { EventPhase, type EventState } from "$lib/EventState";
    import { Settings } from "$lib/Settings";
    import Time from "$lib/components/Time.svelte";
    import { ytEmbedURL } from "$lib/util";

    const settings = await Settings.getAll();
    const conduit = new Conduit(settings);

    let event: EventState = $state(conduit.emptyState());
    const update = async () => (event = await conduit.fetchState(EventPhase.PRACTICE));

    await update();
    onMount(() => {
        const interval = setInterval(update, 10_000);
        return () => clearInterval(interval);
    });
</script>

<main>
    <div id="top" class="panel">
        <UpNext {event} />
    </div>
    <div id="bottom">
        <div class="panel">
            <Time {event} alignCenter />
            <Schedule {event} />
        </div>
        <iframe title="" class="panel" src={ytEmbedURL(settings.ytVideoId)} allowfullscreen></iframe>
    </div>
</main>

<style>
    main {
        display: flex;
        height: 100vh;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2vw;
    }

    #top {
        width: 72vw;
        padding: 1vw 3vw;
    }

    #bottom {
        width: 78vw;
        display: flex;
        flex-direction: row;
        gap: inherit;

        > div {
            display: flex;
            padding: 2vw 3vw;
            gap: 0.8vw;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        > iframe {
            width: 0;
            flex-grow: 1;
        }
    }

    .panel {
        background-color: rgb(46, 46, 48);
        box-shadow: 0 0 0.8vw 0.3vw rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1.2vw;
    }
</style>
