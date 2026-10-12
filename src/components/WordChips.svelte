<script lang="ts">
import type { WordEntry } from "../lib/password/types.js";

interface Props {
	words: WordEntry[];
}

let { words }: Props = $props();
</script>

<ul class="chips" aria-hidden="true">
	{#each words as word, i (word.id)}
		<li class="chip"><span class="chip-n">{i + 1}</span>{word.es}</li>
	{/each}
</ul>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		padding: 0;
		margin: 0.75rem 0;
		list-style: none;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 1.1rem;
		line-height: 1.25;
		border: 3px solid var(--edge);
		border-radius: 16px;
		padding: 4px 14px;
		box-shadow: 2px 2px 0 var(--hard);
		color: var(--ink);
		background: var(--surface);
	}
	.chip:nth-child(4n + 1) {
		background: var(--accent);
		color: var(--btn-ink);
	}
	.chip:nth-child(4n + 3) {
		background: var(--surface-border);
	}
	.chip-n {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: var(--edge);
		color: var(--paper);
		font-size: 0.85rem;
		font-weight: 800;
	}
</style>
