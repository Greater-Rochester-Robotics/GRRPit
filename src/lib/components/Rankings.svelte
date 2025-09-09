<script lang="ts">
    import type { EventState } from "../EventState";
    import { FRCColors } from "../apis/FRCColors";

    let { event }: { event: EventState } = $props();

    function onAvatarError(e: any) {
        if (e.target && e.target.src !== "avatar.png") e.target.src = "avatar.png";
    }
</script>

<table cellspacing="0" cellpadding="0" style="border: none;">
    <tbody>
        {#each event.rankings as ranking}
            <tr style={ranking.us ? "background-color: rgba(255, 255, 255, 0.05);" : ``}>
                <td>{ranking.rank}</td>
                <td class="avatar">
                    <img alt="" src={FRCColors.avatar(ranking.teamNumber)} onerror={onAvatarError} />
                </td>
                <td style="text-align: left; font-weight: 600;">{ranking.teamNumber}</td>
                <td style="width: 1vw;"></td>
                <td class="metric" style="opacity: 0.6; text-align: right;"
                    >{ranking.wins}-{ranking.losses}{ranking.ties > 0 ? `-${ranking.ties}` : ``}</td
                >
                <td class="metric">{ranking.rankingScore.toFixed(2)}</td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    tr {
        clip-path: xywh(0 0 100% 100% round 0.3vw);
    }

    td {
        padding: 0.5vw 0.5vw;
        font-size: 0.8vw;
        text-align: center;
    }

    .avatar {
        display: flex;
        align-items: center;
    }

    .avatar > img {
        height: 1.3vw;
        width: 1.3vw;
        border-radius: 2px;
        object-fit: contain;
    }

    .metric {
        font-family: "JetBrains Mono", monospace;
        font-weight: 500;
    }
</style>
