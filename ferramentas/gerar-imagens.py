"""Gera as imagens de compartilhamento (Open Graph) e o ícone do celular.

Uso: python3 ferramentas/gerar-imagens.py
Precisa do Playwright com Chromium. Rode de novo se os títulos, as cores
mudarem; as imagens geradas ficam em src/.
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
body {{ width: 1200px; height: 630px; position: relative; overflow: hidden; font-family: A; color: #1e1a16; background: #ffffff; }}
.faixa {{ position: absolute; right: 0; top: 0; bottom: 0; width: 330px; background: #f3f6ee; }}
.no {{ position: absolute; left: 96px; top: 96px; width: 56px; height: 5px; border-radius: 3px; background: #3f6b35; }}
h1 {{ position: absolute; left: 96px; top: 136px; width: 700px; font-family: T; font-weight: 470; font-size: 66px; line-height: 1.04; letter-spacing: -1.3px; margin: 0; }}
.assina {{ position: absolute; left: 96px; bottom: 88px; font-size: 26px; color: #5b5a52; margin: 0; }}
.assina b {{ display: block; font-family: T; font-weight: 520; font-size: 32px; color: #502d0f; margin-bottom: 4px; }}
</style></head><body><div class="faixa"></div><div class="no"></div><h1>{titulo}</h1>
<p class="assina"><b>Danilo Lopes</b>Fisioterapeuta, CREFITO/3 198613-F</p></body></html>"""

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
                                                 texto_fonte_600=TEXTO_FONTE_600, titulo=titulo))
            await pagina.evaluate("document.fonts.ready")
            await pagina.wait_for_timeout(200)
            await pagina.screenshot(path=str(RAIZ / "src" / "og" / f"{nome}.jpg"), type="jpeg", quality=84)
        await pagina.set_viewport_size({"width": 180, "height": 180})
        await pagina.set_content(ICONE.format(svg=dados_uri("favicon.svg", "image/svg+xml")))
        await pagina.wait_for_timeout(200)
        await pagina.screenshot(path=str(RAIZ / "src" / "apple-touch-icon.png"))
        await nav.close()


asyncio.run(main())
