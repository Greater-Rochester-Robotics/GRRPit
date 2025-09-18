<script lang="ts">
    import type { EventState } from "../EventState";

    let { event }: { event: EventState } = $props();

    function stubStyle(spaces: number) {
        return `margin-bottom: calc(var(--match-height) * ${spaces / 2 + 0.5} + var(--alliance-middle) - var(--bracket-border));`;
    }
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
            <div class="match-header">
                {#if match.number > 13}
                    <i style="font-weight: 700;">Finals</i>
                {:else}
                    <i>{match.name}</i>
                {/if}
                {#if match.header}
                    <i style="font-weight: 200; opacity: 0.7;">{match.header}</i>
                {/if}
            </div>
            <span style="height: 0.2vw;"></span>
            {@render alliance(true)}
            <span class="alliance-gap"></span>
            {@render alliance(false)}
        </div>
    {/if}
{/snippet}

{#snippet merger(spaces: number = 0, continuous: boolean = false, topPass: boolean = false)}
    <div class="bracket" style="height: calc(var(--match-height) * (2 + {spaces}))">
        {#if topPass}
            <span
                class="stub"
                style="width: 20%; margin-bottom: calc(var(--match-height) * (1 + {spaces}) + var(--alliance-middle) - var(--bracket-border))"
            ></span>
        {:else}
            <span class="end"></span>
        {/if}
        <span
            style="height: calc(var(--match-height) * (1 + {spaces}) - var(--bracket-border)); margin-bottom: var(--alliance-middle); border-left: none;"
        ></span>
        <span class="stub" style={stubStyle(spaces)}></span>
        {#if continuous}
            <span class="stub" style="width: 20%; {stubStyle(spaces)}"></span>
        {:else}
            <span class="end"></span>
        {/if}
    </div>
{/snippet}

{#snippet snek()}
    <div class="bracket" style="height: var(--match-height);">
        <span class="end"></span>
        <span
            style="height: calc(var(--match-height) * 0.5); margin-bottom: var(--alliance-middle); border-left: none; border-top: none;"
        ></span>
        <span class="stub" style={stubStyle(0)}></span>
        <span class="end"></span>
    </div>
{/snippet}

{#snippet passthrough(full: boolean = true, baseLeft: boolean = true)}
    <div class="bracket" style="height: var(--match-height); justify-content: {baseLeft ? `left` : `right`};">
        <span class="stub" style="width: {full ? 100 : 80}%; {stubStyle(-1)}"></span>
    </div>
{/snippet}

<div id="container">
    <div class="round">
        {@render match(1)}
        {@render match(2)}
        {@render match(3)}
        {@render match(4)}
    </div>
    <div class="divider">
        {@render merger()}
        {@render merger()}
    </div>
    <div class="round">
        <span class="half-spacer"></span>
        {@render match(7)}
        <span class="spacer"></span>
        {@render match(8)}
        <span class="spacer"></span>
        {@render match(5)}
        {@render match(6)}
    </div>
    <div class="divider">
        <span class="half-spacer"></span>
        {@render merger(1, true)}
        <span class="spacer"></span>
        {@render snek()}
        {@render snek()}
    </div>
    <div class="round">
        <span class="three-halves-spacer"></span>
        {@render passthrough()}
        <span class="three-halves-spacer"></span>
        {@render match(10)}
        {@render match(9)}
    </div>
    <div class="divider">
        <span class="three-halves-spacer"></span>
        {@render passthrough(false, true)}
        <span class="three-halves-spacer"></span>
        {@render merger()}
    </div>
    <div class="round">
        <span class="three-halves-spacer"></span>
        {@render match(11)}
        <span class="double-spacer"></span>
        {@render match(12)}
    </div>
    <div class="divider">
        <span class="three-halves-spacer"></span>
        {@render passthrough(false, false)}
        <span class="double-spacer"></span>
        {@render snek()}
    </div>
    <div class="round">
        <span class="three-halves-spacer"></span>
        {@render passthrough()}
        <span class="three-halves-spacer"></span>
        {@render match(13)}
    </div>
    <div class="divider">
        <span class="three-halves-spacer"></span>
        {@render merger(1.5, false, true)}
    </div>
    <div class="round">
        <span style="height: calc(var(--match-height) * 2.75)"></span>
        {@render match(14)}
    </div>
</div>

<style>
    :root {
        --match-height: 5vw;

        --alliance-font-size: 0.7vw;
        --alliance-padding: 0.35vw;
        --alliance-border: 1px;
        --alliance-gap: 0.25vw;
        --alliance-middle: calc(
            var(--alliance-font-size) + var(--alliance-padding) * 2 + var(--alliance-border) * 2 + var(--alliance-gap) *
                0.5
        );

        --bracket-border: 0.12vw;
    }

    #container {
        display: flex;
        flex-direction: row;
    }

    .round,
    .divider {
        display: flex;
        flex-direction: column;
    }

    .divider {
        width: 2.4vw;
    }

    .bracket {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: end;

        .stub {
            height: 0;
            border-left: none;
            border-right: none;
            border-bottom: var(--bracket-border) solid transparent;
        }

        .end {
            width: 20%;
            height: 100%;
            border: none;
        }

        > span {
            border: var(--bracket-border) solid rgb(80, 80, 80);
            width: 30%;
        }
    }

    .match {
        height: var(--match-height);
        width: 9.5vw;
        display: flex;
        flex-direction: column;
        justify-content: end;

        .match-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            font-size: 0.6vw;
            margin-left: 0.2vw;
        }

        .alliance {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            text-align: center;
            border-radius: 0.3vw;
            border: var(--alliance-border) solid transparent;

            > p {
                padding: var(--alliance-padding) 0;
                font-size: var(--alliance-font-size);
            }
        }

        .alliance-gap {
            height: var(--alliance-gap);
        }

        .red {
            background-color: rgba(255, 38, 46, 0.2);
        }

        .red.us {
            background-color: rgba(255, 38, 46, 0.5);
            box-shadow: 0 0 0.4vw rgba(255, 38, 46, 0.25);
        }

        .blue {
            background-color: rgba(0, 68, 255, 0.2);
        }

        .blue.us {
            background-color: rgba(0, 68, 255, 0.5);
            box-shadow: 0 0 0.4vw rgba(0, 68, 255, 0.25);
        }

        .us {
            font-weight: 700;
        }

        .opponent {
            box-shadow: 0 0 0.4vw rgba(0, 0, 0, 0.35);
        }

        .us,
        .opponent {
            border: var(--alliance-border) solid rgba(255, 255, 255, 0.1);
        }
    }

    .spacer {
        height: var(--match-height);
    }

    .half-spacer {
        height: calc(var(--match-height) * 0.5);
    }

    .three-halves-spacer {
        height: calc(var(--match-height) * 1.5);
    }

    .double-spacer {
        height: calc(var(--match-height) * 2);
    }
</style>
