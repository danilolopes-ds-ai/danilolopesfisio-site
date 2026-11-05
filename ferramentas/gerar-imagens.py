"""Gera as imagens de compartilhamento (Open Graph) e o ícone do celular.

Uso: python3 ferramentas/gerar-imagens.py
Precisa do Playwright com Chromium. Rode de novo se os títulos, as cores
ou o fundo de bambu mudarem; as imagens geradas ficam em src/.
"""
import asyncio
import base64
import pathlib
import shutil
from playwright.async_api import async_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent


def dados_uri(arquivo, tipo):
    return f"data:{tipo};base64," + base64.b64encode((RAIZ / "src" / arquivo).read_bytes()).decode()


TITULO_FONTE = dados_uri("fontes/newsreader.woff2", "font/woff2")
TEXTO_FONTE = dados_uri("fontes/hanken-400.woff2", "font/woff2")
TEXTO_FONTE_600 = dados_uri("fontes/hanken-600.woff2", "font/woff2")
FUNDO = dados_uri("img/bambuzal-1600.webp", "image/webp")

CARTOES = {
    "inicio": "Fisioterapia para idosos na Zona Oeste de São Paulo",
    "avaliacao": "Avaliação fisioterapêutica para idosos, com relatório por escrito",
    "home-care": "Fisioterapia para idosos, na casa onde eles vivem",
}

BASE = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: T; src: url('{titulo_fonte}'); font-weight: 420 560; }}
@font-face {{ font-family: A; src: url('{texto_fonte}'); font-weight: 400; }}
@font-face {{ font-family: A; src: url('{texto_fonte_600}'); font-weight: 600; }}
html, body {{ margin: 0; }}
body {{ width: 1200px; height: 630px; position: relative; overflow: hidden; font-family: A; color: #1e1a16;
  background: #edf2e6 url('{fundo}') 30% top / cover no-repeat; }}
.painel {{ position: absolute; left: 64px; top: 64px; bottom: 64px; width: 760px; border-radius: 36px; padding: 56px 60px;
  background: rgba(255,255,255,.66); backdrop-filter: blur(18px) saturate(1.35); border: 1px solid rgba(255,255,255,.75);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.85), 0 20px 50px -24px rgba(30,40,20,.35); box-sizing: border-box;
  display: flex; flex-direction: column; justify-content: space-between; }}
h1 {{ font-family: T; font-weight: 470; font-size: 64px; line-height: 1.04; letter-spacing: -1.2px; margin: 0; }}
.assina {{ font-size: 26px; color: #5b5a52; margin: 0; }}
.assina b {{ display: block; font-family: T; font-weight: 520; font-size: 32px; color: #502d0f; margin-bottom: 4px; }}
</style></head><body><div class="painel"><h1>{titulo}</h1>
<p class="assina"><b>Danilo Lopes</b>Fisioterapeuta, CREFITO/3 198613-F</p></div></body></html>"""

ICONE = """<!doctype html><html><head><style>html,body{{margin:0}}</style></head><body>
<img src="{svg}" width="180" height="180"></body></html>"""


async def main():
    (RAIZ / "src" / "og").mkdir(exist_ok=True)
    async with async_playwright() as p:
        chrome = shutil.which("google-chrome") or shutil.which("chromium")
        nav = await p.chromium.launch(executable_path=chrome) if chrome else await p.chromium.launch()
        pagina = await nav.new_page(viewport={"width": 1200, "height": 630})
        for nome, titulo in CARTOES.items():
            await pagina.set_content(BASE.format(titulo_fonte=TITULO_FONTE, texto_fonte=TEXTO_FONTE,
                                                 texto_fonte_600=TEXTO_FONTE_600, fundo=FUNDO, titulo=titulo))
            await pagina.evaluate("document.fonts.ready")
            await pagina.wait_for_timeout(200)
            await pagina.screenshot(path=str(RAIZ / "src" / "og" / f"{nome}.jpg"), type="jpeg", quality=84)
        await pagina.set_viewport_size({"width": 180, "height": 180})
        await pagina.set_content(ICONE.format(svg=dados_uri("favicon.svg", "image/svg+xml")))
        await pagina.wait_for_timeout(200)
        await pagina.screenshot(path=str(RAIZ / "src" / "apple-touch-icon.png"))
        await nav.close()


asyncio.run(main())
