<script lang="ts">
interface Props {
	active: boolean;
	timeoutMs?: number;
	onLock: () => void;
}

let { active, timeoutMs = 5 * 60 * 1000, onLock }: Props = $props();

$effect(() => {
	if (!active) return;
	let timer: ReturnType<typeof setTimeout> | undefined;
	const arm = (): void => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(onLock, timeoutMs);
	};
	const hide = (): void => {
		onLock();
	};
	arm();
	window.addEventListener("pointerdown", arm);
	window.addEventListener("keydown", arm);
	window.addEventListener("pagehide", hide);
	return () => {
		if (timer) clearTimeout(timer);
		window.removeEventListener("pointerdown", arm);
		window.removeEventListener("keydown", arm);
		window.removeEventListener("pagehide", hide);
	};
});
</script>
