export interface IconSpot {
	x: number;
	y: number;
}

export const LAYOUTS = ["arco", "camino", "zigzag"] as const;
export type LayoutName = (typeof LAYOUTS)[number];

function arc(k: number): IconSpot[] {
	if (k === 1) return [{ x: 0.5, y: 0.45 }];
	return Array.from({ length: k }, (_, i) => ({
		x: 0.1 + (0.8 * i) / (k - 1),
		y: 0.62 - 0.3 * Math.sin((Math.PI * i) / (k - 1)),
	}));
}

function camino(k: number): IconSpot[] {
	if (k === 1) return [{ x: 0.5, y: 0.5 }];
	return Array.from({ length: k }, (_, i) => ({
		x: 0.5 + 0.32 * Math.sin(i * 2.2),
		y: 0.12 + (0.76 * i) / (k - 1),
	}));
}

function zigzag(k: number): IconSpot[] {
	if (k === 1) return [{ x: 0.5, y: 0.45 }];
	return Array.from({ length: k }, (_, i) => ({
		x: i % 2 === 0 ? 0.25 : 0.75,
		y: 0.12 + (0.76 * i) / (k - 1),
	}));
}

export function layoutPositions(k: number, layout: LayoutName): IconSpot[] {
	if (k < 1) throw new RangeError("k debe ser >= 1");
	switch (layout) {
		case "arco":
			return arc(k);
		case "camino":
			return camino(k);
		case "zigzag":
			return zigzag(k);
	}
}
