<script lang="ts">
    import Switch from "$lib/components/Switch.svelte";
    import { Settings, type SettingsData } from "$lib/Settings";
    import { type HTMLInputTypeAttribute } from "svelte/elements";

    const data = await Settings.getAll();
</script>

<main>
    {#snippet input(label: string, key: keyof SettingsData, type: HTMLInputTypeAttribute, placeholder?: string)}
        <div class="input-group">
            <p>{label}</p>
            <input
                {type}
                {placeholder}
                value={data[key]}
                onchange={(e) => {
                    const v = (e.target as any).value;
                    Settings.set(key, type === `number` ? Number(v) : v);
                }}
                autocapitalize="off"
                autocomplete="off"
                autocorrect="off"
                spellcheck="false"
            />
        </div>
    {/snippet}

    <div id="container">
        <div id="header">
            <a href="/">Back</a>
            <h1>Settings</h1>
        </div>

        {@render input(`Team Number`, `teamNumber`, `number`)}
        {@render input(`Event Code`, `eventCode`, `text`, `ex. "CMPTX"`)}
        {@render input(`Year`, `year`, `number`)}

        <br />

        {@render input(`FRC Events Username`, `frcEventsUsername`, `text`, `frc-api-docs.firstinspires.org`)}
        {@render input(`FRC Events Auth Key`, `frcEventsAuthKey`, `password`)}

        <br />

        <div class="input-group">
            <p>Use Nexus</p>
            <Switch bind:checked={() => data.useNexus, (v) => Settings.set(`useNexus`, v)} />
        </div>
        {@render input(`Nexus API Key`, `nexusAPIKey`, `password`, `frc.nexus/api/v1/docs`)}

        <br />

        {@render input(`TBA Auth Key`, `tbaAuthKey`, `password`, `thebluealliance.com/apidocs`)}

        <br />

        {@render input(`YouTube Embed ID`, `ytVideoId`, `text`, `dQw4w9WgXcQ`)}
    </div>
</main>

<style>
    main {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.3vw;
        padding: 8vw;
        overflow: hidden;
        border-radius: 2vh;
        background-color: black;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.25);

        > * {
            width: fit-content;
        }
    }

    #header {
        display: flex;
        flex-direction: column;
        gap: 0.2vw;
        margin-bottom: 1.4vw;

        h1 {
            font-size: 2vw;
        }

        a {
            opacity: 0.7;
        }

        a:hover {
            opacity: 0.5;
        }
    }

    .input-group {
        display: flex;
        height: 2vw;
        width: 30vw !important;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        p {
            opacity: 0.9;
            font-size: 0.8vw;
            font-weight: 600;
        }

        input {
            width: 12vw;
            padding: 0.4vw;
            border-radius: 0.2vw;
            font-size: 0.7vw;
            font-family: inherit;
            color: inherit;
            background-color: rgb(22, 22, 24);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        input:focus {
            outline: none;
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
    }
</style>
