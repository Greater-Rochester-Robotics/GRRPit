<script lang="ts">
    import { FRCColors } from "$lib/apis/FRCColors";
    import { Conduit } from "$lib/Conduit";
    import type { EventState } from "../EventState";

    let { event }: { event: EventState } = $props();

    let colors = $derived(
        (event.playoffs?.alliances ?? []).map((a) => (a.colors.usePrimary ? a.colors.primary : a.colors.secondary)),
    );

    function onAvatarError(e: any) {
        if (e.target && e.target.src !== "avatar.png") e.target.src = "avatar.png";
    }
</script>

<div id="container">
    {#each event.playoffs?.alliances ?? [] as alliance}
        {@const gradient = (l: number) =>
            `linear-gradient(to right in lch, lch(from ${colors[alliance.number - 1]} calc(l + ${l}) c h), lch(0 0 0) 110%)`}

        <button
            class="alliance"
            style="background: {gradient(-10)} padding-box, {gradient(15)} border-box"
            onclick={() => Conduit.toggleAllianceColor(alliance.colors.source, event)}
        >
            <h1>{alliance.number}</h1>
            <div class="teams">
                {#each alliance.teams as team}
                    <div class="team{alliance.teams.length > 3 ? ` condensed` : ``}">
                        <img alt="" src={FRCColors.avatar(team)} onerror={onAvatarError} />
                        <p>{team}</p>
                    </div>
                {/each}
            </div>
        </button>
    {/each}
</div>

<style>
    #container {
        display: flex;
        flex-direction: column;
        gap: 0.8vw;
    }

    .alliance {
        display: flex;
        width: 20vw;
        flex-direction: row;
        align-items: center;
        border-radius: 0.5vw;
        color: inherit;
        font-family: inherit;
        box-shadow: 0 0 0.6vw rgba(0, 0, 0, 0.3);
        border: 1px solid transparent;
        display: flex;

        > h1 {
            margin-left: 0.4vw;
            width: 2.4vw;
            font-weight: 800;
            text-align: center;
            font-size: 2.8vw;
            mask-image: linear-gradient(rgba(0, 0, 0, 0.2), black 130%);
            text-shadow: 0 0 0.4vw rgba(0, 0, 0, 1);
        }
    }

    .teams {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        flex-grow: 1;
    }

    .team {
        display: flex;
        flex-direction: row;
        justify-content: center;
        line-height: 100%;
        align-items: center;
        gap: 0.4vw;

        > img {
            height: 1vw;
            width: 1vw;
            display: inline;
            vertical-align: middle;
            border-radius: 0.09vw;
            object-fit: contain;
            filter: drop-shadow(0 0 0.2vw rgba(0, 0, 0, 0.5));
        }

        > p {
            font-size: 0.9vw;
            font-weight: 500;
            text-shadow: 0 0 0.4vw black;
            opacity: 0.8;
        }
    }

    .condensed {
        gap: 0.32vw;

        > img {
            height: 0.8vw;
            width: 0.8vw;
        }

        > p {
            font-size: 0.72vw;
        }
    }
</style>
