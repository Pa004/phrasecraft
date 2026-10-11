# phrasecraft

Una escena absurda para recordar **una sola** contraseña de verdad: tu maestra del gestor, tu desbloqueo, tu disco. Con un clic generas varias palabras concretas, las ves como iconos numerados en una escena animada unidos por una frase absurda, y las practicas en minutos.

Demo: https://phrasecraft.pages.dev (Cloudflare Pages, preview por PR). Para el resto de tus cuentas, usa un gestor de contraseñas.

![Demo: generar una escena](public/demo.gif)

## Metricas verificadas (CI en verde)

- Entropia por defecto: `k=8` ≈ 72 bits (`es-v0-draft`, 501 palabras).
- 0 peticiones tras Generar + 0 dependientes de las palabras (e2e con `serviceWorkers: block`).
- Lighthouse CI ≥ 0.95 en Rendimiento, Accesibilidad, Buenas prácticas y SEO en `/`, `/practicar`, `/seguridad`, `/estudio`; LCP < 2 s, CLS = 0.
- Cobertura `src/lib/**`: 100 % líneas y funciones.
- axe-core: 0 violaciones críticas/serias en `/` y `/practicar`.
- Presupuestos: JS inicial 35 KB gzip (≤ 150; la lista va como asset aparte precacheado), sprite 197 KB brotli (≤ 600), `words.json` 8.3 KB gzip (≤ 40).

## Como funciona

- Palabras aleatorias con `crypto.getRandomValues` y muestreo por rechazo, sin duplicados. Entropia exacta `bitsDistinct(n,k)`; por defecto el menor `k` con >= 70 bits (lista `es-v0-draft`: 501 palabras dibujables, `k=8` ≈ 72 bits).
- La escena y la frase no anaden entropia ni son secretas: son ayudas de memoria (principio de Kerckhoffs, el atacante conoce metodo y lista).
- Un unico sprite SVG (`public/icons/es.sprite.svg`, 501 símbolos Fluent flat, brotli 197KB de 600KB) que se descarga siempre completo e igual para todos, precacheado por el service worker. Nada derivado de tus palabras viaja por red.
- Contrasena real en ASCII sin tildes para teclear; la tilde solo es etiqueta visual. Practica en 5 etapas solo en memoria, con `spellcheck off`.
- Esta escena **es** tu contrasena: no la captures ni la compartas. Solo se comparte la herramienta con escena demo fija. Nada en URL, titulo, historial ni logs.

## Como verificar las afirmaciones (no me creas, compruebalo)

1. Abre DevTools > Network, pulsa Generar: **0 peticiones** tras generar. Todas las peticiones son mismo origen.
2. `npm run build` y compara el hash publicado en cada release con tu build local.
3. `node scripts/validate-wordlist.mjs`: falla si hay ascii duplicado, longitud fuera de 4-9, Levenshtein < 2, colision fonetica o falta icono.
4. CSP en `public/_headers` (sin `unsafe-inline`), `Referrer-Policy: no-referrer`. Sin scripts ni fuentes de terceros.

## Modelo de amenazas (resumen)

Se defiende: logs servidor/CDN (sprite unico), shoulder-surfing (oculto por defecto + reveal por palabra), XSS (sin `dangerouslySetInnerHTML`, CSP estricta), persistencia accidental (nada en storage/cookies/historial), sesgo (rechazo). Fuera de alcance: malware/keyloggers, extensiones maliciosas, capturas compartidas, borrado garantizado de memoria JS. Al copiar se intenta borrar a los 30 s (best-effort). Auto-bloqueo a los 5 min + limpieza en `pagehide`.

## Estudio de recuerdo (protocolo abierto, resultados pendientes)

Con contrasena desechable en `/estudio` (solo se guarda `{salt, hash, createdAt}` con SHA-256, nunca la real).

Protocolo: >= 10 voluntarios, instrucciones identicas, 5 minutos de practica con la app. Medidas: recuerdo completo (todas), parcial (>= 5 de 8), intentos, tiempo al primer acierto. Pruebas a 24 h y 7 d desde "Copiar resultado" (JSON sin datos personales).

| Medida | 24 h | 7 d |
|---|---|---|
| Recuerdo completo | — | — |
| Recuerdo parcial | — | — |
| Intentos medios | — | — |

Limitaciones: n pequeno, no representativo, sin grupo control. No afirma generalidad.

## Stack (fijado, innova vs perfil)

Astro 5 + Svelte 5 islands (`client:load`, hidratación parcial), Panda CSS tokens, animación solo CSS (`transform`/`opacity`, respeta `prefers-reduced-motion`, sin `motion`), Deno 2 tasks + Biome 2, Cloudflare Pages + `_headers`, Fluent Emoji flat MIT (`@fluentui-emoji/sprite`), Vitest + Playwright + axe-core + LHCI. Pila de sistema (sin fuentes externas). Ver `package.json` y `deno.json`.

## Comandos

- `npm run dev` / `npm run build` / `npm run preview`
- `npm run check` = `biome check + astro check + vitest run + words:validate` (mismo en `deno task check`)
- `npm run words:build` / `npm run words:validate` / `npm run sprite:build` (Fases 2-3)
- Un test: `npx vitest run src/lib/password/entropy.test.ts`
- E2E cero-peticiones: `npx playwright test` (con `serviceWorkers: block`)

## Ramas

`main` protegida. Una rama por fase (`phase-0-scaffold`, `phase-1-crypto`, ...). Preview Cloudflare por PR. Merge solo con `check` verde. Commits Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

## Release y deploy

Hash SHA-256 del `dist/` de referencia (21 ficheros, build local): `b1768079841739f4db3971266733ab1c5a235cb64c564aeeebb42369c1044152`. Para verificar: `npm ci && npm run build` y comparar.

Deploy (pendiente, lo hace el dueño con su cuenta):

1. Cloudflare Dashboard → Pages → conectar repo `Pa004/phrasecraft`, build `npm run build`, salida `dist`.
2. Las cabeceras de `public/_headers` (CSP, `immutable` para iconos) aplican solas.
3. Publicar el hash del build desplegado en cada release de GitHub.

## Licencias y atribucion

Codigo propio MIT. Emoji Fluent: (c) Microsoft, MIT (ver repo upstream `microsoft/fluentui-emoji` y mirror `@fluentui-emoji`). Datos de nombres base `emojibase-data` solo en build-time (ver licencia upstream). Sin Google Fonts ni CDN.
