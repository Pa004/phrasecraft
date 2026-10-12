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
import SpriteProvider from "./SpriteProvider.svelte";

const listVersion: string = (metaData as { listVersion: string }).listVersion;
const COUNT = (metaData as { count: number }).count;

let list: WordEntry[] | null = $state(null);
let sprite: "loading" | "ready" | "error" = $state("loading");
let result: PasswordResult | null = $state(null);
let story = $state("");
let layout: LayoutName = $state("arco");
let practicing = $state(false);
let runId = $state(0);
let k = $state(minWordCount(COUNT, 70));
let compat = $state(false);

let mode: PasswordMode = $derived(compat ? "compat" : "standard");
let ready = $derived(sprite === "ready" && list !== null);
let liveBits = $derived(
	compat ? bitsCompat(COUNT, k, 2) : bitsDistinct(COUNT, k),
);

onMount(() => {
	loadWords()
		.then((w) => {
			list = w;
			k = minWordCount(w.length, 70);
		})
		.catch(() => {});
});

function doGenerate(): void {
	if (!list) return;
	const r = generate(list, k, mode, undefined, listVersion);
	result = r;
	story = buildStory(r.words);
	layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)]!;
	practicing = false;
}

function lock(): void {
	result = null;
	practicing = false;
	story = "";
}
</script>

<SpriteProvider bind:status={sprite} />

{#if !result}
	<div class="controls">
		<fieldset>
			<legend>Número de palabras</legend>
			<div class="deslizador">
				<input type="range" id="pract-k" min="4" max="12" step="1" bind:value={k} disabled={!ready} aria-label="Número de palabras" />
				<output for="pract-k">{k}</output>
			</div>
		</fieldset>
		<label class="interruptor">
			<input type="checkbox" bind:checked={compat} disabled={!ready} />
			<span><b>Modo compatibilidad</b><small>Mayúsculas, dígitos y símbolo</small></span>
		</label>
		<p>Entropía: <strong>{liveBits.toFixed(1)} bits</strong></p>
	</div>
	<button type="button" class="primary btn-3d" disabled={!ready} onclick={doGenerate}>
		Generar para practicar
	</button>
	<p class="loadnote" aria-live="polite">{ready ? "" : "Cargando escena…"}</p>
{:else if !practicing}
		<p>Escena lista con {result.words.length} palabras.</p>
		<button type="button" class="primary btn-3d" onclick={() => ((practicing = true), (runId += 1))}>Practicar</button>
		<button type="button" class="btn-3d-secondary" onclick={doGenerate}>Generar otra</button>
	{:else}
		<AutoLock active={true} onLock={lock} />
		{#key runId}
			<Practice words={result.words} password={result.text} {story} {layout} />
		{/key}
	{/if}

<style>
	.controls {
		display: grid;
		gap: 0.5rem;
		margin: 1rem 0;
	}
	.primary {
		font-size: 1.1rem;
		padding: 0.8rem 1.4rem;
		min-height: 44px;
	}
	.loadnote {
		min-height: 1.5em;
		margin: 0.25rem 0 0;
	}
</style>
