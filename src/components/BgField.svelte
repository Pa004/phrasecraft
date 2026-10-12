<script lang="ts">
import { onMount } from "svelte";

interface Star {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	accent: boolean;
}

let canvas: HTMLCanvasElement | undefined = $state();

onMount(() => {
	const el = canvas;
	if (!el) return;
	const ctx = el.getContext("2d");
	if (!ctx) return;

	const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
	let pts: Star[] = [];
	let running = true;
	let w = 0;
	let h = 0;
	let raf = 0;

	const seed = (): void => {
		pts = [];
		const n = Math.min(70, Math.floor((w * h) / 26000));
		for (let i = 0; i < n; i++) {
			pts.push({
				x: Math.random() * w,
				y: Math.random() * h,
				vx: (Math.random() - 0.5) * 0.66,
				vy: (Math.random() - 0.5) * 0.66,
				r: 1 + Math.random() * 2.2,
				accent: Math.random() < 0.22,
			});
		}
		draw();
	};

	const sizeCanvas = (): void => {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		w = window.innerWidth;
		h = window.innerHeight;
		el.width = w * dpr;
		el.height = h * dpr;
		el.style.width = `${w}px`;
		el.style.height = `${h}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		seed();
	};

	const draw = (): void => {
		ctx.clearRect(0, 0, w, h);
		ctx.lineWidth = 1;
		for (let i = 0; i < pts.length; i++) {
			for (let j = i + 1; j < pts.length; j++) {
				const a = pts[i]!;
				const b = pts[j]!;
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const d = Math.sqrt(dx * dx + dy * dy);
				if (d < 130) {
					ctx.strokeStyle = `rgba(90,60,35,${(0.24 * (1 - d / 130)).toFixed(3)})`;
					ctx.beginPath();
					ctx.moveTo(a.x, a.y);
					ctx.lineTo(b.x, b.y);
					ctx.stroke();
				}
			}
		}
		for (const p of pts) {
			ctx.fillStyle = p.accent ? "rgba(214,110,40,.9)" : "rgba(90,60,35,.5)";
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, 6.2832);
			ctx.fill();
		}
	};

	const tick = (): void => {
		if (!running) return;
		for (const p of pts) {
			p.x += p.vx;
			p.y += p.vy;
			if (p.x < -10) p.x = w + 10;
			if (p.x > w + 10) p.x = -10;
			if (p.y < -10) p.y = h + 10;
			if (p.y > h + 10) p.y = -10;
		}
		draw();
		raf = requestAnimationFrame(tick);
	};

	const stop = (): void => {
		running = false;
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
	};

	const kick = (): void => {
		if (!running && !mq.matches && !document.hidden) {
			running = true;
			raf = requestAnimationFrame(tick);
		}
	};

	sizeCanvas();
	window.addEventListener("resize", sizeCanvas);
	if (mq.matches) {
		running = false;
	} else {
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				stop();
			} else {
				kick();
			}
		});
		if ("IntersectionObserver" in window) {
			new IntersectionObserver((entries) => {
				const vis = entries[0]?.isIntersecting;
				if (!vis) {
					stop();
				} else {
					kick();
				}
			}).observe(document.querySelector("main") ?? el);
		}
		requestAnimationFrame(tick);
		// Guardián: si la cadena rAF se rompe (pestaña en segundo plano,
		// throttling agresivo), se reanima solo cada 2 s.
		const heartbeat = setInterval(kick, 2000);
	}

	return () => {
		stop();
		clearInterval(heartbeat);
		window.removeEventListener("resize", sizeCanvas);
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
		z-index: -1;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
	}
</style>
