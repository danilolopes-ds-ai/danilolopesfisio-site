// Gera o site estático em public/ a partir de src/.
// Uso: node build.mjs   (não precisa instalar nada)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(raiz, "src");
const pub = path.join(raiz, "public");

const dados = JSON.parse(fs.readFileSync(path.join(src, "dados.json"), "utf8"));
const avisos = [];

const reais = (v) =>
  v == null
    ? null
    : "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });

const precoAvaliacao = reais(dados.valores.avaliacaoCompleta);
if (!precoAvaliacao) avisos.push("Valor da avaliação completa não definido em src/dados.json: a página mostra \"sob consulta\".");

const dataAtualizacao = new Date(dados.atualizadoEm + "T12:00:00-03:00");
const dataExtenso = dataAtualizacao.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

const linkWa = (chave) => `https://wa.me/${dados.whatsapp}?text=${encodeURIComponent(dados.mensagens[chave])}`;

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

function jsonLd(pagina) {
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

function render(modelo, vars) {
  let saida = modelo;
  for (let i = 0; i < 5 && /\{\{>\s*[\w-]+\s*\}\}/.test(saida); i++) {
    saida = saida.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, nome) => {
      if (!(nome in partes)) throw new Error(`Parte inexistente: ${nome}`);
      return partes[nome];
    });
  }
  saida = saida.replace(/\{\{\{\s*([\w]+)\s*\}\}\}/g, (_, chave) => {
    if (!(chave in vars)) throw new Error(`Variável inexistente: ${chave}`);
    return String(vars[chave]);
  });
  saida = saida.replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, chave) => {
    if (!(chave in vars)) throw new Error(`Variável inexistente: ${chave}`);
    return escapar(vars[chave]);
  });
  return saida.replace(/\n\s*\n+/g, "\n");
}

fs.rmSync(pub, { recursive: true, force: true });
fs.mkdirSync(pub, { recursive: true });

const urls = [];
for (const arq of fs.readdirSync(path.join(src, "paginas"))) {
  const bruto = fs.readFileSync(path.join(src, "paginas", arq), "utf8");
  const m = bruto.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`Página sem bloco meta: ${arq}`);
  const meta = JSON.parse(m[1]);
  const corpo = bruto.slice(m[0].length);

  const vars = {
    ...dados,
    ...meta,
    css,
    jsonld: jsonLd(meta),
    urlPagina: dados.dominio + meta.caminho,
    waLink: linkWa(meta.mensagem),
    precoAvaliacao: precoAvaliacao ?? "sob consulta",
    precoSessao: reais(dados.valores.sessao),
    localAvaliacaoFrase: `A avaliação é feita ${dados.localAvaliacao}, como for melhor para o paciente.`,
    dataExtenso,
    retrato,
    robots: meta.semIndice ? '\n<meta name="robots" content="noindex">' : "",
  };

  const html = render(corpo, vars);
  const destino = path.join(pub, meta.saida);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  if (!meta.semIndice) urls.push(dados.dominio + meta.caminho);
  console.log("ok", meta.saida, (Buffer.byteLength(html) / 1024).toFixed(1) + " KB");
}

for (const pasta of ["fontes", "img", "og"]) {
  const origem = path.join(src, pasta);
  if (fs.existsSync(origem)) fs.cpSync(origem, path.join(pub, pasta), { recursive: true });
}
for (const arq of ["favicon.svg", "apple-touch-icon.png"]) {
  if (fs.existsSync(path.join(src, arq))) fs.copyFileSync(path.join(src, arq), path.join(pub, arq));
}

fs.writeFileSync(
  path.join(pub, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.sort().map((u) => `  <url><loc>${u}</loc><lastmod>${dados.atualizadoEm}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
);
fs.writeFileSync(path.join(pub, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${dados.dominio}/sitemap.xml\n`);

for (const a of avisos) console.warn("AVISO:", a);
