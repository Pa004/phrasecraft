<script lang="ts">
import type { WordEntry } from "../lib/password/types.js";
import { type LayoutName, layoutPositions } from "../lib/scene/layout.js";
import { tilt } from "../lib/ui/tilt.js";

interface Props {
	words: WordEntry[];
	layout: LayoutName;
}

let { words, layout }: Props = $props();

const W = 1200;
const H = 675;
const SIZE = 110;

let spots = $derived(layoutPositions(words.length, layout));
let label = $derived(
	`Escena con ${words.length} imágenes en orden: ${words.map((w) => w.es).join(", ")}`,
);
</script>

<div class="tilt-stage" use:tilt={{ max: 7 }} data-testid="scene-tilt">
	<svg
		viewBox={`0 0 ${W} ${H}`}
		role="img"
		aria-label={label}
		class="scene scene-plane"
		aria-hidden="false"
	>
		<rect class="sky" x="0" y="0" width={W} height={H} />
		<ellipse class="hill far" cx={W * 0.2} cy={H * 1.05} rx={W * 0.45} ry={H * 0.45} />
		<ellipse class="hill near" cx={W * 0.85} cy={H * 1.1} rx={W * 0.5} ry={H * 0.4} />
		{#each words as word, i (word.id)}
			{@const spot = spots[i]!}
			{@const cx = spot.x * W}
			{@const cy = spot.y * H}
			{@const depth = Math.round(spot.z * 70)}
			{@const shadowRx = Math.round(SIZE * 0.5 * (0.75 + 0.5 * spot.z))}
			<ellipse
				class="ground-shadow"
				cx={cx}
				cy={cy + SIZE / 2 + 10}
				rx={shadowRx}
				ry="14"
				opacity={(0.16 + 0.14 * spot.z).toFixed(2)}
			/>
			<g class="depth" style={`--lift: ${depth}px`}>
				<g class="pop" style={`animation-delay: ${i * 250}ms`}>
					<g class="float" style={`animation-delay: ${(i * 670) % 4000}ms`}>
						<use href={`#${word.icon}`} x={cx - SIZE / 2} y={cy - SIZE / 2} width={SIZE} height={SIZE} />
						<circle class="badge" cx={cx + SIZE / 2 - 14} cy={cy - SIZE / 2 + 14} r="22" />
						<text class="badge-num" x={cx + SIZE / 2 - 14} y={cy - SIZE / 2 + 14} text-anchor="middle" dominant-baseline="central">{i + 1}</text>
					</g>
				</g>
			</g>
		{/each}
	</svg>
</div>

<style>
	.tilt-stage {
		perspective: 1200px;
	}
	.tilt-stage > svg {
		transition: transform 0.25s ease-out;
		transform-style: preserve-3d;
	}
	.scene {
		width: 100%;
		height: auto;
		display: block;
		border-radius: 1rem;
	}
	.sky {
		fill: var(--paper);
	}
	.hill {
		opacity: 0.35;
	}
	.hill.far {
		fill: #7fb069;
		transform: translateZ(-70px);
	}
	.hill.near {
		fill: #4a7c59;
		transform: translateZ(-30px);
	}
	.ground-shadow {
		fill: #000;
	}
	.depth {
		transform: translateZ(var(--lift, 0px));
	}
	.pop {
		opacity: 0;
		transform-box: fill-box;
		transform-origin: center;
		animation: pop-in 0.5s ease forwards;
	}
	.float {
		transform-box: fill-box;
		transform-origin: center;
		animation: float 4s ease-in-out infinite;
	}
	@keyframes pop-in {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-7px);
		}
	}
	.badge {
		fill: var(--accent);
		transform: translateZ(50px);
	}
	.badge-num {
		fill: #fff;
		font-size: 26px;
		font-weight: 700;
		transform: translateZ(50px);
	}
	@media (prefers-reduced-motion: reduce) {
		.pop {
			animation: fade-in 0.3s ease forwards;
		}
		.float {
			animation: none;
		}
		.tilt-stage > svg {
			transition: none;
		}
	}
	@keyframes fade-in {
		to {
			opacity: 1;
		}
	}
</style>
