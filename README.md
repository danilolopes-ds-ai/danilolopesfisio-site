# danilolopesfisio.com.br

Páginas de Danilo Lopes, Fisioterapeuta (CREFITO/3 198613-F):

- `/` início, com os dois caminhos
- `/avaliacao/` avaliação fisioterapêutica completa com relatório
- `/home-care/` fisioterapia para idosos em casa

Site estático, sem framework: HTML, CSS embutido na página e fontes próprias. Hospedado na Cloudflare Pages.

## Configuração na Cloudflare Pages

- Framework preset: None
- Build command: `node build.mjs`
- Build output directory: `public`

O build gera as páginas e confere tudo antes de publicar (veja abaixo). Se alguma conferência falhar, a Cloudflare não publica a versão quebrada e o site no ar continua o anterior.

## Mudar preços, contato ou textos fixos

1. Edite `src/dados.json` (valores, WhatsApp, região, local da avaliação, data de atualização).
2. Rode `node build.mjs` para gerar `public/` de novo e ver se passou nas conferências.
3. Envie para o GitHub. A Cloudflare publica sozinha.

Ao mudar qualquer conteúdo, atualize `atualizadoEm` em `src/dados.json`: a data aparece no rodapé (Resolução COFFITO nº 532/2021, art. 4º).

## O que o build confere

- nenhuma variável `{{ }}` ficou sem preencher
- todo link interno, imagem e âncora existe
- cada página tem um único `h1`, título e descrição em tamanho adequado
- o JSON-LD (dados estruturados para o Google) é válido
- nome, CREFITO e data de atualização aparecem em todas as páginas
- não aparece "especialista" ou "especializado" no texto
- o valor da sessão está definido (o da avaliação gera aviso se faltar)

No GitHub, a cada envio, o mesmo build roda e confere se a pasta `public/` enviada está igual à gerada.

## Estrutura

- `src/paginas/` uma página por arquivo; o bloco `<!--meta ... -->` no topo define título, descrição e mensagem do WhatsApp
- `src/partes/` cabeçalho, trena, "Quem atende" e rodapé, compartilhados
- `src/styles.css` todo o visual
- `src/plataforma/` `_headers` (segurança e cache) e `_redirects` (endereços alternativos)
- `src/img/danilo.webp` se existir, entra no lugar das iniciais em "Quem atende" (quadrada, 576 px)
- `ferramentas/gerar-imagens.py` gera as imagens de compartilhamento em `src/og/`

## Fontes

Bricolage Grotesque e Atkinson Hyperlegible, licença SIL Open Font License (arquivos em `src/fontes/`).
