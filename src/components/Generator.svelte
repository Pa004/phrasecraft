<script lang="ts">
import { onMount } from "svelte";
import metaData from "../data/es/meta.json";
import {
	bitsCompat,
	bitsDistinct,
	minWordCount,
} from "../lib/password/entropy.js";
import { generate } from "../lib/password/generate.js";
import type {
	PasswordMode,
	PasswordResult,
	WordEntry,
} from "../lib/password/types.js";
import { LAYOUTS, type LayoutName } from "../lib/scene/layout.js";
import { buildStory } from "../lib/story/templates.js";
import { loadWords } from "../lib/words.js";
import AutoLock from "./AutoLock.svelte";
import Practice from "./Practice.svelte";
import Scene from "./Scene.svelte";
import SpriteProvider from "./SpriteProvider.svelte";
import StrengthMeter from "./StrengthMeter.svelte";
import WordChips from "./WordChips.svelte";

const listVersion: string = (metaData as { listVersion: string }).listVersion;
const COUNT = (metaData as { count: number }).count;

let list: WordEntry[] | null = $state(null);
let sprite: "loading" | "ready" | "error" = $state("loading");
let result: PasswordResult | null = $state(null);
let practicing = $state(false);
let runId = $state(0);
let story = $state("");
let layout: LayoutName = $state("arco");
let k = $state(minWordCount(COUNT, 70));
let compat = $state(false);
let shown = $state(false);
let notice = $state("");
let clearTimer: ReturnType<typeof setTimeout> | undefined;

let mode: PasswordMode = $derived(compat ? "compat" : "standard");
let liveBits = $derived(
	compat ? bitsCompat(COUNT, k, 2) : bitsDistinct(COUNT, k),
);
let strength = $derived(
	liveBits >= 70
		? "Pensada para contraseña maestra"
		: liveBits >= 50
			? "Aceptable solo si el sitio limita la longitud"
			: "Débil",
);
let masked = $derived(result ? "•".repeat(result.text.length) : "");
let ready = $derived(sprite === "ready" && list !== null);

onMount(() => {
	loadWords()
		.then((w) => {
			list = w;
			k = minWordCount(w.length, 70);
		})
		.catch(() => {
			notice = "No se pudo cargar la lista de palabras. Recarga la página.";
		});
	return () => {
		if (clearTimer) clearTimeout(clearTimer);
	};
});

function pickLayout(): LayoutName {
	return LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)]!;
}

function doGenerate(): void {
	if (!list) return;
	if (clearTimer) clearTimeout(clearTimer);
	const r = generate(list, k, mode, undefined, listVersion);
	result = r;
	practicing = false;
	story = buildStory(r.words);
	layout = pickLayout();
	shown = false;
	notice = "Escena generada. La anterior no se guarda en ningún sitio.";
}

function newStory(): void {
	if (!result) return;
	story = buildStory(result.words);
}

function lock(): void {
	if (clearTimer) clearTimeout(clearTimer);
	result = null;
	practicing = false;
	story = "";
	shown = false;
	notice = "Bloqueado por inactividad o al ocultar la página. Genera de nuevo.";
}

async function copy(): Promise<void> {
	if (!result) return;
	try {
		await navigator.clipboard.writeText(result.text);
		notice =
			"Copiada. Se borrará del portapapeles en 30 s (si tu navegador lo permite).";
		if (clearTimer) clearTimeout(clearTimer);
		const text = result.text;
		clearTimer = setTimeout(() => {
			navigator.clipboard
				.readText()
				.then((t) => {
					if (t === text) void navigator.clipboard.writeText("");
				})
				.catch(() => {});
		}, 30000);
	} catch {
		notice =
			"No se pudo copiar automáticamente: muestra la contraseña y cópiala a mano.";
		shown = true;
	}
}
</script>

<section aria-labelledby="gen-title">
	<h2 id="gen-title">Genera tu escena</h2>
	<SpriteProvider bind:status={sprite} />

	<div class="controls">
		<label>
			Palabras: {k}
			<input type="range" class="slider-3d" min="4" max="12" step="1" bind:value={k} disabled={!ready} />
		</label>
		<label class="switch">
			<input type="checkbox" class="switch-3d" bind:checked={compat} disabled={!ready} />
			Modo compatibilidad (mayúsculas, dígitos y símbolo)
		</label>
		<p
			title="Calculado asumiendo que quien ataca conoce el método y la lista de palabras."
		>
			Entropía: <strong>{liveBits.toFixed(1)} bits</strong> — {strength}
		</p>
		{#if compat && liveBits < 60}
			<p role="alert">Atención: por debajo de 60 bits. Úsalo solo si el sitio lo exige.</p>
		{/if}
	</div>
	<button type="button" class="primary btn-3d" disabled={!ready} onclick={doGenerate}>
		Generar mi escena
	</button>
	<p class="loadnote" aria-live="polite">{ready ? "" : "Cargando escena…"}</p>

	{#if result}
		<AutoLock active={true} onLock={lock} />
		<div aria-live="polite">
			<Scene words={result.words} {layout} />
			<p class="story">{story}</p>
			<div class="card card-3d">
				<p class="secret-label">TU CONTRASEÑA</p>
				<WordChips words={result.words} />
				<p class="secret-line">
					Tu contraseña: <code aria-label={shown ? "Contraseña generada" : "Contraseña oculta"}>{shown ? result.text : masked}</code>
					— {result.text.length} caracteres.
				</p>
				<div class="row">
					<button type="button" class="btn-3d" onclick={doGenerate}>Generar nueva escena</button>
					<button type="button" class="btn-3d-secondary" onclick={copy}>Copiar</button>
					<button type="button" class="btn-3d-secondary" onclick={newStory}>Otra historia</button>
					<button type="button" class="btn-3d-secondary" aria-pressed={shown} onclick={() => (shown = !shown)}>
						{shown ? "Ocultar" : "Mostrar"}
					</button>
				</div>
				<StrengthMeter bits={result.bits} extra={`${result.words.length} palabras · ${result.text.length} caracteres`} />
				<p class="warn">Esta escena <strong>es</strong> tu contraseña: no la captures ni la compartas.</p>
				{#if notice}<p>{notice}</p>{/if}
				{#if !practicing}
					<button type="button" class="primary btn-3d" onclick={() => ((practicing = true), (runId += 1))}>
						Practicar esta escena
					</button>
				{:else}
					{#key runId}
						<Practice words={result.words} password={result.text} {story} {layout} />
					{/key}
				{/if}
			</div>
		</div>
	{/if}
</section>

<style>
	.controls {
		display: grid;
		gap: 0.5rem;
		margin: 1rem 0;
	}
	.primary {
		font-size: 1.25rem;
		padding: 0.9rem 1.6rem;
	}
	.loadnote {
		min-height: 1.5em;
		margin: 0.25rem 0 0;
	}
	.story {
		font-size: 1.25rem;
		line-height: 1.7;
		max-width: 40rem;
	}
	.card {
		display: grid;
		gap: 0.75rem;
		margin-top: 1rem;
		padding: 1rem;
	}
	.card code {
		font-size: 1.1rem;
		overflow-wrap: anywhere;
	}
	.secret-label {
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		margin: 0;
	}
	.secret-line {
		line-height: 1.6;
		margin: 0;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.warn {
		border-left: 4px solid var(--accent);
		padding-left: 0.75rem;
	}
</style>
