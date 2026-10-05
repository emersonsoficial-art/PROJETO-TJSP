// Rotina semanal — 4h30 líquidas por dia (seg a sex), simulado no sábado, descanso no domingo.
// Base: Edital 02/2025 do TJSP (70 questões: Português 16, Direito 30, Gerais 24) + redação eliminatória.
// Seu último resultado: 29/70 (Port 7/16, Direito 13/30, Gerais 9/24) — por isso todo dia tem Português ou Direito forte.
// Horário: 10h às 15h (inclui pausas do 50/10). Para mudar a rotina, edite os blocos abaixo (minutos = tempo líquido).
// Dias: 0 = domingo, 1 = segunda ... 6 = sábado.

window.ROTINA = {
  1: { nome: "Segunda", blocos: [
    { materia: "Língua Portuguesa", tipo: "Teoria (interpretação e classes de palavras)", min: 60 },
    { materia: "Matemática", tipo: "Teoria + exercícios", min: 60 },
    { materia: "Direito Administrativo", tipo: "Estatuto dos Servidores (Lei 10.261/68)", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  2: { nome: "Terça", blocos: [
    { materia: "Língua Portuguesa", tipo: "Questões Vunesp", min: 60 },
    { materia: "Raciocínio Lógico", tipo: "Teoria + questões", min: 60 },
    { materia: "Direito Processual Civil", tipo: "Teoria + questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  3: { nome: "Quarta", blocos: [
    { materia: "Informática", tipo: "Windows, Word, Excel, Teams, OneDrive", min: 60 },
    { materia: "Direito Constitucional", tipo: "Arts. 5º ao 13, 37 a 41 e 92", min: 60 },
    { materia: "Legislação Especial", tipo: "NSCGJ, Resoluções 850/2021 e 963/2025", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  4: { nome: "Quinta", blocos: [
    { materia: "Língua Portuguesa", tipo: "Teoria (concordância, regência, crase, pontuação)", min: 60 },
    { materia: "Matemática", tipo: "Questões", min: 60 },
    { materia: "Direito Processual Penal", tipo: "Teoria + questões", min: 60 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Caderno de erros", min: 60 }
  ]},
  5: { nome: "Sexta", blocos: [
    { materia: "Língua Portuguesa", tipo: "Questões (pontos que mais errou)", min: 30 },
    { materia: "Redação", tipo: "Escrever 1 dissertação manuscrita + corrigir pelos critérios", min: 60 },
    { materia: "Direito Penal", tipo: "Arts. 293 a 359 (falsidade, funcionário público)", min: 30 },
    { materia: "Atualidades + Estatuto da Pessoa com Deficiência", tipo: "Fatos do ano + arts. 1º a 13 e 34 a 38", min: 30 },
    { materia: "Direito Administrativo", tipo: "Improbidade (Lei 8.429/92)", min: 30 },
    { materia: "Lei seca", tipo: "Flashcards", min: 30 },
    { materia: "Revisão", tipo: "Semana inteira", min: 60 }
  ]},
  6: { nome: "Sábado", blocos: [
    { materia: "Simulado", tipo: "70 questões no tempo da Vunesp", min: 240 },
    { materia: "Correção", tipo: "Corrigir e anotar erros", min: 60 }
  ]},
  0: { nome: "Domingo", descanso: true, blocos: [
    { materia: "Descanso", tipo: "Opcional: 15 min de flashcards", min: 0 }
  ]}
};

window.MATERIAS = [
  "Língua Portuguesa", "Matemática", "Raciocínio Lógico", "Informática", "Atualidades",
  "Direito Constitucional", "Direito Penal", "Direito Processual Penal",
  "Direito Processual Civil", "Direito Administrativo", "Legislação Especial",
  "Estatuto da Pessoa com Deficiência"
];
