<script lang="ts">
import type { WordEntry } from "../lib/password/types.js";
import { type LayoutName, layoutPositions } from "../lib/scene/layout.js";

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

<svg
	viewBox={`0 0 ${W} ${H}`}
	role="img"
	aria-label={label}
	class="scene"
	aria-hidden="false"
>
	<rect class="sky" x="0" y="0" width={W} height={H} />
	<ellipse class="hill far" cx={W * 0.2} cy={H * 1.05} rx={W * 0.45} ry={H * 0.45} />
	<ellipse class="hill near" cx={W * 0.85} cy={H * 1.1} rx={W * 0.5} ry={H * 0.4} />
	{#each words as word, i (word.id)}
		{@const spot = spots[i]!}
		{@const cx = spot.x * W}
		{@const cy = spot.y * H}
		<g class="pop" style={`animation-delay: ${i * 250}ms`}>
			<g class="float" style={`animation-delay: ${(i * 670) % 4000}ms`}>
				<use href={`#${word.icon}`} x={cx - SIZE / 2} y={cy - SIZE / 2} width={SIZE} height={SIZE} />
				<circle class="badge" cx={cx + SIZE / 2 - 14} cy={cy - SIZE / 2 + 14} r="22" />
				<text class="badge-num" x={cx + SIZE / 2 - 14} y={cy - SIZE / 2 + 14} text-anchor="middle" dominant-baseline="central">{i + 1}</text>
			</g>
		</g>
	{/each}
</svg>

<style>
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
	}
	.hill.near {
		fill: #4a7c59;
	}
	@media (prefers-color-scheme: dark) {
		.hill.far {
			fill: #2d4a3e;
		}
		.hill.near {
			fill: #1d2f27;
		}
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
	}
	.badge-num {
		fill: #fff;
		font-size: 26px;
		font-weight: 700;
	}
	@media (prefers-reduced-motion: reduce) {
		.pop {
			animation: fade-in 0.3s ease forwards;
		}
		.float {
			animation: none;
		}
	}
	@keyframes fade-in {
		to {
			opacity: 1;
		}
	}
</style>
