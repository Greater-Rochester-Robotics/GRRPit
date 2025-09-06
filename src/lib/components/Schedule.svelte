<script lang="ts">
    import type { Conduit } from "../Conduit";
    import type { EventState, ScheduledMatch } from "../EventState";
    import { stringifyTime } from "../util";

    let { event, conduit }: { event: EventState; conduit: Conduit } = $props();

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
                    <p style="text-decoration-line: {teamNumber === conduit.getTeam() ? `underline` : `none`};">
                        {teamNumber}
                    </p>
                {/each}
            {/snippet}

            <tr>
                <td>{stringifyMatchNumber(match)}</td>
                <td>
                    <div class="alliance" style="background-color: rgba(255, 38, 46, {match.usRed ? 0.25 : 0.13});">
                        {@render alliance(true)}
                    </div>
                </td>
                {#if match.result}
                    <td style="font-weight: 700; opacity: {match.result.winner === `Red` ? 1.0 : 0.4};"
                        >{match.result.scoreRed}</td
                    >
                    <td style="font-weight: 800; font-size: 0.8vw;"
                        >{match.playoffs
                            ? (match.result.winner === `Red`) === match.usRed
                                ? `W`
                                : `L`
                            : `${match.result.awardedRp} RP`}</td
                    >
                    <td style="font-weight: 700; opacity: {match.result.winner === `Blue` ? 1.0 : 0.4};"
                        >{match.result.scoreBlue}</td
                    >
                {:else}
                    <td></td>
                    <td style="font-weight: 600; font-size: 0.8vw;">{stringifyTime(match.startTime)}</td>
                    <td></td>
                {/if}

                <td>
                    <div class="alliance" style="background-color: rgba(0, 68, 255, {!match.usRed ? 0.25 : 0.13});">
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
</style>
