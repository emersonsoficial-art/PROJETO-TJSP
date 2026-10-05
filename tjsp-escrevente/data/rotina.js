// Rotina semanal — 4h30 líquidas por dia (seg a sex), simulado no sábado, descanso no domingo.
// Lógica: suas 3 frentes fracas (Português, Matemática, Direito) aparecem TODA semana, e Português quase todo dia.
// Para mudar a rotina, edite os blocos abaixo (minutos = tempo líquido).
// Dias: 0 = domingo, 1 = segunda ... 6 = sábado.

window.ROTINA = {
  1: { nome: "Segunda", blocos: [
    { materia: "Língua Portuguesa", tipo: "Teoria (gramática)", min: 60 },
    { materia: "Matemática", tipo: "Teoria + exercícios", min: 60 },
    { materia: "Direito Processual Penal", tipo: "Teoria + questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  2: { nome: "Terça", blocos: [
    { materia: "Língua Portuguesa", tipo: "Questões Vunesp", min: 60 },
    { materia: "Matemática", tipo: "Questões", min: 60 },
    { materia: "Direito Processual Civil", tipo: "Teoria + questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  3: { nome: "Quarta", blocos: [
    { materia: "Língua Portuguesa", tipo: "Teoria (interpretação e sintaxe)", min: 60 },
    { materia: "Normas internas TJSP", tipo: "Leitura da norma + questões", min: 60 },
    { materia: "Direito Constitucional", tipo: "Teoria + questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  4: { nome: "Quinta", blocos: [
    { materia: "Matemática", tipo: "Teoria + exercícios", min: 60 },
    { materia: "Língua Portuguesa", tipo: "Questões Vunesp", min: 60 },
    { materia: "Direito Penal", tipo: "Teoria + questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  5: { nome: "Sexta", blocos: [
    { materia: "Língua Portuguesa", tipo: "Questões (pontos que mais errou)", min: 60 },
    { materia: "Raciocínio Lógico / Matemática", tipo: "Questões", min: 30 },
    { materia: "Informática", tipo: "Questões", min: 30 },
    { materia: "Atualidades", tipo: "Leitura + questões", min: 30 },
    { materia: "Direito (Processos + Constitucional + Penal)", tipo: "Questões mistas", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Semana inteira", min: 30 }
  ]},
  6: { nome: "Sábado", blocos: [
    { materia: "Simulado", tipo: "Prova completa no tempo da Vunesp", min: 240 },
    { materia: "Correção", tipo: "Corrigir e anotar erros", min: 60 }
  ]},
  0: { nome: "Domingo", descanso: true, blocos: [
    { materia: "Descanso", tipo: "Opcional: 15 min de flashcards", min: 0 }
  ]}
};

window.MATERIAS = [
  "Língua Portuguesa", "Matemática", "Raciocínio Lógico", "Informática", "Atualidades",
  "Direito Constitucional", "Direito Penal", "Direito Processual Penal",
  "Direito Processual Civil", "Normas internas TJSP", "Direito Administrativo", "Redação"
];
