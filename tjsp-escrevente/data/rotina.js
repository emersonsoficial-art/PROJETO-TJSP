// Rotina semanal — 5 horas líquidas por dia (seg a sex), simulado no sábado, descanso no domingo.
// Lógica: todo dia tem 1 matéria FRACA (mais tempo + questões) e 1 matéria FORTE (manutenção).
// Para mudar a rotina, edite os blocos abaixo (minutos = tempo líquido).
// Dias: 0 = domingo, 1 = segunda ... 6 = sábado.

window.ROTINA = {
  1: { nome: "Segunda", blocos: [
    { materia: "Direito Processual Penal", tipo: "Teoria", min: 90 },
    { materia: "Direito Processual Penal", tipo: "Questões", min: 60 },
    { materia: "Língua Portuguesa", tipo: "Questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  2: { nome: "Terça", blocos: [
    { materia: "Direito Processual Civil", tipo: "Teoria", min: 90 },
    { materia: "Direito Processual Civil", tipo: "Questões", min: 60 },
    { materia: "Direito Constitucional", tipo: "Questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  3: { nome: "Quarta", blocos: [
    { materia: "Normas internas TJSP", tipo: "Leitura da norma", min: 90 },
    { materia: "Normas internas TJSP", tipo: "Questões", min: 60 },
    { materia: "Direito Penal", tipo: "Questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  4: { nome: "Quinta", blocos: [
    { materia: "Matemática", tipo: "Teoria + exercícios", min: 90 },
    { materia: "Atualidades", tipo: "Leitura + questões", min: 60 },
    { materia: "Raciocínio Lógico", tipo: "Questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  5: { nome: "Sexta", blocos: [
    { materia: "Redação", tipo: "Escrever 1 texto", min: 90 },
    { materia: "Proc. Penal + Proc. Civil", tipo: "Questões mistas", min: 60 },
    { materia: "Informática", tipo: "Questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Semana inteira", min: 60 }
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
