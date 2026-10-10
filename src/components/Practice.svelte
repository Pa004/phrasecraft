<script lang="ts">
import { onMount } from "svelte";
import { buildReminderICS } from "../lib/ics.js";
import type { WordEntry } from "../lib/password/types.js";
import { checkPassword, checkWord } from "../lib/practice/compare.js";
import {
	STAGE_NAMES,
	type Stage,
	nextStage,
	pickHidden,
	shuffled,
} from "../lib/practice/stages.js";
import type { LayoutName } from "../lib/scene/layout.js";
import {
	loadProgress,
	reviewSchedule,
	saveProgress,
} from "../lib/schedule/reminders.js";
import Scene from "./Scene.svelte";

interface Props {
	words: WordEntry[];
	password: string;
	story: string;
	layout: LayoutName;
}

let { words, password, story, layout }: Props = $props();

let stage: Stage = $state(1);
let attempts = $state(0);
let hints = $state(0);
let feedback = $state("");
let showPhrase = $state(false);
let showFirst = $state(false);
let countdown = $state(20);
let done = $state(false);

let hidden: [number, number] = $state(pickHidden(words.length));
let order: WordEntry[] = $state(shuffled(words));
let inputs2 = $state(["", ""]);
let inputs4 = $state(words.map(() => ""));
let input5 = $state("");

const inputAttrs = {
	spellcheck: false as const,
	autocomplete: "off",
	autocorrect: "off",
	autocapitalize: "off",
};

function advance(): void {
	feedback = "";
	showPhrase = false;
	showFirst = false;
	inputs2 = ["", ""];
	inputs4 = words.map(() => "");
	input5 = "";
	order = shuffled(words);
	hidden = pickHidden(words.length);
	countdown = 20;
	stage = nextStage(stage as Exclude<Stage, "done">);
	if (stage === "done") {
		done = true;
		try {
			saveProgress(5, reviewSchedule(new Date())[1]!);
		} catch {
			/* almacenamiento no disponible: la práctica sigue en memoria */
		}
	}
}

function fail(msg: string): void {
	attempts += 1;
	feedback = msg;
}

function check2(): void {
	const [a, b] = hidden;
	if (
		checkWord(inputs2[0] ?? "", words[a]!.ascii) &&
		checkWord(inputs2[1] ?? "", words[b]!.ascii)
	) {
		advance();
	} else {
		fail("Todavía no. Mira la escena e inténtalo de nuevo.");
	}
}

function move(i: number, dir: -1 | 1): void {
	const j = i + dir;
	if (j < 0 || j >= order.length) return;
	const next = [...order];
	[next[i], next[j]] = [next[j]!, next[i]!];
	order = next;
}

function check3(): void {
	if (order.map((w) => w.id).join("|") === words.map((w) => w.id).join("|")) {
		advance();
	} else {
		fail("Ese no es el orden. Fíjate en los números de la escena.");
	}
}

function check4(): void {
	const ok = words.every((w, i) => checkWord(inputs4[i] ?? "", w.ascii));
	if (ok) advance();
	else fail("Alguna palabra falla. Puedes ver la frase como pista.");
}

function check5(): void {
	if (checkPassword(input5, password)) advance();
	else fail("No coincide exactamente. Cuida mayúsculas, guiones y símbolos.");
}

function downloadICS(): void {
	const ics = buildReminderICS({ date: reviewSchedule(new Date())[1]! });
	const url = URL.createObjectURL(new Blob([ics], { text: "text/calendar" }));
	const a = document.createElement("a");
	a.href = url;
	a.download = "repasa-tu-escena.ics";
	a.click();
	URL.revokeObjectURL(url);
}

async function enableReminders(): Promise<void> {
	try {
		const perm = await Notification.requestPermission();
		if (perm !== "granted") {
			feedback =
				"Sin permiso de notificaciones: usa el archivo .ics, funciona igual.";
			return;
		}
		saveProgress(5, reviewSchedule(new Date())[1]!);
		try {
			const nav = navigator as Navigator & {
				setAppBadge?: (n: number) => Promise<void>;
			};
			await nav.setAppBadge?.(1);
		} catch {
			/* badge no soportado */
		}
		feedback =
			"Avisos activados en este dispositivo. Solo guardamos la fecha, nunca tus palabras.";
	} catch {
		feedback = "Este navegador no permite avisos: usa el archivo .ics.";
	}
}

$effect(() => {
	if (stage !== 1 || done) return;
	if (countdown <= 0) return;
	const t = setTimeout(() => {
		countdown -= 1;
	}, 1000);
	return () => clearTimeout(t);
});

onMount(() => {
	try {
		const prev = loadProgress();
		if (prev) feedback = "";
	} catch {
		/* sin almacenamiento: práctica solo en memoria */
	}
});

let schedule = $derived(reviewSchedule(new Date()));
</script>

<section aria-labelledby="practice-title">
	<h2 id="practice-title">Practica tu escena</h2>

	{#if !done}
		<p>Etapa {stage} de 5 · {STAGE_NAMES[stage as Exclude<Stage, "done">]}</p>
		<div class="hint-row">
			<button type="button" onclick={() => ((hints += 1), (showPhrase = !showPhrase))}>
				{showPhrase ? "Ocultar frase" : "Ver frase (pista)"}
			</button>
			<button type="button" onclick={() => ((hints += 1), (showFirst = true))}>Primera letra (pista)</button>
			<span>Pistas usadas: {hints} · Intentos: {attempts}</span>
		</div>
		{#if showPhrase}<p>{story}</p>{/if}

		{#if stage === 1}
			<Scene {words} {layout} />
			<p>Observa la escena con calma: {countdown} s (puedes saltar).</p>
			<button type="button" class="primary" onclick={advance}>Listo</button>
		{:else if stage === 2}
			<div class="grid">
				{#each words as word, i (word.id)}
					<div class="tile">
						{#if hidden[0] === i || hidden[1] === i}
							<span class="q" aria-hidden="true">?</span>
							<span class="num">{i + 1}</span>
						{:else}
							<svg viewBox="0 0 110 110" aria-label={word.es}><use href={`#${word.icon}`} width="110" height="110" /></svg>
							<span class="num">{i + 1}</span>
						{/if}
					</div>
				{/each}
			</div>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					check2();
				}}
			>
				<label
					>Palabra {hidden[0]! + 1}
					<input name="pc-w-a" bind:value={inputs2[0]} placeholder={showFirst ? words[hidden[0]]!.es[0] : ""} {...inputAttrs} />
				</label>
				<label
					>Palabra {hidden[1]! + 1}
					<input name="pc-w-b" bind:value={inputs2[1]} placeholder={showFirst ? words[hidden[1]]!.es[0] : ""} {...inputAttrs} />
				</label>
				<button type="submit">Comprobar</button>
			</form>
		{:else if stage === 3}
			<ol>
				{#each order as word, i (word.id)}
					<li data-testid="order-item" data-word={word.es}>
						<svg viewBox="0 0 110 110" aria-label={word.es}><use href={`#${word.icon}`} width="110" height="110" /></svg>
						<button type="button" aria-label={`Subir ${word.es}`} disabled={i === 0} onclick={() => move(i, -1)}>Subir</button>
						<button type="button" aria-label={`Bajar ${word.es}`} disabled={i === order.length - 1} onclick={() => move(i, 1)}>Bajar</button>
					</li>
				{/each}
			</ol>
			<button type="button" onclick={check3}>Comprobar orden</button>
		{:else if stage === 4}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					check4();
				}}
			>
				{#each words as word, i (word.id)}
					<label
						>Palabra {i + 1}
						<input name={`pc-r-${i}`} bind:value={inputs4[i]} placeholder={showFirst ? word.es[0] : ""} {...inputAttrs} />
					</label>
				{/each}
				<button type="submit">Comprobar</button>
			</form>
		{:else if stage === 5}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					check5();
				}}
			>
				<label
					>Contraseña completa, tal como se genera
					<input name="pc-final" bind:value={input5} {...inputAttrs} />
				</label>
				<button type="submit">Comprobar</button>
			</form>
		{/if}
		<p aria-live="polite">{feedback}</p>
	{:else}
		<h3>¡Completado!</h3>
		<p>Intentos totales: {attempts} · Pistas: {hints}</p>
		<p>Calendario sugerido de repaso (heurística general, sin promesas):</p>
		<ul>
			{#each schedule as d}
				<li>{d.toLocaleString("es")}</li>
			{/each}
		</ul>
		<div class="row">
			<button type="button" onclick={downloadICS}>Descargar recordatorio .ics</button>
			<button type="button" onclick={enableReminders}>Activar avisos en este dispositivo</button>
		</div>
		<p aria-live="polite">{feedback}</p>
	{/if}
</section>

<style>
	.hint-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 1rem;
	}
	.primary {
		font-size: 1.1rem;
		padding: 0.8rem 1.4rem;
		min-height: 44px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
		gap: 0.5rem;
		margin-bottom: 1rem;
	}
	.tile {
		position: relative;
		aspect-ratio: 1;
		border: 1px solid currentColor;
		border-radius: 0.5rem;
		display: grid;
		place-items: center;
	}
	.tile svg {
		width: 80%;
		height: 80%;
	}
	.q {
		font-size: 2rem;
		font-weight: 700;
	}
	.num {
		position: absolute;
		top: 2px;
		right: 6px;
		font-weight: 700;
	}
	form {
		display: grid;
		gap: 0.5rem;
		max-width: 28rem;
	}
	label {
		display: grid;
		gap: 0.25rem;
	}
	input {
		min-height: 44px;
		font-size: 1rem;
	}
	button {
		min-height: 44px;
		justify-self: start;
	}
	ol {
		display: grid;
		gap: 0.5rem;
		padding: 0;
		list-style: none;
	}
	ol li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	ol svg {
		width: 64px;
		height: 64px;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
