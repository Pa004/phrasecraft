<script lang="ts">
interface Props {
	bits: number;
}

let { bits }: Props = $props();

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
</div>

<style>
	.meter {
		border: 0;
		border-radius: 0;
		background: transparent;
		box-shadow: none;
		padding: 4px 2px;
		display: flex;
		gap: 12px;
		align-items: center;
		flex-wrap: wrap;
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
		height: 14px;
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
	@media (prefers-reduced-motion: reduce) {
		.meter-fill {
			transition: none;
		}
	}
</style>
