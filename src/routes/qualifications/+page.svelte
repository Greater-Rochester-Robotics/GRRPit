<script lang="ts">
    import { onMount } from "svelte";
    import Rankings from "$lib/components/Rankings.svelte";
    import Schedule from "$lib/components/Schedule.svelte";
    import UpNext from "$lib/components/UpNext.svelte";
    import { Conduit } from "$lib/Conduit";
    import { EventPhase, type EventState } from "$lib/EventState";
    import { Settings } from "$lib/Settings";
    import Time from "$lib/components/Time.svelte";

    const settings = await Settings.getAll();
    const conduit = new Conduit(settings);

    let event: EventState = $state(conduit.emptyState());
    const update = async () => (event = await conduit.fetchState(EventPhase.QUALIFICATIONS));

    await update();
    onMount(() => {
        const interval = setInterval(update, 10_000);
        return () => clearInterval(interval);
    });
</script>

<main>
    <div id="left">
        <Time {event} />
        <Rankings {event} />
    </div>
    <div id="right">
        <UpNext {event} />
        <div id="right-bottom">
            <Schedule {event} />
            <iframe
                title=""
                src="https://www.youtube.com/embed/{settings.ytVideoId}?autoplay=1&color=white&disablekb=1&loop=1&mute=1&playlist={settings.ytVideoId}&playsinline=false&rel=0"
                allowfullscreen
            ></iframe>
        </div>
    </div>
</main>

<style>
    main {
        height: 100vh;
        display: flex;
        justify-content: center;
    }

    #left {
        padding: 2vw;
        gap: 0.5vw;
        margin: 1vw;
        justify-content: center;
        background-color: rgb(46, 46, 48);
        box-shadow: 0 0 0.8vw 0.3vw rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1.2vw;
    }

    #right {
        padding: 0 2.5vw;
        flex-grow: 1;
        gap: 2vw;
        justify-content: space-evenly;
    }

    #right-bottom {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        iframe {
            width: 29vw;
            aspect-ratio: 16 / 9;
            border-radius: 0.5vw;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0.8vw 0.3vw rgba(0, 0, 0, 0.2);
        }
    }

    #left,
    #right {
        display: flex;
        flex-direction: column;
    }
</style>
