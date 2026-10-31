<script lang="ts">
    // Mood Meter powered by Grok Imagine
    type Color = [number, number, number];
    // Verity's From Minecraft... He Belongs to Backrooms... 🚀🚀🚀
    const moods = [
        [`Enraged`, `Stressed`, `Shocked`, `Surprised`, `Festive`, `Ecstatic`],
        [`Fuming`, `Angry`, `Restless`, `Energized`, `Optimistic`, `Excited`],
        [`Repulsed`, `Worried`, `Uneasy`, `Focused`, `Hopeful`, `Blissful`],
        [`Disgusted`, `Down`, `Apathetic`, `At Ease`, `Content`, `Fulfilled`],
        [`Miserable`, `Lonely`, `Tired`, `Relaxed`, `Restful`, `Balanced`],
        [`Despair`, `Desolate`, `Drained`, `Sleepy`, `Tranquil`, `Serene`],
    ];
    const size = moods.length;

    // Words for going far off the scale next to certain moods, used instead of "Extremely".
    const extremes: Record<string, string> = { Enraged: `Pugnacious`, Repulsed: `Repugnant` };

    const red: Color = [255, 69, 58];
    const yellow: Color = [255, 214, 10];
    const blue: Color = [10, 132, 255];
    const green: Color = [48, 209, 88];
    const white: Color = [255, 255, 255];
    const black: Color = [0, 0, 0];

    let container: HTMLDivElement;
    let grid: HTMLDivElement;
    let dragging = $state(false);

    // Position relative to the chart, where 0 to 1 is on it
    let x = $state(3.5 / size);
    let y = $state(2.5 / size);

    // How far off the scale the face can go before hitting the edge of the container.
    let limits = $state({ left: 0, right: 1, top: 0, bottom: 1 });

    const clamp = (v: number) => Math.min(Math.max(v, 0), 1);
    const mix = (a: Color, b: Color, t: number): Color => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as Color;
    const rgba = ([r, g, b]: Color, a = 1) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;

    // 0 to 1 for how far past the edge of the chart a position is.
    const overshoot = (v: number, min: number, max: number) =>
        v < 0 ? clamp(v / min) : v > 1 ? clamp((v - 1) / (max - 1)) : 0;

    const row = $derived(Math.min(Math.floor(clamp(y) * size), size - 1));
    const col = $derived(Math.min(Math.floor(clamp(x) * size), size - 1));
    const overshootX = $derived(overshoot(x, limits.left, limits.right));
    const overshootY = $derived(overshoot(y, limits.top, limits.bottom));
    const intensity = $derived(Math.max(overshootX, overshootY));

    const label = $derived.by(() => {
        const mood = moods[row][col];
        if (intensity > 0.5) return extremes[mood] ?? `Extremely ${mood}`;
        return intensity > 0 ? `Very ${mood}` : mood;
    });

    // -1 to 1 on the chart, unpleasant to pleasant and low to high energy.
    const pleasant = $derived(clamp(x) * 2 - 1 + Math.sign(x - 0.5) * overshootX * 0.6);
    const energy = $derived(1 - clamp(y) * 2 - Math.sign(y - 0.5) * overshootY * 0.6);

    function cellColor(r: number, c: number): string {
        const ring = Math.max(Math.abs(r - 2.5), Math.abs(c - 2.5)) - 0.5;
        const high = r < size / 2;
        return rgba(mix(high ? red : blue, high ? yellow : green, c / (size - 1)), 0.35 + ring * 0.2);
    }

    // Blends between the high and low energy colors across the middle third.
    const face = $derived.by(() => {
        const high = clamp((0.5 - y) * 3 + 0.5);
        return mix(mix(blue, green, clamp(x)), mix(red, yellow, clamp(x)), high);
    });
    const faceColor = $derived(rgba(face));

    // 0 to 1 for how angry the face is, which squints the eyes and turns the frown into a crooked scowl (the cruelty friend).
    const scowl = $derived(clamp(clamp(-pleasant) * clamp(energy) * 1.5));

    // 0 to 1 for how skeptical the face is, toward the unpleasant side at middling energy, which raises one brow.
    const doubt = $derived(clamp(-pleasant * 1.5) * (1 - clamp(Math.abs(energy) * 1.5)));
    const crook = $derived(Math.max(scowl, doubt));

    // Eyes open a little wider with energy, but close quickly when it's low.
    const eyeHeight = $derived(energy > 0 ? 7 + energy * 1.5 : Math.max(7 + energy * 4, 1));
    const eyeTop = $derived(40 - eyeHeight);

    // Brows only show up on the unpleasant side, angled down when angry and up when sad.
    const browTilt = $derived(Math.min(clamp(-pleasant) * energy * 4 + scowl * 3, 8));
    const browHeight = $derived(eyeTop - 5 - Math.max(browTilt, 0) + scowl * 5);
    const brows = $derived.by(() => {
        const left = browHeight - doubt * 5;
        const right = browHeight + doubt * 2;
        const leftTilt = browTilt * (1 - doubt);
        const rightTilt = browTilt * (1 - doubt) + doubt * 4;
        return {
            left: `M 29 ${left + crook * 4} Q 30 ${left - 1} 33 ${left - 1} Q 39 ${left - 1 - doubt * 3} 45 ${left + leftTilt}`,
            right: `M 71 ${right + crook * 4} Q 70 ${right - 1} 67 ${right - 1} L 55 ${right + rightTilt}`,
            opacity: Math.max(clamp(Math.abs(browTilt) / 3), doubt),
        };
    });

    const mouth = $derived.by(() => {
        const width = 20 + energy * 2 - doubt * 6;
        const center = 50 + doubt * 5;
        const bend = (2 / 3) * pleasant * 12 * (1 - crook * 0.8);
        const open = Math.max(energy, 0) * 6 * (1 - crook);
        const left = [center - width, 64 + crook * 2];
        const right = [center + width, 64 - crook * 6];
        const c1 = [center - width / 3, 64 + bend + scowl * 3];
        const c2 = [center + width / 3, 64 + bend - scowl * 3];

        // Little ticks across the ends of a smile, like verity.
        const tick = ([x, y]: number[], [dx, dy]: number[]) => {
            const length = Math.hypot(dx, dy) / 3.5;
            return `M ${x - dy / length} ${y + dx / length} L ${x + dy / length} ${y - dx / length}`;
        };

        return {
            path: `M ${left} C ${c1} ${c2} ${right} C ${c2[0]} ${c2[1] + open} ${c1[0]} ${c1[1] + open} ${left} Z`,
            ticks: `${tick(left, [c1[0] - left[0], c1[1] - left[1]])} ${tick(right, [right[0] - c2[0], right[1] - c2[1]])}`,
            creases: `M ${right[0] + 1} ${right[1] - 4} l 5 1 M ${right[0] + 2} ${right[1] - 1.5} l 5 1`,
        };
    });

    const tears = $derived(pleasant < 0 && energy < 0 ? intensity : 0);
    const blush = $derived(pleasant > 0 ? intensity : 0);
    const anger = $derived(pleasant < 0 && energy > 0 ? intensity : 0);

    function move(e: PointerEvent) {
        const bounds = container.getBoundingClientRect();
        const rect = grid.getBoundingClientRect();
        limits = {
            left: (bounds.left - rect.left) / rect.width,
            right: (bounds.right - rect.left) / rect.width,
            top: (bounds.top - rect.top) / rect.height,
            bottom: (bounds.bottom - rect.top) / rect.height,
        };
        x = Math.min(Math.max((e.clientX - rect.left) / rect.width, limits.left), limits.right);
        y = Math.min(Math.max((e.clientY - rect.top) / rect.height, limits.top), limits.bottom);
    }
</script>

<div
    id="mood-meter"
    role="application"
    bind:this={container}
    onpointerdown={(e) => {
        dragging = true;
        container.setPointerCapture(e.pointerId);
        move(e);
    }}
    onpointermove={(e) => dragging && move(e)}
    onpointerup={() => (dragging = false)}
    onpointercancel={() => (dragging = false)}
>
    <div id="chart">
        <div id="header">
            <p style="font-size: 0.8vw; opacity: 0.6; font-weight: 300;">Feeling</p>
            <p id="word" style={intensity > 0 ? `color: ${faceColor};` : ``}>
                {label}
            </p>
        </div>
        <p class="axis" id="energy">Energy &rarr;</p>
        <div id="grid" bind:this={grid}>
            {#each moods as words, r}
                {#each words as word, c}
                    <div
                        class="cell"
                        class:active={r === row && c === col}
                        style="background-color: {cellColor(r, c)};"
                    >
                        <p>{word}</p>
                    </div>
                {/each}
            {/each}

            <div
                id="face"
                class:dragging
                class:shaking={anger > 0}
                style="left: {x * 100}%; top: {y * 100}%; scale: {(1 + intensity * 0.25) *
                    (dragging ? 1.15 : 1)}; --shake: {anger * 10}deg;"
            >
                <div id="shadow"></div>
                <div id="glow" style="box-shadow: 0 0 {intensity * 1.2}vw {faceColor};"></div>
                <svg viewBox="0 0 100 100">
                    <defs>
                        <radialGradient id="shading" cx="35" cy="28" r="80" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color={rgba(mix(face, white, 0.6))}></stop>
                            <stop offset="45%" stop-color={faceColor}></stop>
                            <stop offset="100%" stop-color={rgba(mix(face, black, 0.45))}></stop>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="50" fill="url(#shading)"></circle>
                    <ellipse class="blush" cx="25" cy="56" rx="7" ry="4.5" opacity={blush * 0.7}></ellipse>
                    <ellipse class="blush" cx="75" cy="56" rx="7" ry="4.5" opacity={blush * 0.7}></ellipse>
                    <g class="features">
                        <ellipse cx="39" cy="40" rx="4" ry={eyeHeight}></ellipse>
                        <ellipse cx="61" cy="40" rx="4" ry={eyeHeight}></ellipse>
                        <path d={mouth.path}></path>
                        <path d={mouth.ticks} opacity={clamp((pleasant - 0.2) * 2)}></path>
                        <g class="lines" opacity={scowl}>
                            <path d={mouth.creases}></path>
                            <path d="M 35 {eyeTop + eyeHeight * 2 + 3} q 4 1.5 8 0"></path>
                            <path d="M 65 {eyeTop + eyeHeight * 2 + 3} q -4 1.5 -8 0"></path>
                        </g>
                    </g>

                    <!-- Lids drawn in the face's shading to cut off the tops of the eyes when scowling. -->
                    <g fill="url(#shading)" opacity={scowl > 0 ? 1 : 0}>
                        <polygon
                            points="33.5,{eyeTop - 2} 45,{eyeTop - 2} 45,{eyeTop + eyeHeight * scowl} 33.5,{eyeTop +
                                eyeHeight * scowl * 0.3}"
                        ></polygon>
                        <polygon
                            points="66.5,{eyeTop - 2} 55,{eyeTop - 2} 55,{eyeTop + eyeHeight * scowl} 66.5,{eyeTop +
                                eyeHeight * scowl * 0.3}"
                        ></polygon>
                    </g>

                    <g class="features lines" opacity={brows.opacity}>
                        <path d={brows.left}></path>
                        <path d={brows.right}></path>
                    </g>

                    <ellipse
                        class="tear"
                        cx="39"
                        cy={42 + eyeHeight + tears * 4}
                        rx="2.5"
                        ry={2.5 + tears * 2}
                        opacity={tears}
                    ></ellipse>
                    <ellipse
                        class="tear"
                        cx="61"
                        cy={42 + eyeHeight + tears * 4}
                        rx="2.5"
                        ry={2.5 + tears * 2}
                        opacity={tears}
                    ></ellipse>
                </svg>
            </div>
        </div>
        <p class="axis" id="pleasant">Pleasantness &rarr;</p>
    </div>
</div>

<style>
    #mood-meter {
        display: flex;
        height: 100%;
        width: 100%;
        padding: 1.2vw;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        container-type: inline-size;
        touch-action: none;
        cursor: pointer;
    }

    #chart {
        --width: min(26vw, calc(100cqw - 2vw));

        display: grid;
        grid-template-columns: auto var(--width);
        grid-template-rows: auto calc(var(--width) * 0.85) auto;
        gap: 0.5vw;
    }

    #header {
        display: flex;
        grid-column: 2;
        flex-direction: column;
        gap: 0.1vw;
        margin-bottom: 0.3vw;

        #word {
            font-size: calc(var(--width) * 0.06);
            font-weight: 700;
            transition-duration: 0.2s;
        }
    }

    .axis {
        opacity: 0.5;
        font-size: 0.7vw;
        font-weight: 600;
        text-align: center;
    }

    #energy {
        writing-mode: vertical-rl;
        rotate: 180deg;
    }

    #pleasant {
        grid-column: 2;
    }

    #grid {
        position: relative;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        grid-template-rows: repeat(6, 1fr);
        gap: 0.25vw;
    }

    .cell {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0.35vw;
        border: 1px solid transparent;
        transition-duration: 0.15s;

        > p {
            font-size: calc(var(--width) * 0.033);
            font-weight: 600;
            text-align: center;
            text-shadow: 0 0 0.3vw rgba(0, 0, 0, 0.5);
        }
    }

    .cell.active {
        border-color: rgba(255, 255, 255, 0.7);
        box-shadow: 0 0 0.6vw rgba(0, 0, 0, 0.4);
    }

    #face {
        position: absolute;
        height: 15%;
        aspect-ratio: 1;
        translate: -50% -50%;
        cursor: grab;
        transition: scale 0.15s;

        > svg {
            position: relative;
            display: block;
            height: 100%;
            width: 100%;
        }

        .features {
            fill: rgb(22, 22, 24);
            stroke: rgb(22, 22, 24);
            stroke-width: 2.5;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .lines,
        .features path:not(:first-of-type) {
            fill: none;
        }

        .blush {
            fill: rgb(255, 105, 97);
        }

        .tear {
            fill: rgb(100, 210, 255);
        }
    }

    #glow {
        position: absolute;
        inset: 0;
        border-radius: 50%;
    }

    #shadow {
        position: absolute;
        left: 18%;
        bottom: -12%;
        width: 80%;
        height: 26%;
        border-radius: 50%;
        background: radial-gradient(closest-side, rgba(0, 0, 0, 0.5), transparent);
    }

    #face.dragging {
        cursor: grabbing;
    }

    #face.shaking {
        animation: shake 0.12s linear infinite;
    }

    @keyframes shake {
        0%,
        100% {
            rotate: 0deg;
        }
        25% {
            rotate: calc(var(--shake) * -1);
        }
        75% {
            rotate: var(--shake);
        }
    }
</style>
