<script lang="ts">
    import type { EventState } from "../EventState";

    let { event }: { event: EventState } = $props();
</script>

<div id="up-next-container">
    <div id="match">
        <p style="font-size: 1vw; opacity: 0.6; font-weight: 300;">Up Next</p>
        <p style="font-size: 2vw; font-weight: 700;">{event.upNext.label ?? `Break`}</p>
        <p style="padding-top: 0.2vw; opacity: 0.8; font-size: 1.2vw; font-weight: 500; font-style: italic;">
            {event.upNext.match?.status ?? ``}
        </p>
    </div>
    <div id="matchup">
        {#if event.upNext.match}
            {#snippet alliance(red: boolean)}
                {#each event.upNext.match!.teams.filter((t) => (red ? t.red : !t.red)) as team}
                    {@const loaded = { count: 0 }}
                    <div class="team-container">
                        <img
                            alt=""
                            onerror={(e: any) => {
                                loaded.count += 1;
                                e.target.src =
                                    loaded.count < team.images.length ? team.images[loaded.count] : `dozer.jpeg`;
                            }}
                            src={team.images.length ? team.images[0] : `dozer.jpeg`}
                        />
                        <div class="img-text">{team.teamNumber}</div>
                    </div>
                {/each}
            {/snippet}

            {@render alliance(true)}
            <p style="font-size: 1.6vw; font-weight: 700;">vs</p>
            {@render alliance(false)}
        {/if}
    </div>
</div>

<style>
    #up-next-container {
        display: flex;
        height: 25vh;
        width: 100%;
        gap: 2vw;
        justify-content: space-between;
    }

    #match {
        display: flex;
        flex-flow: column;
        font-optical-sizing: none;
        justify-content: center;
    }

    #matchup {
        display: flex;
        gap: 1.05vw;
        align-items: center;
    }

    .team-container {
        position: relative;
    }

    .team-container > img {
        height: 18vh;
        width: 6.5vw;
        object-fit: cover;
        filter: brightness(0.7);
        border-radius: 0.5vw;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.25);
    }

    .team-container > div {
        position: absolute;
        bottom: 4%;
        left: 0;
        width: 100%;
        font-size: 1.6vw;
        font-weight: 800;
        letter-spacing: 1px;
        text-align: center;
        color: white;
        mask-image: linear-gradient(black, rgba(0, 0, 0, 0.6));
    }
</style>
