<script lang="ts">
    import { onMount } from "svelte";
    import Rankings from "$lib/components/Rankings.svelte";
    import Schedule from "$lib/components/Schedule.svelte";
    import UpNext from "$lib/components/UpNext.svelte";
    import { Conduit } from "$lib/Conduit";
    import { EventPhase, type EventState } from "$lib/EventState";
    import { stringifyTime } from "$lib/util";
    import { Settings } from "$lib/Settings";

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
        <div style="display: flex; margin: 0.5vw; gap: 0.1vw; flex-flow: column;">
            <p style="font-size: 1.6vw; font-weight: 700;">
                {event.now.toLocaleString(`en-us`, { weekday: `long` })}
            </p>
            <p style="opacity: 0.6; font-size: 1vw; font-weight: 700;">{stringifyTime(event.now)}</p>
        </div>
        <Rankings {event} teamNumber={settings.teamNumber} />
    </div>
    <div id="right">
        <UpNext {event} />
        <div id="right-bottom">
            <Schedule {event} />
            <video autoplay muted loop playsinline>
                <source src="/morale.mp4" type="video/mp4" />
            </video>
        </div>
    </div>
</main>

<style>
    main {
        height: 100vh;
        display: flex;
        justify-content: center;
        background: linear-gradient(rgb(38, 38, 40), rgb(26, 26, 28));
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
    }

    #right-bottom {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        video {
            width: 29vw;
            border-radius: 0.6rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.25);
        }
    }

    #left,
    #right {
        display: flex;
        flex-flow: column;
    }
</style>
