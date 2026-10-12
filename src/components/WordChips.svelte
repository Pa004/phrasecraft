<script lang="ts">
import type { WordEntry } from "../lib/password/types.js";

interface Props {
	words: WordEntry[];
}

let { words }: Props = $props();
</script>

<ul class="wchips" aria-hidden="true">
	{#each words as word, i (word.id)}
		<li class="wchip"><span class="wchip-n">{i + 1}</span>{word.es}</li>
	{/each}
</ul>
