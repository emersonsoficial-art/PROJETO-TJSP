# Escrevente TJSP

Meu sistema de estudos para o concurso de **Escrevente Técnico Judiciário do TJSP** (banca Vunesp).

Um app que abre no celular e no computador, com:

- **Hoje** — os blocos de estudo do dia, metas de horas líquidas e de questões, registro de acertos
- **Timer** — foco/pausa (50/10, 25/5, 90/15); só o tempo de foco conta como hora líquida
- **Lei seca** — flashcards com revisão espaçada (CF/88, Código Penal, CPP, CPC, Estatuto do Servidor de SP, Normas do TJSP)
- **Desempenho** — horas e questões dos últimos 14 dias, % de acerto por matéria (piores no topo), dias cumpridos e sequência

E a parte de texto em [`conteudo/`](conteudo/): rotina e método, caderno de erros, registro de simulados e lista de artigos prioritários.

## Como usar

**No celular (recomendado):** publique no GitHub Pages (abaixo), abra o link no navegador e use “Adicionar à tela inicial”. Vira um ícone como um app.

**No computador:** basta abrir o `index.html` no navegador.

O progresso fica salvo no navegador do aparelho. Use **Desempenho → Baixar backup** toda semana — e para levar o progresso de um aparelho para outro, baixe em um e restaure no outro.

## Publicar no GitHub Pages (grátis)

1. No repositório, vá em **Settings → Pages**.
2. Em *Source*, escolha **Deploy from a branch**.
3. Em *Branch*, escolha **main** e pasta **/ (root)**. Clique em **Save**.
4. Em 1–2 minutos aparece o link: `https://SEU-USUARIO.github.io/tjsp-escrevente/`

> Repositório privado não publica no Pages no plano gratuito. Se quiser o app online, deixe o repositório público (não há dados pessoais nele — seu progresso fica só no seu navegador).

## Estrutura

```
tjsp-escrevente/
├── index.html              ← o app
├── css/style.css
├── js/app.js
├── data/
│   ├── rotina.js           ← blocos de cada dia da semana (edite aqui)
│   └── flashcards/         ← um arquivo por lei
│       ├── cf88.js
│       ├── codigo-penal.js
│       ├── cpp.js
│       ├── cpc.js
│       ├── estatuto-sp.js
│       └── normas-tjsp.js  ← modelo para você preencher
└── conteudo/
    ├── rotina-e-metodo.md
    ├── caderno-de-erros.md
    ├── simulados/registro.md
    └── lei-seca/artigos-prioritarios.md
```

## Adicionar flashcards

Abra o arquivo da lei em `data/flashcards/` (dá para editar direto no site do GitHub, no ícone de lápis) e acrescente um item no mesmo formato:

```js
{ id: "cpp-16", lei: "CPP", ref: "Art. 41",
  frente: "Quais são os requisitos da denúncia?",
  verso: "Exposição do fato criminoso com todas as circunstâncias, qualificação do acusado..." },
```

- O `id` precisa ser único (é ele que guarda seu progresso no cartão).
- Para uma lei nova, crie um arquivo e adicione a linha `<script src="data/flashcards/NOME.js"></script>` no `index.html`.
- Regra de ouro: **toda questão de lei seca que você errar vira um cartão.**

## Como a revisão espaçada funciona

| Botão | O que acontece |
|---|---|
| Errei | o cartão volta para o fim da fila de hoje |
| Difícil | aparece de novo amanhã |
| Acertei | o intervalo cresce: 1 → 3 → 7 → 15 → 30 → 60 dias |

Entram até 15 cartões novos por dia. Um cartão é considerado “dominado” a partir do intervalo de 7 dias.

## Aviso

Os cartões resumem o texto legal para memorização. Confira sempre com a lei atualizada (planalto.gov.br e site do TJSP) e com o conteúdo programático do edital. Cartões marcados com “confira este artigo” têm a numeração a verificar no texto vigente.
