# DESIGN.md · danilolopesfisio.com.br

Direção pedida por Danilo: clean, premium, efeito vidro, marrom e verde lembrando bambu.
O bambu conversa com a prática integrativa (acupuntura, MTC) sem virar decoração temática.

Não foi comparado com sites reais via UXKIN (sem conta conectada). A direção vem do pedido
do Danilo, das cores da marca (o marrom) e do público: famílias que decidem pelo idoso,
muitas vezes filhos de 40 a 65 anos lendo pelo celular.

Só tema claro. Não há modo escuro.

## Princípios

1. Uma coisa memorável: o bambuzal desfocado atrás de painéis de vidro. Todo o resto é quieto.
2. Vidro só onde há algo atrás para desfocar: topo das páginas, fechamento e barra do WhatsApp no celular. Nunca em cartões sobre fundo branco.
3. A prova vem cedo: relatório de exemplo no topo e "Quem atende" logo depois.
4. Texto grande e legível para quem tem mais de 60 anos: corpo de 18 px, linhas de até 36 rem.
5. Nada de laranja ou mostarda no site. Elas continuam na identidade do Instagram; aqui o marrom da marca faz a ponte.

## Cor

| Token | Valor | Função |
|---|---|---|
| `--cor-fundo` | `#ffffff` | fundo da página e dos cartões |
| `--cor-salvia` | `#f3f6ee` | fundo de seções alternadas, rodapé |
| `--cor-bambu-claro` | `#e3ecd8` | círculos dos passos, realces suaves |
| `--cor-linha` | `#e2e6dc` | bordas e divisórias |
| `--cor-texto` | `#1e1a16` | texto principal (17,3:1 no branco) |
| `--cor-texto-suave` | `#5b5a52` | texto secundário (6,9:1 no branco, 6,4:1 na sálvia) |
| `--cor-marrom` | `#502d0f` | títulos, nome da marca, foco do teclado |
| `--cor-bambu` | `#3f6b35` | botão principal (texto branco a 6,2:1) |
| `--cor-bambu-escuro` | `#2f5229` | botão principal ao passar o mouse |
| `--cor-bambu-texto` | `#3a5f31` | links e texto verde sobre fundo claro (7,3:1) |

Uma cor de ação só: o verde-bambu. O marrom não é usado em botão.

## Vidro

| Token | Valor |
|---|---|
| `--vidro-fundo` | `rgba(255,255,255,.74)` |
| `--vidro-borda` | `rgba(255,255,255,.72)` |
| `--vidro-desfoque` | `blur(20px) saturate(1.2)` |

Sem suporte a `backdrop-filter`, o fundo sobe para 92 % de branco. Com
`prefers-reduced-transparency: reduce`, vira branco sólido. Dentro do vidro, o texto
secundário escurece para `#4a4942`. Medido no ponto mais escuro do bambuzal: 7,6:1
no celular e 7,7:1 no computador.

## Tipografia

- Títulos: **Newsreader** (serifada, variável), peso 460 a 520, eixo `opsz` acompanhando o tamanho.
- Texto: **Hanken Grotesk**, 400 e 600. Zero sem corte.

| Token | Tamanho / entrelinha | Uso |
|---|---|---|
| `--t-meta` | 0,875 rem / 1,4 | legendas, registro, rodapé legal |
| `--t-pequeno` | 1 rem / 1,5 | notas, itens secundários |
| `--t-corpo` | 1,125 rem / 1,6 | texto corrido |
| `--t-lead` | 1,25 rem / 1,5 | abertura do topo |
| `--t-h3` | 1,375 rem / 1,3 | títulos de item |
| `--t-h2` | 1,75 a 2,5 rem / 1,12 | títulos de seção |
| `--t-h1` | 2,4 a 4,25 rem / 1,04 | título da página |

Valores (R$) em Newsreader com algarismos tabulares.

## Espaçamento

Escala de 4 px: 4, 8, 12, 16, 24, 32, 48, 64, 96 (`--e-1` a `--e-9`).
Seções: 64 px no celular, 96 px no computador. Largura do conteúdo 72 rem; medida do texto 36 rem.
Margem lateral: 16 px no celular, até 40 px no computador.

## Forma e profundidade

| Token | Valor | Uso |
|---|---|---|
| `--r-1` | 6 px | folha do relatório |
| `--r-2` | 16 px | cartões |
| `--r-3` | 28 px | painéis de vidro |
| `--r-pilula` | 999 px | botões |
| `--sombra-1` | `0 1px 2px rgba(30,40,20,.06), 0 10px 30px -14px rgba(30,40,20,.22)` | vidro e cartões |
| `--sombra-2` | `0 2px 4px rgba(30,40,20,.05), 0 34px 70px -30px rgba(30,40,20,.35)` | folha do relatório |

## Componentes

- **Botão principal**: verde-bambu, texto branco 600, altura mínima 52 px, pílula. Um por tela.
- **Botão de vidro**: só no cabeçalho sobre o bambuzal (WhatsApp).
- **Link**: verde-bambu-texto, sublinhado fino.
- **Foco do teclado**: contorno marrom de 3 px com 3 px de afastamento, em tudo que é clicável.
- **Painel de vidro**: título, abertura e botão do topo; fechamento; barra fixa do WhatsApp no celular.
- **Folha do relatório**: papel branco com o cabeçalho do Danilo, tabela de testes e a nota "Exemplo ilustrativo com dados fictícios".
- **Lista com nó**: cada item marcado por um traço verde curto, como o nó do bambu.
- **Passos**: número em Newsreader dentro de círculo verde-claro. Só para sequências reais.
- **Perguntas**: `details` com sinal de mais que gira.
- **Preços**: linhas com nome, valor e detalhe.

## Imagens

- Bambuzal desfocado (`img/bambuzal-*.webp`): só fundo, decorativo (`alt=""`).
- Fotos do Danilo, quando existirem: `img/danilo.webp` (retrato) e `img/danilo-atendendo.webp`. Cantos `--r-2`.
- Paciente só com TCLE e sem identificação. Nada de banco de imagens nem imagem gerada por IA.
- Sem ícones decorativos.
