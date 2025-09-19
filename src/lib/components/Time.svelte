<script lang="ts">
    import { stringifyTime } from "$lib/util";
    import type { EventState } from "../EventState";

    let { event, alignCenter = false }: { event: EventState; alignCenter?: boolean } = $props();
</script>

<div
    style="display: flex; margin: 0.5vw; gap: 0.1vw; flex-direction: column; text-align: {alignCenter
        ? `center`
        : `left`}"
>
    <p style="font-size: 1.6vw; font-weight: 700;">
        {event.now.toLocaleString(`en-us`, { weekday: `long` })}
    </p>
    <p style="opacity: 0.6; font-size: 1vw; font-weight: 700;">{stringifyTime(event.now)}</p>
</div>
