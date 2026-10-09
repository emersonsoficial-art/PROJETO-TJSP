/* Jogo de perguntas (estilo Show do Milhão) — usa os cartões e as perguntas de data/jogo.js. */
(function () {
  const LEIS = { CF: "CF/88", CP: "Código Penal", CPP: "Código de Processo Penal", CPC: "CPC", J99: "Lei 9.099/95 (Juizados)", J12: "Lei 12.153/2009 (JEFP)",
    EST: "Estatuto Servidor SP", IMP: "Improbidade (Lei 8.429)", PCD: "Estatuto PcD", NOR: "Normas TJSP",
    LC: "LC 1.111/2010 (Plano de Cargos)", R85: "Res. TJSP 850/2021 (Teletrabalho)", R96: "Res. TJSP 963/2025 (eproc)", RI: "Regimento Interno TJSP" };
  const PREMIOS = [1000, 2000, 3000, 4000, 5000, 10000, 20000, 30000, 40000, 50000, 100000, 200000, 300000, 400000, 500000, 1000000];
  const SEGUROS = [4, 9, 14]; // índices dos pontos seguros (5 mil, 50 mil, 500 mil)
  const NIVEIS = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
  const brl = n => "R$ " + n.toLocaleString("pt-BR");
  const raiz = () => document.getElementById("jogo");
  const App = () => window.TJSPApp;
  let G = null;

  function embaralha(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  const baseRef = c => c.ref.split(" · ")[0];

  function cartoesDeJogo() {
    const todos = window.CARDS || [];
    return G && G.soEscolhidos ? todos.filter(App().noEscopo) : todos;
  }
  function curadas() {
    const cards = window.CARDS || [];
    const out = [];
    (window.JOGO || []).forEach(([l, ref, nivel, p, alts]) => {
      const card = cards.find(c => c.lei === LEIS[l] && baseRef(c).startsWith(ref));
      if (!card) return;
      if (G.soEscolhidos && !App().noEscopo(card)) return;
      out.push({ tipo: "curada", nivel, p, alts, card });
    });
    return out;
  }
  function limpaFrente(f) {
    return f.replace(/\s*\((?:arts?\.|art\.)[^)]*\)/gi, "").replace(/\s{2,}/g, " ").trim();
  }
  function autoArtigo(usados) {
    const cs = cartoesDeJogo().filter(c => !c.frente.startsWith("CERTO") && App().numArt(c) !== null && !usados.has(c.id) && !/\bart(s)?\.\s*\d/i.test(limpaFrente(c.frente)));
    const out = [];
    embaralha(cs).slice(0, 80).forEach(c => {
      const mesma = (window.CARDS || []).filter(x => x.lei === c.lei && baseRef(x) !== baseRef(c) && App().numArt(x) !== null);
      const nomes = [...new Set(mesma.map(baseRef))];
      if (nomes.length < 3) return;
      const n = App().numArt(c);
      const dist = nomes.map(k => ({ k, d: Math.abs(App().numArt(mesma.find(x => baseRef(x) === k)) - n) + Math.random() * 3 })).sort((a, b) => a.d - b.d).slice(0, 3).map(x => x.k);
      out.push({ tipo: "artigo", nivel: 2, p: "Qual dispositivo trata deste tema?\n" + limpaFrente(c.frente), alts: [baseRef(c)].concat(dist), card: c });
    });
    return out;
  }
  function verdadeiroFalso() {
    return cartoesDeJogo().filter(c => c.lei.startsWith("Pegadinhas") && /^(CERTO|ERRADO)/.test(c.verso)).map(c => ({
      tipo: "vf", nivel: 1, p: c.frente.replace(/^CERTO ou ERRADO\?\s*/, "Certo ou errado?\n"), alts: [/^CERTO/.test(c.verso) ? "Certo" : "Errado", /^CERTO/.test(c.verso) ? "Errado" : "Certo"], card: c, ordemFixa: true }));
  }

  function montarPerguntas(modo) {
    const cur = embaralha(curadas());
    const usadas = new Set(cur.map(q => q.card.id));
    const auto = autoArtigo(usadas);
    if (modo === "milhao") {
      const lista = []; const tomados = new Set();
      NIVEIS.forEach(n => {
        let q = cur.find(x => x.nivel === n && !tomados.has(x)) || cur.find(x => Math.abs(x.nivel - n) === 1 && !tomados.has(x)) || cur.find(x => !tomados.has(x));
        if (q) tomados.add(q); else q = auto.shift();
        if (q) lista.push(q);
      });
      return lista;
    }
    const vf = embaralha(verdadeiroFalso());
    const lista = cur.slice(0, 6).concat(auto.slice(0, 2), vf.slice(0, 2));
    return embaralha(lista).slice(0, 10);
  }

  function preparar(q) {
    const certa = q.alts[0];
    q.opcoes = q.ordemFixa ? q.alts.slice() : embaralha(q.alts);
    q.certa = q.opcoes.indexOf(certa);
    q.eliminadas = [];
    return q;
  }

  // ---------- telas ----------
  function tela() { const r = raiz(); r.replaceChildren(); return r; }
  function abrir() { if (!G || G.fase === "inicio" || G.fase === "fim") inicio(); else desenhar(); }

  function inicio() {
    G = { fase: "inicio", soEscolhidos: false };
    const r = tela();
    const est = App().estado(); const j = est.jogo || {};
    r.append(el("h2", null, "Jogo da lei seca"));
    r.append(el("p", "aviso", "Responda como na prova. Depois de cada resposta, o jogo mostra o artigo para você decorar. Quem erra uma pergunta volta para a revisão dos flashcards."));
    const modo = el("div", "jogo-modos");
    const b1 = el("button", "btn", "Show do Milhão (16 perguntas)");
    const b2 = el("button", "btn sec", "Treino rápido (10 perguntas)");
    modo.append(b1, b2); r.append(modo);
    const sel = App().selecaoAtiva();
    let cb = null;
    if (sel.length) {
      const lab = el("label", "jogo-esc"); cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = true;
      lab.append(cb, document.createTextNode(" Jogar só com os artigos que escolhi na Lei seca (" + sel.length + " artigos)"));
      r.append(lab);
    }
    r.append(el("p", "aviso", "Ajudas no Milhão: pular (3x), 50/50 (1x) e dica (1x). Pontos seguros: R$ 5 mil, R$ 50 mil e R$ 500 mil. Errar leva ao último ponto seguro; parar leva o que já ganhou."));
    r.append(el("p", "aviso", "Partidas: " + (j.partidas || 0) + " · Melhor prêmio: " + brl(j.melhor || 0) + " · Acertos: " + (j.acertos || 0) + " · Erros: " + (j.erros || 0)));
    const ir = modo => () => { G.soEscolhidos = !!(cb && cb.checked); comecar(modo); };
    b1.addEventListener("click", ir("milhao")); b2.addEventListener("click", ir("treino"));
  }

  function comecar(modo) {
    const qs = montarPerguntas(modo);
    if (qs.length < (modo === "milhao" ? 5 : 3)) { G.fase = "inicio"; const r = tela(); r.append(el("p", "aviso", "Poucas perguntas para os artigos escolhidos. Marque mais artigos na Lei seca ou jogue sem filtro.")); const b = el("button", "btn", "Voltar"); b.addEventListener("click", inicio); r.append(b); return; }
    G = Object.assign(G, { modo, fase: "pergunta", qs: qs.map(preparar), i: 0, ajudas: { pular: 3, meio: 1, dica: 1 }, ganho: 0, acertos: 0, erros: 0, respondida: false, dica: false });
    desenhar();
  }

  function desenhar() {
    const r = tela(); const q = G.qs[G.i]; const milhao = G.modo === "milhao";
    const topo = el("div", "jogo-topo");
    topo.append(el("span", "pilula", milhao ? "Pergunta " + (G.i + 1) + "/" + G.qs.length + " · vale " + brl(PREMIOS[G.i]) : "Pergunta " + (G.i + 1) + "/" + G.qs.length + " · acertos " + G.acertos));
    if (milhao) topo.append(el("span", "pilula", "Você tem " + brl(G.ganho)));
    r.append(topo);
    r.append(el("p", "jogo-pergunta", q.p));
    if (G.dica) r.append(el("p", "aviso", "Dica: a pergunta é de " + q.card.lei + "."));
    const ops = el("div", "jogo-ops");
    q.opcoes.forEach((o, k) => {
      const b = el("button", "jogo-op", String.fromCharCode(65 + k) + ") " + o);
      if (q.eliminadas.includes(k)) { b.disabled = true; b.classList.add("riscada"); }
      if (G.respondida) { b.disabled = true; if (k === q.certa) b.classList.add("certa"); else if (k === G.escolha) b.classList.add("errada"); }
      b.addEventListener("click", () => responder(k));
      ops.append(b);
    });
    r.append(ops);
    if (!G.respondida) {
      const aj = el("div", "jogo-ajudas");
      const mk = (txt, n, fn, off) => { const b = el("button", "chip", txt + " (" + n + ")"); b.disabled = n <= 0 || off; b.addEventListener("click", fn); aj.append(b); };
      mk("Pular", G.ajudas.pular, pular, false);
      mk("50/50", G.ajudas.meio, meio, q.opcoes.length < 4);
      mk("Dica", G.ajudas.dica, () => { G.ajudas.dica--; G.dica = true; desenhar(); }, G.dica);
      if (milhao) { const p = el("button", "chip", "Parar e levar " + brl(G.ganho)); p.addEventListener("click", () => fim("parou")); aj.append(p); }
      r.append(aj);
    } else {
      const ok = G.escolha === q.certa;
      r.append(el("p", ok ? "jogo-ok" : "jogo-erro", ok ? "Acertou!" : "Errou. A resposta certa é " + String.fromCharCode(65 + q.certa) + ")."));
      const caixa = el("div", "jogo-artigo");
      caixa.append(el("strong", null, "Para decorar — " + q.card.lei + " · " + q.card.ref));
      caixa.append(el("p", null, q.card.verso));
      if (q.card.conferir) caixa.append(el("p", "aviso", "Confira este artigo no texto atualizado da lei."));
      r.append(caixa);
      const nx = el("button", "btn", G.final ? "Ver resultado" : "Próxima");
      nx.addEventListener("click", () => G.final ? fim(G.final) : (G.i++, G.respondida = false, G.dica = false, desenhar()));
      r.append(nx);
    }
  }

  function pular() {
    G.ajudas.pular--;
    const atual = G.qs[G.i];
    const usados = new Set(G.qs.map(x => x.card.id));
    const pool = curadas().filter(x => !usados.has(x.card.id) && (x.nivel === atual.nivel || G.modo !== "milhao")).concat(autoArtigo(usados));
    const nova = pool[Math.floor(Math.random() * pool.length)];
    if (nova) G.qs[G.i] = preparar(nova);
    G.dica = false; desenhar();
  }
  function meio() {
    const q = G.qs[G.i]; G.ajudas.meio--;
    const erradas = q.opcoes.map((_, k) => k).filter(k => k !== q.certa && !q.eliminadas.includes(k));
    q.eliminadas = q.eliminadas.concat(embaralha(erradas).slice(0, 2));
    desenhar();
  }

  function marcarRevisao(card) {
    const est = App().estado(); const h = App().hoje();
    const p = est.cards[card.id] || { box: 0, due: h, acertos: 0, erros: 0 };
    p.box = 0; p.due = h; p.erros = (p.erros || 0) + 1; est.cards[card.id] = p;
  }
  function responder(k) {
    if (G.respondida) return;
    const q = G.qs[G.i]; G.respondida = true; G.escolha = k;
    const ok = k === q.certa; const milhao = G.modo === "milhao";
    if (ok) { G.acertos++; if (milhao) G.ganho = PREMIOS[G.i]; }
    else { G.erros++; marcarRevisao(q.card); }
    const ultima = G.i === G.qs.length - 1;
    G.final = (!ok && milhao) ? "errou" : (ultima ? "completou" : null);
    desenhar();
  }

  function fim(motivo) {
    const milhao = G.modo === "milhao"; const r = tela();
    let premio = G.ganho;
    if (milhao && motivo === "errou") { const seg = SEGUROS.filter(s => s < G.i); premio = seg.length ? PREMIOS[seg[seg.length - 1]] : 0; }
    const est = App().estado(); const j = est.jogo = est.jogo || { partidas: 0, melhor: 0, acertos: 0, erros: 0 };
    j.partidas++; j.acertos += G.acertos; j.erros += G.erros; if (milhao) j.melhor = Math.max(j.melhor, premio);
    App().salvar();
    r.append(el("h2", null, milhao ? (motivo === "completou" ? "Parabéns! Você é milionário da lei seca!" : motivo === "parou" ? "Você parou" : "Fim de jogo") : "Fim do treino"));
    r.append(el("p", "jogo-pergunta", milhao ? "Prêmio: " + brl(premio) : "Acertos: " + G.acertos + " de " + G.qs.length));
    r.append(el("p", "aviso", "Acertos: " + G.acertos + " · Erros: " + G.erros + (G.erros ? ". Os artigos que você errou voltaram para a revisão dos flashcards de hoje." : "")));
    const b = el("button", "btn", "Jogar de novo"); b.addEventListener("click", inicio); r.append(b);
    G.fase = "fim";
  }

  window.Jogo = { abrir };
})();
