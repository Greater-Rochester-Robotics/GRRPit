<script lang="ts">
    import type { EventState, ScheduledMatch } from "../EventState";
    import { stringifyTime } from "../util";

    let { event }: { event: EventState } = $props();

    function stringifyMatchNumber(match: ScheduledMatch): string {
        const n = match.matchNumber;
        if (match.playoffs) {
            if (n > 13) return `F${n - 13}`;
            else return `M${n}`;
        }

        return `${n}`;
    }
</script>

<table cellspacing="0" cellpadding="0" style="border: none;">
    <tbody>
        <tr>
            <th>Match</th>
            <th>Red Alliance</th>
            <th></th>
            <th></th>
            <th></th>
            <th>Blue Alliance</th>
        </tr>

        {#each event.schedule as match}
            {#snippet alliance(red: boolean)}
                {#each match.teams.filter((t) => t.red === red) as { teamNumber }}
                    <p>{teamNumber}</p>
                {/each}
            {/snippet}

            <tr>
                <td>{stringifyMatchNumber(match)}</td>
                <td>
                    <div class="alliance red{match.usRed ? ` us` : ``}">
                        {@render alliance(true)}
                    </div>
                </td>
                {#if match.result}
                    <td
                        class="score"
                        style="padding-left: 0; {match.usRed && match.result.usWin ? ` opacity: 1.0;` : ``}"
                    >
                        {match.result.scoreRed}
                    </td>
                    <td style="font-weight: 800; font-size: 0.8vw; opacity: {match.result.usWin ? 1 : 0.4}">
                        {match.playoffs ? (match.result.usWin ? `W` : `L`) : `${match.result.awardedRp} RP`}
                    </td>
                    <td
                        class="score"
                        style="padding-right: 0; {!match.usRed && match.result.usWin ? ` opacity: 1.0;` : ``}"
                    >
                        {match.result.scoreBlue}
                    </td>
                {:else}
                    <td></td>
                    <td style="font-weight: 600; font-size: 0.8vw;">{stringifyTime(match.startTime)}</td>
                    <td></td>
                {/if}

                <td>
                    <div class="alliance blue{!match.usRed ? ` us` : ``}">
                        {@render alliance(false)}
                    </div>
                </td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    tr {
        clip-path: xywh(0 0 100% 100% round 0.3vw);
    }

    tr:nth-child(even) {
        background-color: rgba(0, 0, 0, 0.1);
    }

    tr > * {
        padding: 0.4vw 1vw;
        text-align: center;
    }

    th {
        font-size: 0.65vw;
        font-weight: 600;
        opacity: 0.6;
    }

    td {
        font-size: 0.7vw;
    }

    .score {
        font-weight: 700;
        width: 2vw;
        opacity: 0.4;
    }

    .alliance {
        display: flex;
        opacity: 1;
        border-radius: 0.3vw;
    }

    .alliance > p {
        width: 4vw;
        padding: 0.35vw 0;
        font-size: 0.8vw;
    }

    .red {
        background-color: rgba(255, 38, 46, 0.15);
    }

    .red.us {
        background-color: rgba(255, 38, 46, 0.3);
    }

    .blue {
        background-color: rgba(0, 68, 255, 0.15);
    }

    .blue.us {
        background-color: rgba(0, 68, 255, 0.3);
    }

    .us {
        font-weight: 700;
    }
</style>
