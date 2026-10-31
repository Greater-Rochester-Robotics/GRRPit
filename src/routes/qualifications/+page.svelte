<script lang="ts">
    import { onMount } from "svelte";
    import Rankings from "#lib/components/Rankings.svelte";
    import Schedule from "#lib/components/Schedule.svelte";
    import UpNext from "#lib/components/UpNext.svelte";
    import { Conduit } from "#lib/Conduit.ts";
    import { EventPhase, type EventState } from "#lib/EventState.ts";
    import { Settings } from "#lib/Settings.ts";
    import Time from "#lib/components/Time.svelte";
    import MoodMeter from "#lib/components/MoodMeter.svelte";

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
            <div id="schedule">
                <Schedule {event} />
            </div>
            <div id="mood">
                <MoodMeter />
            </div>
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
        gap: 0.6vw;
        margin: 1vw;
        margin-right: 0;
        justify-content: center;
        background-color: rgb(46, 46, 48);
        box-shadow: 0 0 0.8vw 0.3vw rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1.2vw;
    }

    #right {
        padding: 0 2.5vw;
        justify-content: center;
        gap: 2vw;
        flex-grow: 1;
    }

    #right-bottom {
        display: flex;
        flex-direction: row;
        gap: 1vw;
        align-items: center;

        #schedule {
            flex-grow: 1;
        }

        #mood {
            margin-top: 1.65vw;
            padding-bottom: 0.8vw;
            width: 0;
            flex-grow: 6;
            background-color: rgb(46, 46, 48);
            box-shadow: 0 0 0.8vw 0.3vw rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 1.2vw;
        }
    }

    #left,
    #right {
        display: flex;
        flex-direction: column;
    }
</style>
