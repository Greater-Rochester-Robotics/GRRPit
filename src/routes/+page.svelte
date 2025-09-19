<script lang="ts">
    let loading = $state(false);
    function setLoading() {
        loading = true;
    }
</script>

<main>
    <div id="container">
        <img id="pit-image" src="grrpit.png" alt="" />
        <div id="menu">
            <h1>GRRPit</h1>
            {#if !loading}
                <a href="/practice" onclick={setLoading}>Practice Matches</a>
                <a href="/qualifications" onclick={setLoading}>Qualifications</a>
                <a href="/playoffs" onclick={setLoading}>Playoffs</a>
                <a href="/settings" onclick={setLoading}>Settings</a>
            {:else}
                <p>Loading...</p>
            {/if}
        </div>
    </div>
</main>

<style>
    main {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: none;
    }

    #container {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        height: 32vw;
        width: 60vw;
        overflow: hidden;
        border-radius: 2vh;
        background-color: black;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 1vw rgba(0, 0, 0, 0.5);
    }

    #pit-image {
        align-self: flex-end;
        height: 30vw;
        width: auto;
    }

    #menu {
        display: flex;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        gap: 1vh;
        margin: auto 0;
        opacity: 0.9;
        text-align: right;

        > * {
            margin-right: 8vw;
        }

        h1 {
            font-size: 3vw;
            font-weight: 800;
        }

        a,
        p {
            font-weight: 600;
            font-size: 1vw;
        }
    }
</style>
