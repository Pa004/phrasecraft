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
let toast = $state("");
let dialog: HTMLDialogElement | null = $state(null);
let clearTimer: ReturnType<typeof setTimeout> | undefined;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

let mode: PasswordMode = $derived(compat ? "compat" : "standard");
let liveBits = $derived(
	compat ? bitsCompat(COUNT, k, 2) : bitsDistinct(COUNT, k),
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
		if (toastTimer) clearTimeout(toastTimer);
	};
});

function showToast(msg: string): void {
	toast = msg;
	if (toastTimer) clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		toast = "";
	}, 4500);
}

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
	notice = "";
	showToast("Escena generada. La anterior no se guarda en ningún sitio.");
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
		showToast(
			"Copiada. Se borrará del portapapeles en 30 s (si tu navegador lo permite).",
		);
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
		showToast(
			"No se pudo copiar automáticamente: muestra la contraseña y cópiala a mano.",
		);
		shown = true;
	}
}
</script>

<section aria-labelledby="gen-title">
	<h2 id="gen-title">Genera tu escena</h2>
	<p class="gen-sub">Palabras al azar unidas en una escena que solo tú recuerdas.</p>
	<SpriteProvider bind:status={sprite} />
	<button type="button" class="primary btn-3d" disabled={!ready} onclick={openModal}>
		Generar mi escena
	</button>
	<p class="loadnote" aria-live="polite">{notice || (ready ? "" : "Cargando escena…")}</p>

	<dialog bind:this={dialog} class="gen-modal" aria-labelledby="gen-modal-title">
		<div class="modal-cabeza">
			<h2 id="gen-modal-title">Tu escena</h2>
			<button type="button" class="cierre" aria-label="Cerrar" onclick={() => dialog?.close()}>X</button>
		</div>
		{#if !result}
			<p class="loadnote" aria-live="polite">Cargando escena…</p>
		{/if}

	{#if result}
		<AutoLock active={true} onLock={lock} />
		<div aria-live="polite">
			<Scene words={result.words} {layout} />
			<p class="story">{story}</p>
			<div class="card card-3d">
				<div class="frase-caja">
					<p class="secret-label">TU CONTRASEÑA</p>
					<div class="secret-veil" class:masked={!shown}>
						<WordChips words={result.words} />
					</div>
					<p class="caption">{result.words.length} palabras · {result.text.length} caracteres</p>
					<p class="sr-only">
						Tu contraseña: <code aria-label={shown ? "Contraseña generada" : "Contraseña oculta"}>{shown ? result.text : masked}</code>
					</p>
				</div>
				<div class="row acciones">
					<button type="button" class="btn-3d" onclick={copy}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="4" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
						Copiar
					</button>
					<button type="button" class="btn-3d-secondary" aria-pressed={shown} onclick={() => (shown = !shown)}>
						{shown ? "Ocultar" : "Mostrar"}
					</button>
					<button type="button" class="btn-3d-secondary" onclick={newStory}>Otra historia</button>
					<button type="button" class="btn-3d-secondary" onclick={doGenerate}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>
						Generar nueva escena
					</button>
				</div>
				<StrengthMeter bits={result.bits} />
				<p class="warn">Esta escena <strong>es</strong> tu contraseña: no la captures ni la compartas.</p>
				<details class="ajustes">
					<summary>Ajustar: {k} palabras{compat ? " · con mayúsculas y símbolos" : ""}</summary>
					<div class="controls">
						<fieldset>
							<legend>Número de palabras</legend>
							<div class="deslizador">
								<input type="range" id="gen-k" min="4" max="12" step="1" bind:value={k} disabled={!ready} aria-label="Número de palabras" aria-describedby="gen-k-ayuda" />
								<output for="gen-k">{k}</output>
							</div>
							<p class="ayuda" id="gen-k-ayuda">Más palabras, más cuesta adivinarla.</p>
						</fieldset>
						<label class="interruptor">
							<input type="checkbox" bind:checked={compat} disabled={!ready} />
							<span><b>Mayúsculas y símbolos</b><small>Solo si el sitio los exige</small></span>
						</label>
						{#if compat && liveBits < 60}
							<p role="alert">Atención: corta para ser maestra. Úsala solo si el sitio lo exige.</p>
						{/if}
					</div>
					<p class="ayuda">Con estos ajustes, genera una escena nueva.</p>
				</details>
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
		<div class="toast-live" aria-live="polite">{#if toast}<p class="toast">{toast}</p>{/if}</div>
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
	.gen-sub {
		margin: 0.25rem 0 0.5rem;
		font-size: 0.98rem;
		opacity: 0.85;
	}
	.story {
		font-size: 1.15rem;
		line-height: 1.6;
		width: 100%;
		margin: 0.5rem 0 0;
	}
	.gen-modal {
		background: var(--surface);
		color: var(--ink);
		border: 5px solid var(--edge);
		border-radius: 16px;
		box-shadow: 12px 12px 0 var(--hard);
		padding: 16px;
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
		margin-bottom: 0.5rem;
	}
	.gen-modal .btn-3d,
	.gen-modal .btn-3d-secondary {
		min-height: 48px;
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
		gap: 0.5rem;
		margin-top: 0.75rem;
		padding: 0.75rem;
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
		margin: 0 0 8px;
	}
	.caption {
		margin: 8px 0 0;
		font-size: 0.9rem;
		opacity: 0.8;
	}
	.secret-veil :global(.wchips) {
		transition: filter 0.2s ease-out;
	}
	.secret-veil.masked :global(.wchips) {
		filter: blur(9px);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.ajustes {
		border: 0;
		border-top: 3px solid var(--edge);
		border-radius: 0;
		padding: 8px 2px 0;
		background: none;
	}
	.ajustes summary {
		cursor: pointer;
		font-family: var(--font-display);
		font-weight: 800;
		min-height: 44px;
		display: flex;
		align-items: center;
	}
	.ajustes .controls {
		margin: 0.5rem 0 0.75rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.secret-veil :global(.wchips) {
			transition: none;
		}
	}
	.frase-caja {
		border: 0;
		border-radius: 0;
		background: none;
		padding: 4px 2px;
		box-shadow: none;
	}
	.row.acciones {
		display: grid;
		grid-template-columns: 1fr;
		gap: 8px;
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
	.toast-live:empty {
		display: none;
	}
	.toast {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 70;
		margin: 0;
		background: var(--edge);
		color: var(--paper);
		border: 3px solid var(--edge);
		border-radius: 999px;
		box-shadow: 4px 4px 0 rgb(0 0 0 / 0.35);
		padding: 10px 20px;
		font-weight: 700;
		font-size: 0.95rem;
		max-width: min(92vw, 32rem);
		text-align: center;
		animation: toast-in 0.25s ease-out;
	}
	@keyframes toast-in {
		from {
			transform: translate(-50%, 8px);
			opacity: 0;
		}
		to {
			transform: translate(-50%, 0);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
