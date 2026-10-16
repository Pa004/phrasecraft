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
let dialog: HTMLDialogElement | null = $state(null);
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
let strengthPlain = $derived(
	liveBits >= 70 ? "muy alta" : liveBits >= 50 ? "media" : "baja",
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

function openModal(): void {
	if (!ready || !dialog) return;
	if (!result) doGenerate();
	dialog.showModal();
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
	notice = "Bloqueado por inactividad o al ocultar la pǭgina. Genera de nuevo.";
	if (dialog?.open) dialog.close();
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
	<button type="button" class="primary btn-3d" disabled={!ready} onclick={openModal}>
		Generar mi escena
	</button>
	<p class="loadnote" aria-live="polite">{ready ? "" : "Cargando escena…"}</p>

	<dialog bind:this={dialog} class="gen-modal" aria-labelledby="gen-modal-title">
		<div class="modal-cabeza">
			<h2 id="gen-modal-title">Tu escena</h2>
			<button type="button" class="cierre" aria-label="Cerrar" onclick={() => dialog?.close()}>X</button>
		</div>
	<div class="controls">
		<fieldset>
			<legend>Número de palabras</legend>
			<div class="deslizador">
				<input type="range" id="gen-k" min="4" max="12" step="1" bind:value={k} disabled={!ready} aria-label="Número de palabras" aria-describedby="gen-k-ayuda" />
				<output for="gen-k">{k}</output>
			</div>
			<p class="ayuda" id="gen-k-ayuda">8 por defecto ≈ 72 bits. Más palabras, más fuerza.</p>
		</fieldset>
		<label class="interruptor">
			<input type="checkbox" bind:checked={compat} disabled={!ready} />
			<span><b>Modo compatibilidad</b><small>Mayúsculas, dígitos y símbolo para sitios exigentes</small></span>
		</label>
		<div class="fuerza">
			Fuerza: <strong>{strengthPlain}</strong>
			<span class="bits-detalle">({liveBits.toFixed(1)} bits de entropía)</span>
			<details class="bits-que">
				<summary>¿Qué significa?</summary>
				<p>
					Los bits miden cuántas combinaciones tendría que probar un atacante que ya conoce
					este método y la lista de palabras. Con {liveBits.toFixed(0)} bits hay unas
					2<sup>{Math.round(liveBits)}</sup> posibilidades: más bits, más intentos necesarios.
					70 o más es lo recomendado para una contraseña maestra.
				</p>
			</details>
		</div>
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
				<div class="frase-caja">
					<p class="secret-label">TU CONTRASEÑA</p>
					<WordChips words={result.words} />
					<p class="secret-line">
						Tu contraseña: <code aria-label={shown ? "Contraseña generada" : "Contraseña oculta"}>{shown ? result.text : masked}</code>
						— {result.text.length} caracteres.
					</p>
				</div>
				<div class="row acciones">
					<button type="button" class="btn-3d" onclick={doGenerate}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>
						Generar nueva escena
					</button>
					<button type="button" class="btn-3d-secondary" onclick={copy}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="4" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
						Copiar
					</button>
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
	</dialog>
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
		width: 100%;
	}
	.gen-modal {
		background: var(--surface);
		color: var(--ink);
		border: 5px solid var(--edge);
		border-radius: 16px;
		box-shadow: 12px 12px 0 var(--hard);
		padding: 24px;
		width: min(960px, 94vw);
		max-height: min(90vh, 90dvh);
		overflow-y: auto;
	}
	.gen-modal::backdrop {
		background: var(--edge);
		opacity: 0.55;
	}
	.gen-modal[open] {
		animation: modal-in 0.25s ease-out;
	}
	.modal-cabeza {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 0.75rem;
	}
	.modal-cabeza h2 {
		margin: 0;
		font-size: 1.45rem;
	}
	.cierre {
		appearance: none;
		width: 44px;
		height: 44px;
		flex: none;
		display: grid;
		place-items: center;
		border: 3px solid var(--edge);
		border-radius: 12px;
		background: var(--surface);
		color: var(--ink);
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.1rem;
		cursor: pointer;
		box-shadow: 3px 3px 0 var(--hard);
	}
	.cierre:hover {
		background: var(--surface-2);
	}
	.cierre:focus-visible {
		outline: 4px solid var(--accent-dark);
		outline-offset: 2px;
	}
	@keyframes modal-in {
		from {
			transform: translateY(12px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.gen-modal[open] {
			animation: none;
		}
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
		font-size: 0.76rem;
		font-weight: 800;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		opacity: 0.75;
		margin: 0 0 12px;
	}
	.secret-line {
		line-height: 1.6;
		margin: 12px 0 0;
	}
	.secret-line strong {
		color: var(--ink);
	}
	.frase-caja {
		border: 3px solid var(--edge);
		border-radius: 16px;
		background: var(--paper);
		padding: 20px;
		box-shadow: inset 3px 3px 0 var(--surface-border);
	}
	.row.acciones {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}
	.row.acciones .btn-3d {
		grid-column: 1 / -1;
	}
	@media (min-width: 720px) {
		.row.acciones {
			grid-template-columns: 1.4fr 1fr 1fr 1fr;
		}
		.row.acciones .btn-3d {
			grid-column: auto;
		}
	}
	.warn {
		border-left: 4px solid var(--accent);
		padding-left: 0.75rem;
	}
</style>
