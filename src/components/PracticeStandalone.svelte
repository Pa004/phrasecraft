<script lang="ts">
import metaData from "../data/es/meta.json";
import wordsData from "../data/es/words.json";
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
import Practice from "./Practice.svelte";
import SpriteProvider from "./SpriteProvider.svelte";

const list = wordsData as WordEntry[];
const listVersion: string = (metaData as { listVersion: string }).listVersion;

let sprite: "loading" | "ready" | "error" = $state("loading");
let result: PasswordResult | null = $state(null);
let story = $state("");
let layout: LayoutName = $state("arco");
let practicing = $state(false);
let runId = $state(0);
let k = $state(minWordCount(list.length, 70));
let compat = $state(false);

let mode: PasswordMode = $derived(compat ? "compat" : "standard");
let liveBits = $derived(
	compat ? bitsCompat(list.length, k, 2) : bitsDistinct(list.length, k),
);

function doGenerate(): void {
	const r = generate(list, k, mode, undefined, listVersion);
	result = r;
	story = buildStory(r.words);
	layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)]!;
	practicing = false;
}
</script>

<SpriteProvider bind:status={sprite} />

{#if sprite === "loading"}
	<button type="button" disabled>Cargando escena…</button>
{:else if sprite === "ready"}
	{#if !result}
		<div class="controls">
			<label>
				Palabras: {k}
				<input type="range" min="4" max="12" step="1" bind:value={k} />
			</label>
			<label>
				<input type="checkbox" bind:checked={compat} />
				Modo compatibilidad
			</label>
			<p>Entropía: <strong>{liveBits.toFixed(1)} bits</strong></p>
		</div>
		<button type="button" class="primary" onclick={doGenerate}>Generar para practicar</button>
	{:else if !practicing}
		<p>Escena lista con {result.words.length} palabras.</p>
		<button type="button" class="primary" onclick={() => ((practicing = true), (runId += 1))}>Practicar</button>
		<button type="button" onclick={doGenerate}>Generar otra</button>
	{:else}
		{#key runId}
			<Practice words={result.words} password={result.text} {story} {layout} />
		{/key}
	{/if}
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
</style>
