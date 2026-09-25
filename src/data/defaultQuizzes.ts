import { QuizSchema } from '../types/quiz';

export const SPANISH_QUIZ_PRESET: QuizSchema = {
  title: "Expressões e Gramática em Espanhol",
  description: "Estudo prático de expressões idiomáticas e preposições em espanhol com explicações detalhadas.",
  videoUrl: "https://www.youtube.com/watch?v=k1t64lF4-s0",
  videoTitle: "Vídeo da Aula: Expressões e Vocabulário",
  videoDescription: "Assista com atenção ao vídeo da lição antes de avançar para a resolução das questões.",
  questions: [
    {
      question: "Na frase em espanhol 'Para sacarle todo el jugo a la lectura de la Biblia', por que usam 'sacarle' junto com a palavra 'a'?",
      options: [
        "Porque 'sacarle... a' é a combinação padrão em espanhol para indicar de onde ou de quem estamos tirando o proveito.",
        "Porque a palavra 'a' serve apenas para enfeitar a frase, mas não tem função.",
        "Porque 'sacarle' significa apenas ler o texto bem rápido.",
        "Porque substitui o nome da Bíblia para não repetir a palavra."
      ],
      correctOptionIndex: 0,
      explanation: "Pense assim: enquanto em português dizemos 'tirar o suco DE alguma coisa', em espanhol a expressão é 'sacarLE el jugo A esa cosa'. O 'le' e o 'a' caminham juntos nessa expressão!"
    },
    {
      question: "No trecho 'Cuando Jehová nos mira, no se fija en nuestros errores del pasado', o que significa 'fijarse en'?",
      options: [
        "Reparar, notar ou prestar atenção em algo.",
        "Apertar ou prender algo com força.",
        "Esquecer completamente de um erro.",
        "Discutir por causa de uma falha antiga."
      ],
      correctOptionIndex: 0,
      explanation: "Enquanto em português dizemos 'reparar EM' ou 'reparar NOS erros', em espanhol a estrutura correspondente é 'fijarse EN' (prestar atenção / reparar em)."
    },
    {
      question: "Na lição sobre o perdão, o artigo diz que Jeová 'no nos va a echar en cara nuestros pecados'. O que significa 'echar en cara'?",
      options: [
        "Jogar na cara / jogar em rosto / ficar cobrando um erro do passado.",
        "Olhar nos olhos de alguém enquanto fala.",
        "Elogiar uma pessoa na frente de todos.",
        "Escrever uma carta com conselhos."
      ],
      correctOptionIndex: 0,
      explanation: "'Echar en cara' é o nosso famoso 'jogar na cara', ou seja, ficar relembrando uma falha que a pessoa cometeu para deixá-la envergonhada."
    },
    {
      question: "Quando o estudo fala de alguém que tem dificuldade para 'llevarse bien con alguien de la congregación', o que significa 'llevarse bien con'?",
      options: [
        "Dar-se bem com / ter uma boa convivência com alguém.",
        "Carregar as bolsas e pertences de outra pessoa.",
        "Morar na mesma casa que o irmão.",
        "Concordar com absolutamente tudo o que o outro diz."
      ],
      correctOptionIndex: 0,
      explanation: "'Llevarse bien con alguien' é a forma padrão em espanhol para dizer que duas pessoas 'se dão bem' ou têm uma amizade saudável."
    },
    {
      question: "No parágrafo 5 do estudo do dia 28 de setembro, lê-se que 'el amor y la obediencia van de la mano'. O que essa expressão quer dizer?",
      options: [
        "Andam juntos / estão intimamente ligados.",
        "São atitudes opostas que atrapalham o estudante.",
        "Exigem que as pessoas andem de mãos dadas fisicamente.",
        "São coisas difíceis que devem ser feitas separadamente."
      ],
      correctOptionIndex: 0,
      explanation: "'Ir de la mano' é uma expressão figurada muito comum para dizer que duas coisas 'andam de mãos dadas', ou seja, acontecem juntas e estão conectadas."
    },
    {
      question: "No relato dos gabaonitas, diz-se que 'no mencionaron Jericó ni Hai porque, a fin de cuentas, venían de una tierra lejana'. O que significa 'a fin de cuentas'?",
      options: [
        "Afinal de contas / no fim das contas.",
        "Depois de calcular todos os gastos da viagem.",
        "Por causa de um problema de dinheiro.",
        "Quando a conta bancária é paga."
      ],
      correctOptionIndex: 0,
      explanation: "'A fin de cuentas' funciona exatamente como o nosso 'afinal de contas' ou 'no fim das contas', usado para explicar o motivo final de algo."
    },
    {
      question: "Na frase 'Demostremos nuestra fe apoyándonos en Jehová', o que significa 'apoyarse en'?",
      options: [
        "Apoiando-nos em / buscando amparo e confiança em alguém.",
        "Ficando longe para não incomodar a pessoa.",
        "Empurrando a pessoa para que ela ande rápido.",
        "Imitando exatamente o modo de falar de alguém."
      ],
      correctOptionIndex: 0,
      explanation: "Igualzinho ao português, 'apoyarse en alguien' significa buscar apoio, firmeza e amparo em alguém nos momentos difíceis."
    },
    {
      question: "No artigo sobre resolver problemas interpessoais ('Curemos la herida cuanto antes'), o texto diz que para ofensas pequenas podemos 'decidir pasar por alto la ofensa'. O que significa 'pasar por alto'?",
      options: [
        "Passar por cima / ignorar / relevar a ofensa sem guardar mágoa.",
        "Falar em tom de voz bem alto para resolver o problema.",
        "Contar a falha para outras pessoas da congregação.",
        "Anotar a ofensa em um caderno para não esquecer."
      ],
      correctOptionIndex: 0,
      explanation: "'Pasar por alto' significa não dar importância a uma falha boba, relevando ou 'passando por cima' para manter a paz."
    },
    {
      question: "Se você quer dizer em espanhol 'Eu sugiro que você fique atenta à resposta de Jeová', qual frase abaixo está correta?",
      options: [
        "Te sugiero que estés atenta a la respuesta de Jehová.",
        "Te sugiero que estés atenta en la respuesta de Jehová.",
        "Te sugiero que estés atenta por la respuesta de Jehová.",
        "Te sugiero que estés atenta con la respuesta de Jehová."
      ],
      correctOptionIndex: 0,
      explanation: "Em espanhol, quem está atento, fica sempre **atento A** alguma coisa (*atenta A la respuesta*)."
    },
    {
      question: "Qual é a diferença de sentido entre 'Aprovechar una oportunidade' e 'Aprovecharse de un hermano'?",
      options: [
        "'Aprovechar' é fazer bom uso de algo positivo; 'Aprovecharse de' é tirar vantagem esperta de alguém (malícia).",
        "As duas expressões significam a mesma coisa.",
        "'Aprovechar' é um insulto, enquanto 'Aprovecharse de' é um elogio.",
        "'Aprovecharse de' significa ajudar alguém sem pedir nada em troca."
      ],
      correctOptionIndex: 0,
      explanation: "Cuidado com essa diferença: *Aprovechar la oportunidad* = aproveitar bem uma oportunidade (positivo). *Aprovecharse de alguien* = tirar vantagem ou 'passar a perna' em alguém (negativo)."
    }
  ]
};

// Preset showcasing multiple input types (Radio, Text Field, Checkboxes, Boolean, Number)
export const MULTI_TYPE_QUIZ_PRESET: QuizSchema = {
  title: "Demonstração de Múltiplos Tipos de Entrada",
  description: "Exemplo dinâmico com radio buttons, caixas de seleção, campo de texto aberto e valor verdadeiro/falso.",
  questions: [
    {
      type: "multiple_choice",
      question: "No parágrafo 18 do mesmo artigo, lê-se: 'El Todopoderoso se fija en nosotros', traduzindo a ideia de que Deus presta atenção/repara em nós. Qual preposição rege obrigatoriamente o verbo pronominal fijarse quando significa 'prestar atenção' ou 'notar algo'?",
      options: [
        "a",
        "sobre",
        "por",
        "en"
      ],
      correctOptionIndex: 3,
      explanation: "O verbo pronominal 'fijarse' exige rigorosamente a preposição 'en' (fijarse en alguien/algo) para significar 'notar' ou 'reparar em'."
    },
    {
      type: "text",
      question: "Preencha a lacuna: Em espanhol, para dizer 'jogar na cara' usa-se a expressão 'echar en ______'.",
      placeholder: "Digite a palavra que falta...",
      correctAnswer: "cara",
      correctAnswers: ["cara", "la cara"],
      explanation: "A expressão idiomática correta é 'echar en cara'."
    },
    {
      type: "multiple_select",
      question: "Quais das alternativas abaixo são expressões idiomáticas com verbos de movimento em espanhol? (Selecione todas as corretas)",
      options: [
        "Ir de la mano (andar de mãos dadas / caminhar juntos)",
        "Pasar por alto (relevar / não dar importância)",
        "Estar en las nubes (estar distraído)",
        "Computadora de mesa (computador de mesa)"
      ],
      correctOptionIndices: [0, 1, 2],
      explanation: "'Ir de la mano', 'pasar por alto' e 'estar en las nubes' são expressões idiomáticas consagradas. 'Computadora de mesa' é apenas um substantivo comum."
    },
    {
      type: "boolean",
      question: "Em espanhol, a expressão 'llevarse bien con' significa carregar bagagens e objetos pesados de alguém. Esta afirmação é verdadeira ou falsa?",
      correctBoolean: false,
      explanation: "Falso! 'Llevarse bien con alguien' significa ter uma convivência harmoniosa, dar-se bem com alguém."
    },
    {
      type: "number",
      question: "No espanhol, quantas formas de particípio irregular possui o verbo 'imprimir'? (Ex: impreso / imprimido)",
      placeholder: "Digite o número...",
      correctAnswer: 2,
      explanation: "Possui 2 formas admitidas pela Real Academia Espanhola (RAE): 'impreso' e 'imprimido'."
    }
  ]
};

export const PRESETS: { id: string; name: string; schema: QuizSchema }[] = [
  {
    id: "spanish",
    name: "Espanhol Bíblico (Exemplo do Prompt)",
    schema: SPANISH_QUIZ_PRESET
  },
  {
    id: "multitype",
    name: "Múltiplos Tipos de Entrada (Schema Dinâmico)",
    schema: MULTI_TYPE_QUIZ_PRESET
  }
];
