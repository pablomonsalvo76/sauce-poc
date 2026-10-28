import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';

/**
 * Arma resultados/insumo-analisis.md a partir del reporte JSON de Playwright: es el insumo
 * que se le pasa a la IA junto con el Prompt 7 (análisis de resultados).
 * Uso: npm test y después npm run insumo.
 */

const RESULTADOS_JSON = 'resultados/resultados.json';
const SALIDA_MD = 'resultados/insumo-analisis.md';
const ANSI = new RegExp(`${String.fromCharCode(27)}[[][0-9;]*m`, 'g');

interface Adjunto {
  name: string;
  contentType: string;
  path?: string;
}

interface ErrorReporte {
  message?: string;
}

interface Paso {
  title: string;
  duration: number;
  error?: ErrorReporte;
  steps?: Paso[];
}

interface Resultado {
  status: string;
  duration: number;
  retry: number;
  errors: ErrorReporte[];
  steps?: Paso[];
  attachments: Adjunto[];
}

interface TestReporte {
  projectName: string;
  status: string;
  results: Resultado[];
}

interface Spec {
  title: string;
  file: string;
  tags: string[];
  tests: TestReporte[];
}

interface Suite {
  title: string;
  specs: Spec[];
  suites?: Suite[];
}

interface Reporte {
  config: { version: string; workers: number; projects: { name: string; retries: number }[] };
  suites: Suite[];
  errors: ErrorReporte[];
  stats: { startTime: string; duration: number; expected: number; unexpected: number; flaky: number; skipped: number };
}

/** Saca los códigos de color ANSI que Playwright agrega a los mensajes de error. */
function sinColores(texto: string): string {
  return texto.replace(ANSI, '');
}

function segundos(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

/** Devuelve todas las specs de una suite y de sus suites anidadas. */
function specsDe(suite: Suite): Spec[] {
  return [...suite.specs, ...(suite.suites ?? []).flatMap(specsDe)];
}

/** Devuelve la ruta del paso más profundo que tiene error (ej. "04 Completar datos > Expect"). */
function pasoConError(pasos: Paso[] = [], ruta: string[] = []): string | undefined {
  const paso = pasos.find((p) => p.error);
  if (!paso) {
    return undefined;
  }
  return pasoConError(paso.steps, [...ruta, paso.title]) ?? [...ruta, paso.title].join(' > ');
}

function leerErrorContext(adjuntos: Adjunto[]): string | undefined {
  const adjunto = adjuntos.find((a) => a.path?.endsWith('error-context.md'));
  return adjunto?.path && existsSync(adjunto.path) ? readFileSync(adjunto.path, 'utf8') : undefined;
}

function erroresComoTexto(errores: ErrorReporte[]): string {
  return sinColores(errores.map((e) => e.message ?? '').join('\n\n')).trim();
}

if (!existsSync(RESULTADOS_JSON)) {
  throw new Error(`No existe ${RESULTADOS_JSON}. Ejecutá npm test antes de npm run insumo.`);
}

const reporte = JSON.parse(readFileSync(RESULTADOS_JSON, 'utf8')) as Reporte;
const { stats, config } = reporte;
const specs = reporte.suites.flatMap(specsDe);
const total = stats.expected + stats.unexpected + stats.flaky + stats.skipped;
const proyectos = config.projects.map((p) => `${p.name} (retries: ${p.retries})`).join(', ');

const lineas: string[] = [
  '# Insumo para el análisis de resultados',
  '',
  `- Inicio de la corrida: ${stats.startTime}`,
  `- Playwright ${config.version} · workers: ${config.workers} · proyectos: ${proyectos}`,
  '- Timeout de expect configurado: 10 s (TIMEOUT_EXPECT_MS en playwright.config.ts)',
  '',
  '## Resumen',
  '',
  '| Total | Pasados | Fallidos | Flaky | Saltados | Duración total |',
  '|-------|---------|----------|-------|----------|----------------|',
  `| ${total} | ${stats.expected} | ${stats.unexpected} | ${stats.flaky} | ${stats.skipped} | ${segundos(stats.duration)} |`,
  '',
  '## Tests',
  '',
  '| Test | Archivo | Tags | Estado | Intentos | Duración por intento |',
  '|------|---------|------|--------|----------|----------------------|',
];

for (const spec of specs) {
  for (const test of spec.tests) {
    const tags = spec.tags.map((t) => `@${t}`).join(' ');
    const duraciones = test.results.map((r) => `${segundos(r.duration)} (${r.status})`).join(', ');
    lineas.push(`| ${spec.title} | ${spec.file} | ${tags} | ${test.status} | ${test.results.length} | ${duraciones} |`);
  }
}

const fallidos = specs.flatMap((spec) =>
  spec.tests.flatMap((test) =>
    test.results.filter((r) => r.status !== 'passed' && r.status !== 'skipped').map((r) => ({ spec, r })),
  ),
);

lineas.push('', '## Fallas');
if (fallidos.length === 0) {
  lineas.push('', 'Sin fallas en esta corrida.');
}

for (const { spec, r } of fallidos) {
  const evidencia = r.attachments
    .filter((a) => a.path)
    .map((a) => `${a.name} (${relative(process.cwd(), a.path ?? '')})`)
    .join(', ');
  lineas.push(
    '',
    `### ${spec.title} (intento ${r.retry + 1})`,
    '',
    `- Estado: ${r.status} · duración: ${segundos(r.duration)}`,
    `- Paso donde falla: ${pasoConError(r.steps) ?? 'no identificado'}`,
    `- Evidencia: ${evidencia || 'ninguna'}`,
    '',
    'Error:',
    '',
    '```text',
    erroresComoTexto(r.errors),
    '```',
  );
  const errorContext = leerErrorContext(r.attachments);
  if (errorContext) {
    lineas.push('', 'Estado de la página al fallar (error-context.md):', '', '````text', errorContext.trim(), '````');
  }
}

if (reporte.errors.length > 0) {
  lineas.push('', '## Errores fuera de los tests', '', '```text', erroresComoTexto(reporte.errors), '```');
}

writeFileSync(SALIDA_MD, `${lineas.join('\n')}\n`);
console.log(`Insumo generado en ${SALIDA_MD}: pegalo en el Prompt 7.`);
