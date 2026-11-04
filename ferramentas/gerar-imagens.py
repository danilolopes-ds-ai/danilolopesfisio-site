"""Gera as imagens de compartilhamento (Open Graph) e o ícone do celular.

Uso: python3 ferramentas/gerar-imagens.py
Precisa do Playwright com Chromium instalado. Só é preciso rodar de novo
se os títulos ou as cores mudarem; as imagens geradas ficam em src/.
"""
import asyncio
import base64
import pathlib
import shutil
from playwright.async_api import async_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
def dados_uri(arquivo, tipo):
    return f"data:{tipo};base64," + base64.b64encode((RAIZ / "src" / arquivo).read_bytes()).decode()


TITULO_FONTE = dados_uri("fontes/bricolage-800.woff2", "font/woff2")
TEXTO_FONTE = dados_uri("fontes/atkinson-400.woff2", "font/woff2")

CARTOES = {
    "inicio": "Fisioterapia para idosos na Zona Oeste de São Paulo",
    "avaliacao": "Avaliação fisioterapêutica completa, com relatório por escrito",
    "home-care": "Fisioterapia para idosos, na casa onde eles vivem",
}

BASE = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: B; src: url('{titulo_fonte}'); font-weight: 800; }}
@font-face {{ font-family: A; src: url('{texto_fonte}'); font-weight: 400; }}
html, body {{ margin: 0; }}
body {{ width: 1200px; height: 630px; background: #fff; color: #2a1709; font-family: A; position: relative; overflow: hidden; }}
.borda {{ position: absolute; inset: 0; border: 14px solid #502d0f; }}
h1 {{ font-family: B; font-weight: 800; color: #502d0f; font-size: 76px; line-height: 1.02; letter-spacing: -1.5px; margin: 0; position: absolute; left: 80px; top: 72px; width: 960px; }}
.assina {{ position: absolute; left: 80px; bottom: 150px; font-size: 30px; }}
.assina b {{ font-family: B; font-weight: 800; color: #502d0f; }}
.trena {{ position: absolute; left: 0; right: 0; bottom: 14px; height: 96px; background-color: #e6a30b;
  background-image: repeating-linear-gradient(to right, #502d0f 0 4px, transparent 4px 100%),
    repeating-linear-gradient(to right, #502d0f 0 3px, transparent 3px 100%),
    repeating-linear-gradient(to right, #502d0f 0 2px, transparent 2px 100%);
  background-size: 200px 46px, 40px 30px, 20px 18px; background-repeat: repeat-x; }}
</style></head><body><h1>{titulo}</h1>
<p class="assina"><b>Danilo Lopes</b>, Fisioterapeuta, CREFITO/3 198613-F</p>
<div class="trena"></div><div class="borda"></div></body></html>"""

ICONE = """<!doctype html><html><head><style>html,body{{margin:0}}</style></head><body>
<img src="{svg}" width="180" height="180"></body></html>"""


async def main():
    (RAIZ / "src" / "og").mkdir(exist_ok=True)
    async with async_playwright() as p:
        chrome = shutil.which("google-chrome") or shutil.which("chromium")
        nav = await p.chromium.launch(executable_path=chrome) if chrome else await p.chromium.launch()
        pagina = await nav.new_page(viewport={"width": 1200, "height": 630})
        for nome, titulo in CARTOES.items():
            await pagina.set_content(BASE.format(titulo_fonte=TITULO_FONTE, texto_fonte=TEXTO_FONTE, titulo=titulo))
            await pagina.evaluate("document.fonts.ready")
            await pagina.screenshot(path=str(RAIZ / "src" / "og" / f"{nome}.png"))
        await pagina.set_viewport_size({"width": 180, "height": 180})
        await pagina.set_content(ICONE.format(svg=dados_uri("favicon.svg", "image/svg+xml")))
        await pagina.wait_for_timeout(200)
        await pagina.screenshot(path=str(RAIZ / "src" / "apple-touch-icon.png"))
        await nav.close()


asyncio.run(main())
