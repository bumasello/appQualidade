// URL base da API.
//
// O backend roda numa porta diferente por ambiente (PRD 8080, HML 8081) para que
// os dois apps possam ficar abertos ao mesmo tempo sem disputar o mesmo socket.
// O Electron informa a porta via query string ao carregar o index.html.
//
// Fora do Electron (vite dev server) nao ha query, entao cai em 8080 — o mesmo
// padrao que `bun run dev:backend` usa quando o PORT nao vem definido.
const porta =
  new URLSearchParams(window.location.search).get("apiPort") ?? "8080";

export const API_BASE = `http://localhost:${porta}`;
