import random, asyncio, pathlib
from playwright.async_api import async_playwright
random.seed(7)
W,H=1600,1000
def colmo(x,w,cores,nos=True,ang=0):
    gid=f"g{random.randint(0,10**9)}"
    esc,meio,claro=cores
    s=[f'<linearGradient id="{gid}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="{esc}"/><stop offset=".35" stop-color="{claro}"/><stop offset=".6" stop-color="{meio}"/><stop offset="1" stop-color="{esc}"/></linearGradient>']
    g=[f'<g transform="rotate({ang} {x+w/2} {H})">', f'<rect x="{x}" y="-40" width="{w}" height="{H+80}" rx="{w/2}" fill="url(#{gid})"/>']
    if nos:
        y=random.randint(40,160)
        while y<H:
            g.append(f'<rect x="{x-1}" y="{y}" width="{w+2}" height="{max(3,w*0.12):.1f}" rx="2" fill="{esc}" opacity=".9"/>')
            g.append(f'<rect x="{x+2}" y="{y+max(3,w*0.12)+1:.1f}" width="{w-4}" height="2" rx="1" fill="#e9f0de" opacity=".55"/>')
            y+=random.randint(150,230)
    g.append('</g>')
    return "".join(s), "".join(g)
def folha(cx,cy,comp,larg,ang,cor):
    return f'<path transform="translate({cx} {cy}) rotate({ang})" d="M0 0 C {comp*0.35} {-larg} {comp*0.75} {-larg*0.6} {comp} 0 C {comp*0.75} {larg*0.35} {comp*0.35} {larg*0.6} 0 0 Z" fill="{cor}"/>'
defs=[];longe=[];perto=[];folhas=[]
x=-20
while x<W+40:
    w=random.randint(16,30)
    d,g=colmo(x,w,("#b3c79a","#c8d7b3","#dbe6cc"),nos=True,ang=random.uniform(-1.2,1.2)); defs.append(d); longe.append(g)
    x+=w+random.randint(30,90)
posicoes=[(-30,70),(170,48),(820,58),(1000,40),(1130,66),(1340,52),(1500,62)]
for (px,w) in posicoes:
    d,g=colmo(px,w,("#6f9150","#8fae6b","#b0c88f"),nos=True,ang=random.uniform(-1.5,1.5)); defs.append(d); perto.append(g)
for (cx,cy) in [(1180,120),(1060,260),(1420,180),(880,90),(120,200),(1560,330)]:
    for i in range(5):
        folhas.append(folha(cx+random.randint(-20,20),cy+random.randint(-20,20),random.randint(120,190),random.randint(14,22),random.uniform(-160,-20) if i%2 else random.uniform(10,60),random.choice(["#7d9c5a","#6f9150","#93b072"])))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<defs>{"".join(defs)}
<radialGradient id="luz" cx=".18" cy=".1" r=".9"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".55" stop-color="#ffffff" stop-opacity=".25"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
<filter id="b1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="b2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="b3" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
</defs>
<rect width="{W}" height="{H}" fill="#edf2e6"/>
<g filter="url(#b1)" opacity=".9">{"".join(longe)}</g>
<g filter="url(#b2)" opacity=".85">{"".join(perto)}</g>
<g filter="url(#b3)" opacity=".7">{"".join(folhas)}</g>
<rect width="{W}" height="{H}" fill="url(#luz)"/>
</svg>'''
d=pathlib.Path(__file__).parent
(d/"bambuzal.svg").write_text(svg)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome")
        pg=await b.new_page(viewport={"width":W,"height":H})
        await pg.set_content(f'<html><body style="margin:0">{svg}</body></html>')
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=str(d/"bambuzal.png"))
        await b.close()
asyncio.run(main())
