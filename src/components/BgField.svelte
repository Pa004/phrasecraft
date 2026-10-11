<script lang="ts">
import { onMount } from "svelte";

interface Star {
	x: number;
	y: number;
	z: number;
	r: number;
	numbered: boolean;
	label: string;
	phase: number;
}

let canvas: HTMLCanvasElement | undefined = $state();

onMount(() => {
	const el = canvas;
	if (!el) return;
	const ctx = el.getContext("2d");
	if (!ctx) return;

	const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
	const dark = window.matchMedia("(prefers-color-scheme: dark)");
	let w = 0;
	let h = 0;
	let stars: Star[] = [];
	let raf = 0;
	let running = false;
	let scrollY = window.scrollY;
	let interacted = false;

	const spawn = (): Star => ({
		x: Math.random(),
		y: Math.random(),
		z: 0.25 + Math.random() * 0.75,
		r: 1 + Math.random() * 2.2,
		numbered: Math.random() < 0.12,
		label: String(1 + Math.floor(Math.random() * 9)),
		phase: Math.random() * Math.PI * 2,
	});

	const resize = (): void => {
		const rect = el.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		w = Math.max(1, Math.round(rect.width));
		h = Math.max(1, Math.round(rect.height));
		el.width = Math.round(w * dpr);
		el.height = Math.round(h * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		const mobile = window.innerWidth < 640;
		const count = mobile ? 40 : 90;
		stars = Array.from({ length: count }, spawn);
		draw(0);
	};

	const colors = (): { dot: string; ring: string } =>
		dark.matches
			? { dot: "rgba(250,247,240,0.5)", ring: "rgba(228,88,46,0.55)" }
			: { dot: "rgba(26,26,46,0.28)", ring: "rgba(228,88,46,0.5)" };

	const draw = (t: number): void => {
		ctx.clearRect(0, 0, w, h);
		const { dot, ring } = colors();
		const parallax = (scrollY / Math.max(1, document.body.scrollHeight)) * 60;
		for (const s of stars) {
			const bob = mq.matches ? 0 : Math.sin(t / 2600 + s.phase) * 6 * s.z;
			const x = s.x * w;
			const y =
				((((s.y * h + bob - parallax * s.z) % (h + 40)) + h + 40) % (h + 40)) -
				20;
			const r = s.r * (0.6 + 0.7 * s.z);
			if (s.numbered) {
				ctx.beginPath();
				ctx.strokeStyle = ring;
				ctx.lineWidth = 1.5;
				ctx.arc(x, y, r + 7, 0, Math.PI * 2);
				ctx.stroke();
				ctx.fillStyle = ring;
				ctx.font = `${Math.round(10 + 4 * s.z)}px system-ui, sans-serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(s.label, x, y - r - 14);
			}
			ctx.beginPath();
			ctx.fillStyle = dot;
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
		}
	};

	const tick = (t: number): void => {
		if (!running) return;
		draw(t);
		raf = requestAnimationFrame(tick);
	};

	const start = (): void => {
		if (running || mq.matches || document.hidden || !interacted) return;
		running = true;
		raf = requestAnimationFrame(tick);
	};
	const stop = (): void => {
		running = false;
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
	};

	const onScroll = (): void => {
		scrollY = window.scrollY;
		if (mq.matches) draw(0);
	};
	// El loop solo arranca con interacción real: el canvas a viewport completo
	// contaminaría el LCP si animara durante la carga. Estático hasta entonces.
	const onFirstInteract = (): void => {
		interacted = true;
		unbindInteract();
		start();
	};
	const unbindInteract = (): void => {
		window.removeEventListener("pointerdown", onFirstInteract);
		window.removeEventListener("wheel", onFirstInteract);
		window.removeEventListener("keydown", onFirstInteract);
		window.removeEventListener("touchstart", onFirstInteract);
	};
	window.addEventListener("pointerdown", onFirstInteract);
	window.addEventListener("wheel", onFirstInteract);
	window.addEventListener("keydown", onFirstInteract);
	window.addEventListener("touchstart", onFirstInteract);
	const onVis = (): void => {
		if (document.hidden) stop();
		else {
			draw(0);
		}
	};
	const onMotion = (): void => {
		if (mq.matches) {
			stop();
			draw(0);
		} else start();
	};

	const io = new IntersectionObserver(([entry]) => {
		if (entry?.isIntersecting) draw(0);
		else stop();
	});
	io.observe(el);
	const ro = new ResizeObserver(resize);
	ro.observe(el);
	window.addEventListener("scroll", onScroll, { passive: true });
	document.addEventListener("visibilitychange", onVis);
	mq.addEventListener("change", onMotion);
	resize();
	start();
	return () => {
		stop();
		unbindInteract();
		io.disconnect();
		ro.disconnect();
		window.removeEventListener("scroll", onScroll);
		document.removeEventListener("visibilitychange", onVis);
		mq.removeEventListener("change", onMotion);
	};
});
</script>

<canvas
	bind:this={canvas}
	class="bg-field"
	aria-hidden="true"
	tabindex="-1"
></canvas>

<style>
	.bg-field {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		pointer-events: none;
	}
</style>
