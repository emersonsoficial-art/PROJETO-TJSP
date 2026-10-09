/* Escrevente TJSP — rotina, timer, lei seca com revisão espaçada e desempenho.
   Tudo roda no navegador; o progresso fica no localStorage (faça backup pela aba Desempenho). */
(function () {
  "use strict";

  // ---------- Armazenamento ----------
  const CHAVE = "tjsp-escrevente-v1";
  const INTERVALOS = [0, 1, 3, 7, 15, 30, 60]; // dias por caixa de revisão
  const NOVOS_POR_DIA = 15;

  function estadoPadrao() {
    return { config: { metaHoras: 4.5, metaQ: 40 }, dias: {}, cards: {}, selecaoLista: [] };
  }
  let estado = carregar();

  function carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (!bruto) return estadoPadrao();
      const e = JSON.parse(bruto);
      return Object.assign(estadoPadrao(), e, { config: Object.assign(estadoPadrao().config, e.config || {}) });
    } catch (_) { return estadoPadrao(); }
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (_) { /* modo privado: segue sem salvar */ }
  }

  // ---------- Datas ----------
  function chaveData(d) {
    const z = n => String(n).padStart(2, "0");
    return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  }
  function hoje() { return chaveData(new Date()); }
  function somarDias(chave, n) {
    const [a, m, d] = chave.split("-").map(Number);
    return chaveData(new Date(a, m - 1, d + n));
  }
  function diaSemana(chave) {
    const [a, m, d] = chave.split("-").map(Number);
    return new Date(a, m - 1, d).getDay();
  }
  function dia(chave) {
    chave = chave || hoje();
    if (!estado.dias[chave]) estado.dias[chave] = { seg: 0, blocos: [], questoes: [], novos: 0 };
    return estado.dias[chave];
  }
  function questoesDoDia(d) {
    return (d.questoes || []).reduce((s, q) => s + q.feitas, 0);
  }

  // ---------- Regras de disciplina ----------
  function rotinaDo(chave) { return window.ROTINA[diaSemana(chave)]; }
  function diaCumprido(chave) {
    const r = rotinaDo(chave);
    if (r.descanso) return null; // domingo não conta nem quebra a sequência
    const d = estado.dias[chave];
    if (!d) return false;
    const todosBlocos = r.blocos.length > 0 && r.blocos.every((_, i) => d.blocos[i]);
    if (todosBlocos) return true;
    const metaMin = r.blocos.reduce((s, b) => s + b.min, 0);
    const horasOk = d.seg / 60 >= metaMin * 0.8;
    if (diaSemana(chave) === 6) return horasOk; // sábado: simulado
    return horasOk && questoesDoDia(d) >= estado.config.metaQ * 0.8;
  }
  function ofensiva() {
    let n = 0;
    let c = hoje();
    if (diaCumprido(c) === false) c = somarDias(c, -1); // hoje ainda está em andamento
    for (let i = 0; i < 400; i++) {
      const ok = diaCumprido(c);
      if (ok === false) break;
      if (ok === true) n++;
      c = somarDias(c, -1);
    }
    return n;
  }

  // ---------- Utilidades de tela ----------
  const $ = s => document.querySelector(s);
  function el(tag, attrs, filhos) {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    });
    (filhos || []).forEach(f => e.append(f));
    return e;
  }
  function fmtHoras(seg) {
    const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60);
    return h + "h" + String(m).padStart(2, "0");
  }

  // ---------- Abas ----------
  document.querySelectorAll(".aba-btn").forEach(b => b.addEventListener("click", () => irPara(b.dataset.aba)));
  function irPara(nome) {
    document.querySelectorAll(".aba-btn").forEach(b => b.classList.toggle("ativa", b.dataset.aba === nome));
    document.querySelectorAll(".aba").forEach(a => a.classList.toggle("ativa", a.id === "aba-" + nome));
    if (nome === "desempenho") renderDesempenho();
    if (nome === "lei") renderLei();
    window.scrollTo(0, 0);
  }

  // ---------- HOJE ----------
  function renderHoje() {
    const c = hoje();
    const r = rotinaDo(c);
    const d = dia(c);
    const dataTxt = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    $("#hoje-data").textContent = dataTxt.charAt(0).toUpperCase() + dataTxt.slice(1);
    $("#hoje-titulo").textContent = r.descanso ? "Dia de descanso. Recupere a cabeça." :
      diaSemana(c) === 6 ? "Sábado de simulado" : "Foco: " + r.blocos[0].materia;

    const metaSeg = (r.descanso ? 0 : r.blocos.reduce((s, b) => s + b.min, 0)) * 60 || estado.config.metaHoras * 3600;
    const pctH = Math.min(100, (d.seg / metaSeg) * 100);
    $("#meta-horas-txt").textContent = fmtHoras(d.seg) + " / " + fmtHoras(metaSeg);
    const bh = $("#meta-horas-barra"); bh.style.width = pctH + "%"; bh.classList.toggle("completa", pctH >= 100);

    const q = questoesDoDia(d), metaQ = estado.config.metaQ;
    $("#meta-q-txt").textContent = q + " / " + metaQ;
    const bq = $("#meta-q-barra"); bq.style.width = Math.min(100, q / metaQ * 100) + "%"; bq.classList.toggle("completa", q >= metaQ);

    const lista = $("#lista-blocos");
    lista.replaceChildren();
    r.blocos.forEach((b, i) => {
      const feito = !!d.blocos[i];
      const check = el("input", { type: "checkbox", "aria-label": "Concluir " + b.materia });
      check.checked = feito;
      check.addEventListener("change", () => { d.blocos[i] = check.checked; salvar(); renderHoje(); });
      const filhos = [check, el("div", { class: "info" }, [
        el("div", { class: "materia", text: b.materia }),
        el("div", { class: "tipo", text: b.tipo })
      ])];
      if (b.min) filhos.push(el("span", { class: "min", text: b.min + " min" }));
      if (b.min && !r.descanso) filhos.push(el("button", { class: "ir", text: "Timer", onclick: () => {
        timer.rotulo = b.materia + " · " + b.tipo;
        $("#timer-bloco").textContent = timer.rotulo;
        if (b.materia === "Lei seca") { irPara("lei"); } else { irPara("timer"); }
      }}));
      lista.append(el("li", { class: "bloco" + (feito ? " feito" : "") }, filhos));
    });

    $("#ofensiva-num").textContent = ofensiva();
  }

  // Formulário de questões
  const selMateria = $("#q-materia");
  window.MATERIAS.forEach(m => selMateria.append(el("option", { value: m, text: m })));
  function materiaSugerida() {
    const r = rotinaDo(hoje());
    const m = r.blocos.find(b => window.MATERIAS.includes(b.materia));
    if (m) selMateria.value = m.materia;
  }
  $("#form-questoes").addEventListener("submit", e => {
    e.preventDefault();
    const feitas = parseInt($("#q-feitas").value, 10);
    const acertos = parseInt($("#q-acertos").value, 10);
    const msg = $("#q-msg");
    if (!(feitas > 0) || !(acertos >= 0) || acertos > feitas) { msg.textContent = "Acertos não podem passar do total feito."; return; }
    dia().questoes.push({ materia: selMateria.value, feitas, acertos });
    salvar();
    const pct = Math.round(acertos / feitas * 100);
    msg.textContent = pct >= 80 ? "Salvo. " + pct + "% — nível de aprovação." :
      pct >= 60 ? "Salvo. " + pct + "% — anote os erros no caderno." :
      "Salvo. " + pct + "% — revise a teoria antes do próximo bloco.";
    $("#q-feitas").value = ""; $("#q-acertos").value = "";
    renderHoje();
  });
  $("#form-horas").addEventListener("submit", e => {
    e.preventDefault();
    const m = parseInt($("#h-min").value, 10);
    if (m > 0) { dia().seg += m * 60; salvar(); $("#h-min").value = ""; renderHoje(); }
  });

  // ---------- TIMER ----------
  const timer = { focoMin: 50, pausaMin: 10, modo: "foco", restante: 50 * 60, rodando: false, fim: 0, ultimoTique: 0, intervalo: null, rotulo: "" };
  const PAUSAS = { 25: 5, 50: 10, 90: 15 };

  function desenharTimer() {
    const s = Math.max(0, Math.round(timer.restante));
    $("#timer-relogio").textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
    $("#timer-modo").textContent = timer.modo === "foco" ? "Foco" : "Pausa";
    $("#timer-iniciar").textContent = timer.rodando ? "Pausar" : (timer.restante < (timer.modo === "foco" ? timer.focoMin : timer.pausaMin) * 60 ? "Continuar" : "Iniciar");
    document.title = timer.rodando ? $("#timer-relogio").textContent + " · " + (timer.modo === "foco" ? "Foco" : "Pausa") : "Escrevente TJSP";
  }
  function creditarFoco() {
    // soma ao dia o tempo de foco decorrido desde o último tique
    if (timer.modo !== "foco" || !timer.ultimoTique) return;
    const agora = Date.now();
    const dt = Math.min(agora, timer.fim) - timer.ultimoTique;
    if (dt > 0) { dia().seg += dt / 1000; salvar(); }
    timer.ultimoTique = Math.min(agora, timer.fim);
  }
  function tique() {
    creditarFoco();
    timer.restante = (timer.fim - Date.now()) / 1000;
    if (timer.restante <= 0) terminarCiclo();
    desenharTimer();
    if ($("#aba-hoje").classList.contains("ativa")) renderHoje();
  }
  function iniciar() {
    if (timer.rodando) return pausar();
    if ("Notification" in window && Notification.permission === "default") {
      try { Notification.requestPermission(); } catch (_) {}
    }
    timer.rodando = true;
    timer.fim = Date.now() + timer.restante * 1000;
    timer.ultimoTique = Date.now();
    timer.intervalo = setInterval(tique, 1000);
    desenharTimer();
  }
  function pausar() {
    creditarFoco();
    clearInterval(timer.intervalo);
    timer.rodando = false;
    timer.restante = Math.max(0, (timer.fim - Date.now()) / 1000);
    timer.ultimoTique = 0;
    desenharTimer(); renderHoje();
  }
  function zerar() {
    if (timer.rodando) pausar();
    timer.modo = "foco";
    timer.restante = timer.focoMin * 60;
    desenharTimer();
  }
  function terminarCiclo() {
    clearInterval(timer.intervalo);
    timer.rodando = false; timer.ultimoTique = 0;
    const eraFoco = timer.modo === "foco";
    timer.modo = eraFoco ? "pausa" : "foco";
    timer.restante = (eraFoco ? timer.pausaMin : timer.focoMin) * 60;
    avisar(eraFoco ? "Fim do foco! Pausa de " + timer.pausaMin + " min." : "Pausa acabou. Bora voltar.");
    renderHoje();
  }
  function avisar(texto) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25, 0.5].forEach(t => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.2, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
      });
    } catch (_) {}
    try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (_) {}
    try { if ("Notification" in window && Notification.permission === "granted") new Notification("Escrevente TJSP", { body: texto }); } catch (_) {}
  }
  $("#timer-iniciar").addEventListener("click", iniciar);
  $("#timer-zerar").addEventListener("click", zerar);
  document.querySelectorAll(".timer-opcoes .chip").forEach(c => c.addEventListener("click", () => {
    if (timer.rodando) pausar();
    document.querySelectorAll(".timer-opcoes .chip").forEach(x => x.classList.toggle("ativo", x === c));
    timer.focoMin = Number(c.dataset.min); timer.pausaMin = PAUSAS[timer.focoMin];
    timer.modo = "foco"; timer.restante = timer.focoMin * 60;
    desenharTimer();
  }));
  window.addEventListener("beforeunload", () => { if (timer.rodando) creditarFoco(); });

  // ---------- LEI SECA ----------
  const CARDS = window.CARDS || [];
  const leis = [...new Set(CARDS.map(c => c.lei))];
  const filtro = $("#lei-filtro");
  filtro.append(el("option", { value: "", text: "Todas as leis (" + CARDS.length + ")" }));
  leis.forEach(l => filtro.append(el("option", { value: l, text: l + " (" + CARDS.filter(c => c.lei === l).length + ")" })));
  let fila = [], atual = null;

  function progresso(id) { return estado.cards[id] || null; }
  // Artigos escolhidos: estado.selecaoLista = chaves "lei|ref" (ref sem os "caiu/já caiu"). Vazio = vale o filtro de lei.
  const chaveDe = c => c.lei + "|" + c.ref.split(" · ")[0];
  const nomeDe = k => k.split("|")[1];
  function selecao() { return Array.isArray(estado.selecaoLista) ? estado.selecaoLista : []; }
  function noEscopo(c) {
    const sel = selecao();
    if (sel.length) return sel.includes(chaveDe(c));
    return !filtro.value || c.lei === filtro.value;
  }
  function normaliza(t) { return (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function numArt(c) {
    const m = c.ref.match(/\barts?\.\s*(\d+(?:\.\d{3})*)(?:-([A-Z]))?/);
    if (!m) return null;
    return Number(m[1].replace(/\./g, "")) + (m[2] ? (m[2].charCodeAt(0) - 64) / 100 : 0);
  }
  function cartoesDoTema(t) {
    return CARDS.filter(c => {
      if (filtro.value && c.lei !== filtro.value) return false;
      const n = numArt(c);
      return t.regras.some(r => r.lei === c.lei && (r.sem ? n === null : (r.de === undefined || (n !== null && n >= r.de && n <= r.ate))));
    });
  }
  function renderTemas() {
    const box = $("#lei-temas");
    box.replaceChildren();
    const q = normaliza($("#lei-busca").value), sel = selecao();
    let grupoAtual = null;
    (window.TEMAS || []).forEach(t => {
      if (q && !normaliza(t.nome).includes(q)) return;
      const cs = cartoesDoTema(t);
      if (!cs.length) return;
      if (t.grupo !== grupoAtual) { grupoAtual = t.grupo; const g = document.createElement("div"); g.className = "grupo"; g.textContent = t.grupo; box.append(g); }
      const ks = [...new Set(cs.map(chaveDe))];
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.checked = ks.every(k => sel.includes(k));
      cb.addEventListener("change", () => {
        const resto = selecao().filter(x => !ks.includes(x));
        estado.selecaoLista = cb.checked ? resto.concat(ks) : resto;
        salvar(); renderLei(false);
      });
      const lab = document.createElement("label");
      const span = document.createElement("span"); span.textContent = t.nome + " ";
      const sm = document.createElement("small"); sm.textContent = "(" + cs.length + (cs.length === 1 ? " cartão)" : " cartões)");
      span.append(sm); lab.append(cb, span); box.append(lab);
    });
  }
  function gruposVisiveis() {
    const q = normaliza($("#lei-busca").value);
    const grupos = new Map();
    CARDS.forEach(c => {
      if (filtro.value && c.lei !== filtro.value) return;
      const k = chaveDe(c);
      if (!grupos.has(k)) grupos.set(k, { n: 0, texto: "", lei: c.lei });
      const g = grupos.get(k); g.n++; g.texto += " " + c.ref + " " + c.frente;
    });
    return [...grupos].filter(([k, g]) => !q || normaliza(k + g.texto).includes(q));
  }
  function renderArtigos() {
    renderTemas();
    const lista = $("#lei-lista");
    lista.replaceChildren();
    const sel = selecao();
    gruposVisiveis().forEach(([k, g]) => {
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.checked = sel.includes(k);
      cb.addEventListener("change", () => {
        const atual = selecao().filter(x => x !== k);
        if (cb.checked) atual.push(k);
        estado.selecaoLista = atual; salvar(); renderLei(false);
      });
      const lab = document.createElement("label");
      const t = document.createElement("span"); t.textContent = nomeDe(k) + " ";
      const sm = document.createElement("small");
      sm.textContent = "(" + (filtro.value ? "" : g.lei + " · ") + g.n + (g.n === 1 ? " cartão)" : " cartões)");
      t.append(sm); lab.append(cb, t); lista.append(lab);
    });
    $("#lei-artigos-resumo").textContent = sel.length ? "Artigos escolhidos: " + sel.length + " (toque para mudar)" : "Escolher artigos para estudar";
  }
  $("#lei-busca").addEventListener("input", renderArtigos);
  $("#lei-todos").addEventListener("click", () => {
    const ks = gruposVisiveis().map(([k]) => k);
    estado.selecaoLista = [...new Set(selecao().concat(ks))];
    salvar(); renderLei(false);
  });
  $("#lei-limpar").addEventListener("click", () => {
    estado.selecaoLista = []; salvar(); renderLei(false);
  });
  function montarFila() {
    const h = hoje();
    const base = CARDS.filter(noEscopo);
    const revisoes = base.filter(c => { const p = progresso(c.id); return p && p.due <= h; })
      .sort((a, b) => progresso(a.id).due.localeCompare(progresso(b.id).due));
    const vagas = Math.max(0, NOVOS_POR_DIA - (dia().novos || 0));
    const novos = base.filter(c => !progresso(c.id)).slice(0, vagas);
    fila = revisoes.concat(novos);
  }
  function renderLei(refazerLista = true) {
    if (refazerLista !== false) $("#lei-busca").value = "";
    renderArtigos();
    montarFila();
    proximo();
    renderResumoLei();
  }
  function proximo() {
    atual = fila.shift() || null;
    $("#lei-pendentes").textContent = (atual ? fila.length + 1 : 0) + " para hoje";
    const flash = $("#flash");
    if (!atual) {
      $("#flash-ref").textContent = "";
      $("#flash-frente").textContent = "Revisão do dia concluída. Volte amanhã — é a repetição espaçada que fixa a lei.";
      $("#flash-verso").hidden = true; $("#flash-conferir").hidden = true;
      $("#flash-revelar").hidden = true; $("#flash-notas").hidden = true;
      flash.classList.add("vazio");
      return;
    }
    flash.classList.remove("vazio");
    $("#flash-ref").textContent = atual.lei + " · " + atual.ref + (progresso(atual.id) ? "" : " · novo");
    $("#flash-frente").textContent = atual.frente;
    const verso = $("#flash-verso"); verso.textContent = atual.verso; verso.hidden = true;
    $("#flash-conferir").hidden = true;
    $("#flash-revelar").hidden = false; $("#flash-notas").hidden = true;
  }
  $("#flash-revelar").addEventListener("click", () => {
    $("#flash-verso").hidden = false;
    $("#flash-conferir").hidden = !atual.conferir;
    $("#flash-revelar").hidden = true; $("#flash-notas").hidden = false;
  });
  document.querySelectorAll("#flash-notas button").forEach(b => b.addEventListener("click", () => {
    if (!atual) return;
    const nota = Number(b.dataset.nota);
    const h = hoje();
    let p = progresso(atual.id);
    if (!p) { p = { box: 0, due: h, acertos: 0, erros: 0 }; dia().novos = (dia().novos || 0) + 1; }
    if (nota === 0) { p.box = 0; p.due = h; p.erros++; fila.push(atual); }
    else if (nota === 1) { p.box = Math.max(1, p.box); p.due = somarDias(h, 1); }
    else { p.box = Math.min(INTERVALOS.length - 1, p.box + 1); p.due = somarDias(h, INTERVALOS[p.box]); p.acertos++; }
    estado.cards[atual.id] = p;
    salvar();
    proximo();
    renderResumoLei();
  }));
  filtro.addEventListener("change", renderLei);

  function renderResumoLei() {
    const box = $("#lei-resumo");
    box.replaceChildren(el("h3", { text: "Domínio por lei" }));
    leis.forEach(l => {
      const cs = CARDS.filter(c => c.lei === l);
      const dominados = cs.filter(c => { const p = progresso(c.id); return p && p.box >= 3; }).length;
      const vistos = cs.filter(c => progresso(c.id)).length;
      box.append(el("div", { class: "lei-linha" }, [
        el("span", { text: l }),
        el("span", { text: dominados + " dominados · " + vistos + "/" + cs.length + " vistos" })
      ]));
    });
    if (!leis.includes("Normas TJSP")) {
      box.append(el("p", { class: "aviso", text: "Normas internas TJSP: adicione cartões em data/flashcards/normas-tjsp.js." }));
    }
  }

  // ---------- DESEMPENHO ----------
  function renderDesempenho() {
    const h = hoje();
    const ult = [];
    for (let i = 13; i >= 0; i--) ult.push(somarDias(h, -i));
    let seg = 0, q = 0, cumpridos = 0, uteis = 0;
    ult.forEach(c => {
      const d = estado.dias[c];
      if (d) { seg += d.seg; q += questoesDoDia(d); }
      const ok = diaCumprido(c);
      if (ok !== null && c !== h) { uteis++; if (ok) cumpridos++; }
    });
    $("#d-horas").textContent = fmtHoras(seg);
    $("#d-questoes").textContent = q;
    $("#d-cumpridos").textContent = cumpridos + "/" + uteis;

    // acerto por matéria (histórico completo)
    const porMateria = {};
    let tf = 0, ta = 0;
    Object.values(estado.dias).forEach(d => (d.questoes || []).forEach(x => {
      porMateria[x.materia] = porMateria[x.materia] || { f: 0, a: 0 };
      porMateria[x.materia].f += x.feitas; porMateria[x.materia].a += x.acertos;
      tf += x.feitas; ta += x.acertos;
    }));
    $("#d-acerto").textContent = tf ? Math.round(ta / tf * 100) + "%" : "–";

    const tab = $("#tabela-materias");
    tab.replaceChildren(el("tr", {}, [el("th", { text: "Matéria" }), el("th", { text: "Questões", class: "num" }), el("th", { text: "Acerto", class: "num" })]));
    const linhas = Object.entries(porMateria).sort((a, b) => (a[1].a / a[1].f) - (b[1].a / b[1].f));
    if (!linhas.length) tab.append(el("tr", {}, [el("td", { text: "Registre questões na aba Hoje para ver seus pontos fracos aqui.", colspan: "3" })]));
    linhas.forEach(([m, v]) => {
      const pct = Math.round(v.a / v.f * 100);
      tab.append(el("tr", {}, [
        el("td", { text: m }), el("td", { text: v.f, class: "num" }),
        el("td", { text: pct + "%", class: "num " + (pct < 60 ? "ruim" : pct >= 80 ? "bom" : "") })
      ]));
    });

    // gráfico de horas
    const g = $("#grafico");
    g.replaceChildren();
    const metaH = estado.config.metaHoras;
    const maxH = Math.max(metaH * 1.2, ...ult.map(c => (estado.dias[c] ? estado.dias[c].seg / 3600 : 0)));
    ult.forEach(c => {
      const hs = estado.dias[c] ? estado.dias[c].seg / 3600 : 0;
      const [, , dd] = c.split("-");
      g.append(el("div", { class: "col", title: c + ": " + hs.toFixed(1) + " h" }, [
        el("div", { class: "barra-v" + (hs >= metaH * 0.8 ? " ok" : ""), style: "height:" + (hs / maxH * 100) + "%" }),
        el("span", { class: "rot", text: dd })
      ]));
    });
    g.append(el("div", { class: "linha-meta", style: "bottom:calc(" + (metaH / maxH) + " * (100% - 18px) + 16px)", title: "Meta: " + metaH + " h" }));

    $("#aj-horas").value = estado.config.metaHoras;
    $("#aj-q").value = estado.config.metaQ;
  }
  $("#form-ajustes").addEventListener("submit", e => {
    e.preventDefault();
    estado.config.metaHoras = Number($("#aj-horas").value) || 4.5;
    estado.config.metaQ = Number($("#aj-q").value) || 50;
    salvar(); renderDesempenho(); renderHoje();
  });

  // Backup
  $("#btn-exportar").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: "backup-tjsp-" + hoje() + ".json" });
    document.body.append(a); a.click(); a.remove();
  });
  $("#btn-importar").addEventListener("change", e => {
    const arq = e.target.files[0];
    if (!arq) return;
    arq.text().then(t => {
      try {
        const novo = JSON.parse(t);
        if (!novo.dias || !novo.cards) throw new Error("formato");
        estado = Object.assign(estadoPadrao(), novo);
        salvar(); renderHoje(); renderDesempenho();
        alert("Backup restaurado.");
      } catch (_) { alert("Arquivo de backup inválido."); }
    });
  });

  // ---------- Início ----------
  materiaSugerida();
  renderHoje();
  desenharTimer();
  // virada do dia com o app aberto
  setInterval(() => { if (!timer.rodando) renderHoje(); }, 60000);
})();
