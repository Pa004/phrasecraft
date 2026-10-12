<script lang="ts">
interface Props {
	bits: number;
	extra?: string;
}

let { bits, extra = "" }: Props = $props();

let label = $derived(
	bits >= 70 ? "Fuerte" : bits >= 50 ? "Aceptable" : "Débil",
);
let pct = $derived(Math.max(4, Math.min(100, (bits / 90) * 100)));
</script>

<div
	class="meter"
	role="progressbar"
	aria-label={`Fuerza: ${label}, ${bits.toFixed(0)} bits`}
	aria-valuemin={0}
	aria-valuemax={90}
	aria-valuenow={Math.round(bits)}
>
	<span class="meter-label">Fuerza: {label}</span>
	<span class="meter-track"><span class="meter-fill" style={`width: ${pct}%`}></span></span>
	<span class="meter-bits">{bits.toFixed(0)} bits{extra ? ` · ${extra}` : ""}</span>
</div>

<style>
	.meter {
		border: 3px solid var(--edge);
		border-radius: 16px;
		background: var(--surface);
		padding: 16px 20px;
		display: flex;
		gap: 16px;
		align-items: center;
		flex-wrap: wrap;
		box-shadow: 4px 4px 0 var(--hard);
		font-weight: 700;
	}
	.meter-label {
		font-family: var(--font-display);
		font-size: 1.1rem;
	}
	.meter-track {
		flex: 1 1 180px;
		min-width: 140px;
		display: block;
		height: 20px;
		border: 3px solid var(--edge);
		border-radius: 999px;
		background: var(--paper);
		overflow: hidden;
	}
	.meter-fill {
		display: block;
		height: 100%;
		background: var(--edge);
		border-right: 3px solid var(--edge);
		transition: width 0.3s ease-out;
	}
	.meter-bits {
		font-size: 0.9rem;
		font-weight: 600;
	}
	@media (prefers-reduced-motion: reduce) {
		.meter-fill {
			transition: none;
		}
	}
</style>
