# danilolopesfisio.com.br

Páginas de Danilo Lopes, Fisioterapeuta (CREFITO/3 198613-F):

- `/` início, com os dois caminhos
- `/avaliacao/` avaliação fisioterapêutica completa com relatório
- `/home-care/` fisioterapia para idosos em casa

Site estático, sem framework: HTML, CSS embutido na página e fontes próprias. Publicado no Netlify a partir da pasta `public/`.

## Mudar preços, contato ou textos fixos

1. Edite `src/dados.json` (valores, WhatsApp, região, data de atualização).
2. Rode `node build.mjs` para gerar `public/` de novo.
3. Envie para o GitHub. O Netlify publica sozinho.

Ao mudar qualquer conteúdo, atualize `atualizadoEm` em `src/dados.json`: a data aparece no rodapé (Resolução COFFITO nº 532/2021, art. 4º).

## Estrutura

- `src/paginas/` uma página por arquivo; o bloco `<!--meta ... -->` no topo define título, descrição e mensagem do WhatsApp
- `src/partes/` cabeçalho, trena, "Quem atende" e rodapé, compartilhados
- `src/styles.css` todo o visual
- `src/img/danilo.webp` se existir, entra no lugar das iniciais em "Quem atende" (quadrada, 576 px)
- `ferramentas/gerar-imagens.py` gera as imagens de compartilhamento em `src/og/`

## Fontes

Bricolage Grotesque e Atkinson Hyperlegible, licença SIL Open Font License (arquivos em `src/fontes/`).
