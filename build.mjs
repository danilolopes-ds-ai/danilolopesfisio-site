// Gera o site estático em public/ a partir de src/ e confere o resultado.
// Uso: node build.mjs   (Node 18 ou mais novo; não precisa instalar nada)
// Se alguma conferência falhar, o comando termina com erro e a hospedagem
// não publica a versão quebrada.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(raiz, "src");
const pub = path.join(raiz, "public");

const dados = JSON.parse(fs.readFileSync(path.join(src, "dados.json"), "utf8"));
const avisos = [];
const erros = [];

const formatoReais = (v) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(v);
const reais = (v) => (v == null ? null : formatoReais(Number(v)));

const precoAvaliacao = reais(dados.valores.avaliacaoCompleta);
if (!precoAvaliacao) avisos.push('Valor da avaliação completa não definido em src/dados.json: as páginas mostram "sob consulta".');
const precoSessao = reais(dados.valores.sessao);
if (!precoSessao) erros.push("Valor da sessão não definido em src/dados.json.");

const dataAtualizacao = new Date(dados.atualizadoEm + "T12:00:00-03:00");
if (Number.isNaN(dataAtualizacao.getTime())) erros.push(`Data inválida em atualizadoEm: ${dados.atualizadoEm}`);
const dataExtenso = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
}).format(dataAtualizacao);

const linkWa = (chave) => {
  if (!dados.mensagens[chave]) throw new Error(`Mensagem de WhatsApp inexistente: ${chave}`);
  return `https://wa.me/${dados.whatsapp}?text=${encodeURIComponent(dados.mensagens[chave])}`;
};

const temFoto = fs.existsSync(path.join(src, "img", "danilo.webp"));
const retrato = temFoto
  ? `<img src="/img/danilo.webp" alt="${dados.nome}, ${dados.profissao.toLowerCase()}" width="288" height="288" loading="lazy" decoding="async">`
  : "DL";

const css = fs
  .readFileSync(path.join(src, "styles.css"), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{};,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();

const escapar = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const partes = {};
for (const arq of fs.readdirSync(path.join(src, "partes"))) {
  partes[path.basename(arq, ".html")] = fs.readFileSync(path.join(src, "partes", arq), "utf8");
}

function jsonLd() {
  const ofertas = [
    { nome: "Avaliação fisioterapêutica completa com relatório", valor: dados.valores.avaliacaoCompleta },
    { nome: "Sessão de fisioterapia em casa", valor: dados.valores.sessao },
  ]
    .filter((o) => o.valor != null)
    .map((o) => ({
      "@type": "Offer",
      price: Number(o.valor).toFixed(2),
      priceCurrency: "BRL",
      itemOffered: { "@type": "Service", name: o.nome },
    }));
  const obj = {
    "@context": "https://schema.org",
    "@type": "Physiotherapy",
    name: `${dados.nome}, ${dados.profissao}`,
    url: dados.dominio + "/",
    telephone: "+" + dados.whatsapp,
    email: dados.email,
    areaServed: { "@type": "Place", name: dados.regiao },
    sameAs: [`https://www.instagram.com/${dados.instagram}/`],
    founder: { "@type": "Person", name: dados.nome, jobTitle: dados.profissao },
    makesOffer: ofertas,
  };
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function render(modelo, vars, arq) {
  let saida = modelo;
  for (let i = 0; i < 5 && /\{\{>\s*[\w-]+\s*\}\}/.test(saida); i++) {
    saida = saida.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, nome) => {
      if (!(nome in partes)) throw new Error(`${arq}: parte inexistente "${nome}"`);
      return partes[nome];
    });
  }
  saida = saida.replace(/\{\{\{\s*(\w+)\s*\}\}\}/g, (_, chave) => {
    if (!(chave in vars)) throw new Error(`${arq}: variável inexistente "${chave}"`);
    return String(vars[chave]);
  });
  saida = saida.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, chave) => {
    if (!(chave in vars)) throw new Error(`${arq}: variável inexistente "${chave}"`);
    return escapar(vars[chave]);
  });
  return saida.replace(/\n\s*\n+/g, "\n");
}

fs.rmSync(pub, { recursive: true, force: true });
fs.mkdirSync(pub, { recursive: true });

const geradas = [];
for (const arq of fs.readdirSync(path.join(src, "paginas")).filter((a) => a.endsWith(".html"))) {
  const bruto = fs.readFileSync(path.join(src, "paginas", arq), "utf8");
  const m = bruto.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`Página sem bloco meta: ${arq}`);
  const meta = JSON.parse(m[1]);
  const corpo = bruto.slice(m[0].length);

  const vars = {
    ...dados,
    ...meta,
    css,
    jsonld: jsonLd(),
    urlPagina: dados.dominio + meta.caminho,
    waLink: linkWa(meta.mensagem),
    precoAvaliacao: precoAvaliacao ?? "sob consulta",
    precoSessao,
    localAvaliacaoFrase: `A avaliação é feita ${dados.localAvaliacao}, como for melhor para o paciente.`,
    dataExtenso,
    retrato,
    robots: meta.semIndice ? '\n<meta name="robots" content="noindex">' : "",
  };

  const html = render(corpo, vars, arq);
  const destino = path.join(pub, meta.saida);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  geradas.push({ arq, meta, html, destino });
}

for (const pasta of ["fontes", "img", "og"]) {
  const origem = path.join(src, pasta);
  if (fs.existsSync(origem)) fs.cpSync(origem, path.join(pub, pasta), { recursive: true });
}
for (const arq of ["favicon.svg", "apple-touch-icon.png"]) {
  if (fs.existsSync(path.join(src, arq))) fs.copyFileSync(path.join(src, arq), path.join(pub, arq));
}
for (const arq of ["_headers", "_redirects"]) {
  fs.copyFileSync(path.join(src, "plataforma", arq), path.join(pub, arq));
}

const urls = geradas.filter((g) => !g.meta.semIndice).map((g) => dados.dominio + g.meta.caminho);
fs.writeFileSync(
  path.join(pub, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.sort().map((u) => `  <url><loc>${u}</loc><lastmod>${dados.atualizadoEm}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
);
fs.writeFileSync(path.join(pub, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${dados.dominio}/sitemap.xml\n`);

// ---------- Conferências ----------
const existeNoSite = (caminho) => {
  const limpo = decodeURIComponent(caminho.split("#")[0].split("?")[0]);
  const alvo = path.join(pub, limpo);
  if (limpo.endsWith("/")) return fs.existsSync(path.join(alvo, "index.html"));
  return fs.existsSync(alvo) && fs.statSync(alvo).isFile();
};
const textoVisivel = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;| /g, " ")
    .replace(/\s+/g, " ");

for (const { arq, meta, html } of geradas) {
  const onde = `${arq}:`;
  const semCodigo = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, "");
  if (/\{\{|\}\}/.test(semCodigo)) erros.push(`${onde} sobrou marcação {{ }} sem preencher.`);

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) erros.push(`${onde} tem ${h1} títulos h1 (deve ter 1).`);

  const titulo = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
  if (!titulo) erros.push(`${onde} sem <title>.`);
  else if (titulo.length > 70) avisos.push(`${onde} título com ${titulo.length} caracteres; o Google costuma cortar depois de uns 60.`);

  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  if (desc.length < 50 || desc.length > 170) avisos.push(`${onde} descrição com ${desc.length} caracteres (ideal entre 50 e 160).`);

  for (const bloco of html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || []) {
    try {
      JSON.parse(bloco.replace(/^<script[^>]*>|<\/script>$/g, ""));
    } catch (e) {
      erros.push(`${onde} JSON-LD inválido: ${e.message}`);
    }
  }

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((x) => x[1]));
  for (const [, ref] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (ref.startsWith("#")) {
      if (!ids.has(ref.slice(1))) erros.push(`${onde} âncora ${ref} não existe na página.`);
    } else if (ref.startsWith("/") && !ref.startsWith("//")) {
      if (!existeNoSite(ref)) erros.push(`${onde} link interno quebrado: ${ref}`);
    } else if (!/^(https:\/\/|mailto:)/.test(ref)) {
      erros.push(`${onde} link em formato inesperado: ${ref}`);
    }
  }
  if (!existeNoSite(meta.ogImagem)) erros.push(`${onde} imagem de compartilhamento não encontrada: ${meta.ogImagem}`);

  // Resolução COFFITO nº 532/2021, art. 4º: nome, inscrição e data em toda publicação.
  const visivel = textoVisivel(html);
  const crefito = dados.crefito.replace(/ /g, " ");
  if (!visivel.includes(dados.nome)) erros.push(`${onde} o nome não aparece na página.`);
  if (!visivel.includes(crefito)) erros.push(`${onde} o registro ${crefito} não aparece na página.`);
  if (!visivel.includes(`atualizada em ${dataExtenso}`)) erros.push(`${onde} a data de atualização não aparece no rodapé.`);
  if (/\bespecialista\b|\bespecializad[ao]\b/i.test(visivel))
    erros.push(`${onde} usa "especialista"/"especializado" (só com título reconhecido pelo COFFITO).`);
  if (/—/.test(visivel)) avisos.push(`${onde} tem travessão (—) no texto.`);

  console.log("ok", meta.saida, (Buffer.byteLength(html) / 1024).toFixed(1) + " KB");
}

for (const a of avisos) console.warn("AVISO:", a);
if (erros.length) {
  for (const e of erros) console.error("ERRO:", e);
  console.error(`\n${erros.length} problema(s). Corrija antes de publicar.`);
  process.exit(1);
}
console.log("Tudo conferido.");
