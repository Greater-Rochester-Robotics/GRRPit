<script lang="ts">
    import { type EventState } from "../EventState";
    import { stringifyTime } from "../util";

    let { event }: { event: EventState } = $props();
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
                <div class="alliance {red ? `red` : `blue`}{match.usRed === red ? ` us` : ``}">
                    {#each match[red ? `redTeams` : `blueTeams`] as team}
                        <p>{team}</p>
                    {/each}
                </div>
            {/snippet}

            <tr>
                <td>{match.number}</td>
                <td>{@render alliance(true)}</td>
                {#if match.result}
                    <td class="score" style="padding-left: 0; {match.usRed ? ` opacity: 1.0;` : ``}">
                        {match.result.scoreRed}
                    </td>
                    <td style="font-weight: 800; font-size: 0.8vw; opacity: {match.result.usWin ? 1 : 0.4}">
                        {typeof match.result.awardedRp == `number`
                            ? `${match.result.awardedRp} RP`
                            : match.result.usWin
                              ? `W`
                              : `L`}
                    </td>
                    <td class="score" style="padding-right: 0; {!match.usRed ? ` opacity: 1.0;` : ``}">
                        {match.result.scoreBlue}
                    </td>
                {:else}
                    <td></td>
                    <td style="font-weight: 600; font-size: 0.8vw;">
                        {match.startTime ? stringifyTime(match.startTime) : `TBD`}
                    </td>
                    <td></td>
                {/if}

                <td>{@render alliance(false)}</td>
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
        width: 12vw;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        text-align: center;
        opacity: 1;
        border-radius: 0.3vw;

        > p {
            padding: 0.35vw 0;
            font-size: 0.8vw;
        }
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
