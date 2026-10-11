<script lang="ts">
import { onMount } from "svelte";
import metaData from "../data/es/meta.json";
import { buildReminderICS } from "../lib/ics.js";
import { minWordCount } from "../lib/password/entropy.js";
import { generate } from "../lib/password/generate.js";
import type {
	PasswordMode,
	PasswordResult,
	WordEntry,
} from "../lib/password/types.js";
import { LAYOUTS, type LayoutName } from "../lib/scene/layout.js";
import { buildStory } from "../lib/story/templates.js";
import {
	type StudyRecord,
	buildStudyExport,
	clearStudy,
	loadStudy,
	saveStudy,
} from "../lib/study/export.js";
import { randomSaltHex, sha256Hex } from "../lib/study/hash.js";
import { loadWords } from "../lib/words.js";
import Practice from "./Practice.svelte";
import SpriteProvider from "./SpriteProvider.svelte";

const listVersion: string = (metaData as { listVersion: string }).listVersion;
const MODE: PasswordMode = "standard";

let list: WordEntry[] | null = $state(null);
let kWords = $state(8);
let sprite: "loading" | "ready" | "error" = $state("loading");
let consent = $state(false);
let result: PasswordResult | null = $state(null);
let story = $state("");
let layout: LayoutName = $state("arco");
let runId = $state(0);
let testing = $state(false);
let recall = $state("");
let attempts = $state(0);
let feedback = $state("");
let record: StudyRecord | null = $state(null);

const inputAttrs = {
	spellcheck: false as const,
	autocomplete: "off",
	autocorrect: "off",
	autocapitalize: "off",
};

async function doGenerate(): Promise<void> {
	if (!list) return;
	const r = generate(list, kWords, MODE, undefined, listVersion);
	const salt = randomSaltHex();
	const hash = await sha256Hex(salt, r.text);
	record = {
		salt,
		hash,
		createdAtISO: new Date().toISOString(),
		listVersion,
		k: kWords,
		checks: [],
	};
	try {
		saveStudy(record);
	} catch {
		feedback = "Sin almacenamiento: el estudio solo vivirá en esta pestaña.";
	}
	result = r;
	story = buildStory(r.words);
	layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)]!;
	testing = false;
	recall = "";
	attempts = 0;
	runId += 1;
}

async function checkRecall(): Promise<void> {
	if (!record || !result) return;
	attempts += 1;
	const h = await sha256Hex(record.salt, recall);
	if (h === record.hash) {
		const afterHours =
			Math.round(((Date.now() - Date.parse(record.createdAtISO)) / 36e5) * 10) /
			10;
		record.checks.push({ afterHours, ok: true, attempts });
		try {
			saveStudy(record);
		} catch {
			/* solo memoria */
		}
		feedback = `Correcto en ${attempts} intento(s). Quedó registrado.`;
		attempts = 0;
	} else {
		feedback = "No coincide. Inténtalo de nuevo.";
	}
}

async function copyExport(): Promise<void> {
	if (!record) return;
	try {
		await navigator.clipboard.writeText(buildStudyExport(record));
		feedback =
			"Resultado copiado. No contiene datos personales ni contraseñas.";
	} catch {
		feedback = "Copia el JSON de abajo a mano.";
	}
}

function downloadICS(): void {
	const ics = buildReminderICS({
		date: new Date(Date.now() + 24 * 3600 * 1000),
	});
	const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
	const a = document.createElement("a");
	a.href = url;
	a.download = "repasa-desechable.ics";
	a.click();
	URL.revokeObjectURL(url);
}

function wipe(): void {
	try {
		clearStudy();
	} catch {
		/* nada que borrar */
	}
	record = null;
	result = null;
	feedback = "Huella borrada de este dispositivo.";
}

onMount(() => {
	loadWords()
		.then((w) => {
			list = w;
			kWords = minWordCount(w.length, 70);
		})
		.catch(() => {
			feedback = "No se pudo cargar la lista de palabras. Recarga la página.";
		});
});
</script>

<SpriteProvider bind:status={sprite} />

{#if !result}
	<h2>Consentimiento</h2>
	<ul>
		<li>Participación voluntaria, sin datos personales.</li>
		<li>Usa la contraseña <strong>desechable</strong> generada aquí. Nunca tu contraseña real.</li>
		<li>No la escribas en papel ni la fotografíes.</li>
	</ul>
	<label>
		<input type="checkbox" bind:checked={consent} />
		Lo entiendo y quiero participar
	</label>
	<button type="button" disabled={!consent || sprite !== "ready" || !list} onclick={doGenerate}>
		Generar desechable
	</button>
{:else}
	<p role="alert"><strong>Desechable de estudio.</strong> No la uses como contraseña real.</p>
	<p>Tu contraseña desechable: <code data-testid="disposable">{result.text}</code></p>
	{#key runId}
		<Practice words={result.words} password={result.text} {story} {layout} />
	{/key}
	<section aria-labelledby="recall-title">
		<h2 id="recall-title">Prueba de recuerdo</h2>
		{#if !testing}
			<button type="button" onclick={() => (testing = true)}>Probar recuerdo</button>
		{:else}
			<form
				onsubmit={(e) => {
					e.preventDefault();
					void checkRecall();
				}}
			>
				<label>
					Escribe la desechable
					<input name="st-recall" bind:value={recall} {...inputAttrs} />
				</label>
				<button type="submit">Comprobar recuerdo</button>
			</form>
		{/if}
		<p aria-live="polite">{feedback}</p>
	</section>
	{#if record && record.checks.length > 0}
		<section aria-labelledby="export-title">
			<h2 id="export-title">Resultado para enviar</h2>
			<pre data-testid="study-export">{buildStudyExport(record)}</pre>
			<div class="row">
				<button type="button" onclick={copyExport}>Copiar resultado</button>
				<button type="button" onclick={downloadICS}>Descargar .ics</button>
				<button type="button" onclick={wipe}>Borrar huella</button>
			</div>
		</section>
	{/if}
{/if}

<style>
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	button {
		min-height: 44px;
	}
	code {
		overflow-wrap: anywhere;
	}
	pre {
		white-space: pre-wrap;
	}
</style>
