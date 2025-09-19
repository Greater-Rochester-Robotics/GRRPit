<script lang="ts">
    import { Conduit } from "$lib/Conduit";
    import type { EventState } from "../EventState";

    let { event }: { event: EventState } = $props();
</script>

<div id="container">
    <div id="match">
        <p style="font-size: 0.8vw; opacity: 0.6; font-weight: 300; margin-bottom: 0.1vw;">Up Next</p>
        <p id="match-label">{event.upNext.label}</p>
        <div id="match-status">
            {#if event.upNext.match?.badge}
                <p id="match-badge">{event.upNext.match.badge}</p>
            {/if}
            <p style="opacity: 0.7; font-style: italic;">
                {event.upNext.match?.status ?? ``}
            </p>
        </div>
    </div>
    <div id="matchup">
        {#if event.upNext.match}
            {#snippet alliance(red: boolean)}
                {@const teams = event.upNext.match![red ? `redTeams` : `blueTeams`]}
                {#if teams.length}
                    {#each teams as team}
                        {@const images = event.upNext.match!.images.get(team)!}
                        {@const loaded = { count: 0 }}

                        <div class="team">
                            <img
                                alt=""
                                onerror={(e: any) => {
                                    loaded.count++;
                                    if (loaded.count < images.length) {
                                        e.target.src = images[loaded.count];
                                    }
                                }}
                                onload={() => Conduit.indexSuccessfulLoad(team, loaded.count)}
                                src={images[0]}
                            />
                            <p>{team}</p>
                        </div>
                    {/each}
                {:else}
                    {@const playoff = event.playoffs?.matches.find((m) => m.number === event.upNext.match?.number)}
                    <div class="tbd">
                        <h1>{playoff ? playoff[red ? `redFill` : `blueFill`] : `TBD`}</h1>
                    </div>
                {/if}
            {/snippet}

            {@render alliance(true)}
            <p style="font-size: 1.6vw; font-weight: 700; opacity: 0.8;">vs</p>
            {@render alliance(false)}
        {/if}
    </div>
</div>

<style>
    #container {
        display: flex;
        height: 25vh;
        width: 100%;
        gap: 3vw;
        justify-content: space-between;
    }

    #match {
        display: flex;
        flex-direction: column;
        font-optical-sizing: none;
        justify-content: center;
        gap: 0.2vw;

        #match-label {
            font-size: 2vw;
            font-weight: 700;
            line-height: 100%;
            text-shadow: 0 0 0.8vw rgba(0, 0, 0, 0.4);
        }

        #match-status {
            display: flex;
            flex-direction: row;
            margin-top: 0.35vw;
            align-items: center;
            gap: 0.5vw;
            font-size: 0.8vw;

            #match-badge {
                padding: 0.15vw 0.4vw;
                background-color: rgba(232, 120, 34, 0.9);
                border-radius: 0.3vw;
                border: 1px solid rgba(255, 255, 255, 0.15);
                font-weight: 500;
            }
        }
    }

    #matchup {
        display: flex;
        flex-direction: row;
        gap: 1.05vw;
        align-items: center;
        background-image:
            radial-gradient(24vw 6.5vw at 12vw, rgba(255, 38, 46, 0.3), transparent),
            radial-gradient(24vw 6.5vw at calc(100% - 12vw), rgba(0, 68, 255, 0.3), transparent);
    }

    .team {
        position: relative;

        > img {
            height: 10.5vw;
            width: 7vw;
            object-fit: cover;
            filter: brightness(0.7);
            border-radius: 0.5vw;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 0.6vw rgba(0, 0, 0, 0.4);
        }

        > p {
            position: absolute;
            bottom: 4%;
            left: 0;
            width: 100%;
            font-size: 1.8vw;
            font-weight: 800;
            text-align: center;
            color: white;
            text-shadow: 0 0 0.2vw black;
            mask-image: linear-gradient(rgba(0, 0, 0, 0.6), black);
        }
    }

    .tbd {
        line-height: 18vh;
        text-align: center;
        height: 18vh;
        width: 22vw;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.6vw;
        font-style: italic;
        border-radius: 0.5vw;
        border: 1px solid rgb(120, 120, 124);
        background: linear-gradient(rgba(202, 202, 208, 0.6), rgba(202, 202, 208, 0.1));
        box-shadow: 0 0 0.6vw rgba(0, 0, 0, 0.4);
    }
</style>
