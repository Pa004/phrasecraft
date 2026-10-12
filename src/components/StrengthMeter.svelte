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
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.6rem;
		padding: 0.6rem 0.8rem;
		border-radius: 16px;
		border: 3px solid var(--edge);
		background: var(--surface);
		box-shadow: 3px 3px 0 var(--hard);
		font-weight: 700;
	}
	.meter-track {
		display: block;
		height: 14px;
		border-radius: 999px;
		border: 2px solid var(--edge);
		background: var(--surface-border);
		box-shadow: inset 0 2px 4px rgb(26 26 46 / 0.3);
		overflow: hidden;
	}
	.meter-fill {
		display: block;
		height: 100%;
		background: linear-gradient(180deg, var(--accent), var(--accent-dark));
		transition: width 0.3s ease-out;
	}
	@media (prefers-reduced-motion: reduce) {
		.meter-fill {
			transition: none;
		}
	}
</style>
