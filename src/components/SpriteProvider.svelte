<script lang="ts">
import { onMount } from "svelte";

interface Props {
	status?: "loading" | "ready" | "error";
}

let { status = $bindable("loading") }: Props = $props();
let markup = $state("");

async function load(): Promise<void> {
	status = "loading";
	try {
		const res = await fetch("/icons/es.sprite.svg", { cache: "force-cache" });
		if (!res.ok) throw new Error("sprite no disponible");
		// Inyección única en DOM: los <use href="#id"> no generan
		// peticiones al generar. Sanitizado en build-sprite.mjs.
		markup = await res.text();
		status = "ready";
	} catch {
		status = "error";
	}
}

onMount(() => {
	void load();
});
</script>

{#if status === "ready"}
	<svg
		width="0"
		height="0"
		aria-hidden="true"
		focusable="false"
		class="sprite-store"
	>
		<defs>{@html markup}</defs>
	</svg>
{:else if status === "error"}
	<p role="alert">No se pudo cargar la escena. Revisa tu conexión y reintenta.</p>
	<button type="button" onclick={load}>Reintentar</button>
{/if}
