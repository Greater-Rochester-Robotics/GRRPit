<script lang="ts">
    let { checked = $bindable(false) } = $props();
</script>

<label class="switch">
    <input type="checkbox" bind:checked />
    <span class="slider"></span>
</label>

<style>
    .switch {
        position: relative;
        display: inline-block;
        width: 3vw;
        height: 1.2vw;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        border-radius: 0.6vw 0.6vw;
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgb(22, 22, 24);
        transition-duration: 0.25s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 0.9vw;
        width: 1.6vw;
        left: 0.15vw;
        bottom: 0.15vw;
        border-radius: 0.45vw 0.45vw;
        background-color: white;
        transition-duration: 0.25s;
    }

    input:checked + .slider {
        background-color: #e87722;
    }

    input:checked + .slider:before {
        transform: translateX(1.1vw);
        -webkit-transform: translateX(1.1vw);
    }
</style>
