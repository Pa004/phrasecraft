export interface TiltOptions {
	max?: number;
}

/**
 * Tilt 3D por puntero (desktop): rotateX/rotateY con perspective del padre.
 * Solo puntero fino y sin `prefers-reduced-motion`. Todo por `transform`.
 */
export function tilt(
	node: HTMLElement,
	opts: TiltOptions = {},
): { destroy: () => void } {
	const max = opts.max ?? 8;
	const fine = window.matchMedia("(pointer: fine)").matches;
	const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (!fine || calm) return { destroy: () => {} };

	let raf = 0;
	let tx = 0;
	let ty = 0;
	const apply = (): void => {
		raf = 0;
		node.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg)`;
	};
	const onMove = (e: PointerEvent): void => {
		if (e.pointerType !== "mouse") return;
		const r = node.getBoundingClientRect();
		if (r.width === 0 || r.height === 0) return;
		tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
		ty = -((e.clientY - r.top) / r.height - 0.5) * 2 * max;
		if (!raf) raf = requestAnimationFrame(apply);
	};
	const onLeave = (): void => {
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
		tx = 0;
		ty = 0;
		node.style.transform = "rotateX(0deg) rotateY(0deg)";
	};
	node.addEventListener("pointermove", onMove);
	node.addEventListener("pointerleave", onLeave);
	return {
		destroy: () => {
			if (raf) cancelAnimationFrame(raf);
			node.removeEventListener("pointermove", onMove);
			node.removeEventListener("pointerleave", onLeave);
		},
	};
}
