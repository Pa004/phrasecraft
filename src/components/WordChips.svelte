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
		gap: 0.5rem;
		padding: 0;
		margin: 0.75rem 0;
		list-style: none;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.3rem 0.8rem 0.3rem 0.3rem;
		border-radius: 999px;
		border: 2px solid var(--edge);
		background: var(--surface);
		font-weight: 700;
		box-shadow: 2px 2px 0 var(--hard);
	}
	.chip-n {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--edge);
		color: var(--btn-ink);
		font-size: 0.85rem;
		font-weight: 800;
	}
</style>
