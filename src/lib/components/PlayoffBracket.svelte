<script lang="ts">
    import type { EventState } from "../EventState";

    let { event }: { event: EventState } = $props();
</script>

{#snippet match(number: number)}
    {@const match = event.playoffs?.matches.find((m) => m.number === number)}
    {#if match}
        {#snippet alliance(red: boolean)}
            {@const teams = match[red ? `redTeams` : `blueTeams`]}
            <div
                class="alliance {red ? `red` : `blue`}{match.usRed === red
                    ? ` us`
                    : match.usRed !== null
                      ? ` opponent`
                      : ``}"
            >
                {#if teams.length}
                    {#each teams as team}
                        <p>{team}</p>
                    {/each}
                {:else}
                    <p>{match[red ? `redFill` : `blueFill`]}</p>
                {/if}
            </div>
        {/snippet}

        <div class="match">
            {#if match.number > 13}
                <i style="font-weight: 700;">Finals</i>
            {:else}
                <i>{match.name}</i>
            {/if}
            {@render alliance(true)}
            {@render alliance(false)}
        </div>
    {/if}
{/snippet}

<div id="container">
    <div class="round">
        {@render match(1)}
        {@render match(2)}
        {@render match(3)}
        {@render match(4)}
    </div>
    <div style="width: 1.5vw;"></div>
    <div class="round">
        <span class="half-spacer"></span>
        {@render match(7)}
        <span class="spacer"></span>
        {@render match(8)}
        <span class="spacer"></span>
        {@render match(5)}
        {@render match(6)}
    </div>
    <div style="width: 1.5vw;"></div>
    <div class="round">
        <span class="quad-spacer"></span>
        {@render match(10)}
        {@render match(9)}
    </div>
    <div style="width: 1.5vw;"></div>
    <div class="round">
        <span class="spacer"></span>
        <span class="half-spacer"></span>
        {@render match(11)}
        <span class="double-spacer"></span>
        {@render match(12)}
    </div>
    <div style="width: 1.5vw;"></div>
    <div class="round">
        <span class="quad-spacer"></span>
        {@render match(13)}
    </div>
    <div style="width: 1.5vw;"></div>
    <div class="round">
        <span class="double-spacer"></span>
        <span class="half-spacer"></span>
        {@render match(14)}
    </div>
</div>

<style>
    :root {
        --match-height: 4.8vw;
    }

    #container {
        display: flex;
        flex-direction: row;
        gap: 0.2vw;
    }

    .round {
        display: flex;
        flex-direction: column;
        gap: 0.2vw;
    }

    .match {
        height: var(--match-height);
        display: flex;
        flex-direction: column;
        justify-content: center;
        justify-content: space-evenly;

        > i {
            font-size: 0.6vw;
            margin-left: 0.2vw;
        }
    }

    .spacer {
        height: var(--match-height);
    }

    .half-spacer {
        height: calc(var(--match-height) * 0.5);
    }

    .double-spacer {
        height: calc(var(--match-height) * 2);
    }

    .quad-spacer {
        height: calc(var(--match-height) * 4);
    }

    .alliance {
        width: 9.5vw;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        text-align: center;
        opacity: 1;
        border-radius: 0.3vw;
        border: 1px solid transparent;

        > p {
            padding: 0.35vw 0;
            font-size: 0.7vw;
        }
    }

    .red {
        background-color: rgba(255, 38, 46, 0.15);
    }

    .red.us {
        background-color: rgba(255, 38, 46, 0.6);
    }

    .red.opponent {
        background-color: rgba(255, 38, 46, 0.42);
    }

    .blue {
        background-color: rgba(0, 68, 255, 0.15);
    }

    .blue.us {
        background-color: rgba(0, 68, 255, 0.6);
    }

    .blue.opponent {
        background-color: rgba(0, 68, 255, 0.42);
    }

    .us {
        font-weight: 700;
    }

    .us,
    .opponent {
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.25);
    }
</style>
