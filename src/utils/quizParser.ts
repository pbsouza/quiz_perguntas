import { Question, QuizSchema, QuestionType } from '../types/quiz';

/**
 * Cleans citation span tags such as [span_0](start_span), [span_0](end_span), <span>, etc.
 * that frequently appear in LLM responses and grounding data.
 */
export function cleanText(input: any): string {
  if (input === undefined || input === null) return '';
  let str = String(input);

  // 1. Remove [span_X](start_span) and [span_X](end_span) or any [span...](...)
  str = str.replace(/\[span[_\w\d]*\]\([^)]*\)/gi, '');

  // 2. Remove [span_X] or [span...] bracket artifacts
  str = str.replace(/\[span[_\w\d]*\]/gi, '');

  // 3. Remove html <span>, </span>, <span ...>
  str = str.replace(/<\/?span[^>]*>/gi, '');

  // 4. Remove any loose (start_span) or (end_span)
  str = str.replace(/\((?:start_span|end_span)\)/gi, '');

  // 5. Clean duplicated quotes like '' -> '
  str = str.replace(/''+/g, "'");

  // 6. Clean up spacing and spaces before punctuation
  str = str.replace(/[ \t]+/g, ' ');
  str = str.replace(/\s+([.,;:!?])/g, '$1');

  return str.trim();
}

/**
 * Shuffles an array using the modern Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles the options of a single question and updates correctOptionIndex / correctOptionIndices
 */
export function shuffleQuestionOptions(question: Question): Question {
  if (!question.options || question.options.length <= 1) {
    return { ...question };
  }

  // Create indexed list
  const indexed = question.options.map((opt, originalIndex) => ({
    opt,
    originalIndex,
  }));

  const shuffled = shuffleArray(indexed);
  const newOptions = shuffled.map(item => item.opt);

  if (question.type === 'multiple_select' && Array.isArray(question.correctOptionIndices)) {
    const originalSet = new Set(question.correctOptionIndices);
    const newCorrectIndices: number[] = [];
    shuffled.forEach((item, newIndex) => {
      if (originalSet.has(item.originalIndex)) {
        newCorrectIndices.push(newIndex);
      }
    });
    return {
      ...question,
      options: newOptions,
      correctOptionIndices: newCorrectIndices.sort((a, b) => a - b),
    };
  } else {
    // multiple_choice
    const originalCorrect = question.correctOptionIndex ?? 0;
    const newCorrectIndex = shuffled.findIndex(item => item.originalIndex === originalCorrect);

    return {
      ...question,
      options: newOptions,
      correctOptionIndex: newCorrectIndex !== -1 ? newCorrectIndex : 0,
    };
  }
}

export interface ShuffleConfig {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

/**
 * Shuffles questions order and/or options of each question in a quiz
 */
export function shuffleQuiz(quiz: QuizSchema, config: ShuffleConfig = { shuffleQuestions: true, shuffleOptions: true }): QuizSchema {
  let questions = [...quiz.questions];

  if (config.shuffleOptions) {
    questions = questions.map(q => shuffleQuestionOptions(q));
  }

  if (config.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  return {
    ...quiz,
    questions,
  };
}

/**
 * Normalizes any input JSON into a standardized QuizSchema structure.
 * Cleans text artifacts and tags, and optionally shuffles questions.
 */
export function normalizeQuizJson(raw: any, shouldShuffle: boolean = false): QuizSchema {
  if (!raw) {
    throw new Error("O conteúdo das perguntas está vazio ou não pôde ser lido.");
  }

  // If input is an array directly, wrap it in questions
  let rawQuestions: any[] = [];
  let title = "Questionário";
  let description = "";
  let videoUrl: string | undefined = undefined;
  let videoTitle: string | undefined = undefined;
  let videoDescription: string | undefined = undefined;

  if (Array.isArray(raw)) {
    // Check if it's a 2-part array: [ { video: "..." }, { questions: [...] } ]
    if (raw.length >= 2 && (raw[0]?.video || raw[0]?.videoUrl || raw[0]?.youtube || raw[0]?.parte1)) {
      const part1 = raw[0].parte1 || raw[0];
      videoUrl = part1.video || part1.videoUrl || part1.youtube || part1.link;
      videoTitle = part1.title || part1.titulo;
      videoDescription = part1.description || part1.descricao;

      const part2 = raw[1].parte2 || raw[1];
      if (Array.isArray(part2)) {
        rawQuestions = part2;
      } else if (Array.isArray(part2.questions)) {
        rawQuestions = part2.questions;
      } else if (Array.isArray(part2.questoes)) {
        rawQuestions = part2.questoes;
      } else if (Array.isArray(part2.perguntas)) {
        rawQuestions = part2.perguntas;
      } else {
        rawQuestions = raw.slice(1);
      }
    } else {
      rawQuestions = raw;
    }
  } else if (typeof raw === 'object') {
    title = cleanText(raw.title || raw.titulo || raw.name || raw.nome || "Questionário");
    description = cleanText(raw.description || raw.descricao || "");

    // Check Parte 1 (YouTube video)
    const part1 = raw.parte1 || raw.parte_1 || raw.part1;
    if (part1 && typeof part1 === 'object') {
      videoUrl = part1.video || part1.videoUrl || part1.youtube || part1.youtubeUrl || part1.link;
      videoTitle = part1.title || part1.titulo || raw.videoTitle || raw.video_title;
      videoDescription = part1.description || part1.descricao;
    } else if (typeof part1 === 'string') {
      videoUrl = part1;
    }

    if (!videoUrl) {
      videoUrl = raw.videoUrl || raw.video || raw.youtube || raw.youtubeUrl || raw.youtube_url || raw.video_url || raw.link;
    }
    if (!videoTitle) {
      videoTitle = raw.videoTitle || raw.video_title;
    }
    if (!videoDescription) {
      videoDescription = raw.videoDescription || raw.video_description;
    }

    // Check Parte 2 (Questions)
    const part2 = raw.parte2 || raw.parte_2 || raw.part2;
    if (Array.isArray(part2)) {
      rawQuestions = part2;
    } else if (part2 && typeof part2 === 'object') {
      if (Array.isArray(part2.questions)) rawQuestions = part2.questions;
      else if (Array.isArray(part2.questoes)) rawQuestions = part2.questoes;
      else if (Array.isArray(part2.perguntas)) rawQuestions = part2.perguntas;
      else if (Array.isArray(part2.items)) rawQuestions = part2.items;
    }

    if (rawQuestions.length === 0) {
      if (Array.isArray(raw.questions)) {
        rawQuestions = raw.questions;
      } else if (Array.isArray(raw.questoes)) {
        rawQuestions = raw.questoes;
      } else if (Array.isArray(raw.perguntas)) {
        rawQuestions = raw.perguntas;
      } else if (Array.isArray(raw.items)) {
        rawQuestions = raw.items;
      } else {
        throw new Error("Não foi encontrada uma lista de perguntas no conteúdo.");
      }
    }
  } else {
    throw new Error("Formato não reconhecido. Certifique-se de colar uma lista de perguntas.");
  }

  if (rawQuestions.length === 0) {
    throw new Error("A lista de questões está vazia.");
  }

  const normalizedQuestions: Question[] = rawQuestions.map((q, idx) => {
    const rawQuestionText = q.question || q.pergunta || q.enunciado || q.title || `Pergunta ${idx + 1}`;
    const rawExplanation = q.explanation || q.explicacao || q.justificativa || q.feedback || "";
    const rawOptions = q.options || q.alternativas || q.respostas || q.choices;

    const questionText = cleanText(rawQuestionText);
    const explanation = cleanText(rawExplanation);
    const options = Array.isArray(rawOptions) ? rawOptions.map(cleanText) : undefined;

    // Detect type
    let inferredType: QuestionType = 'multiple_choice';
    if (q.type) {
      const t = String(q.type).toLowerCase();
      if (['text', 'texto', 'input', 'campo', 'short_answer'].includes(t)) {
        inferredType = 'text';
      } else if (['multiple_select', 'checkbox', 'multipla_selecao', 'multi'].includes(t)) {
        inferredType = 'multiple_select';
      } else if (['boolean', 'verdadeiro_falso', 'vf', 'true_false'].includes(t)) {
        inferredType = 'boolean';
      } else if (['number', 'numero', 'numerico'].includes(t)) {
        inferredType = 'number';
      } else {
        inferredType = 'multiple_choice';
      }
    } else {
      if (q.correctBoolean !== undefined || q.verdadeiro !== undefined) {
        inferredType = 'boolean';
      } else if (Array.isArray(q.correctOptionIndices) || Array.isArray(q.respostasCorretasIndices)) {
        inferredType = 'multiple_select';
      } else if (q.correctAnswer !== undefined || q.respostaCorreta !== undefined || q.correctAnswers) {
        inferredType = 'text';
      } else if (Array.isArray(options)) {
        inferredType = 'multiple_choice';
      }
    }

    // Correct index
    let correctOptionIndex: number | undefined = undefined;
    if (q.correctOptionIndex !== undefined) {
      correctOptionIndex = Number(q.correctOptionIndex);
    } else if (q.correct_option_index !== undefined) {
      correctOptionIndex = Number(q.correct_option_index);
    } else if (q.correctIndex !== undefined) {
      correctOptionIndex = Number(q.correctIndex);
    } else if (q.respostaCorretaIndex !== undefined) {
      correctOptionIndex = Number(q.respostaCorretaIndex);
    } else if (inferredType === 'multiple_choice' && Array.isArray(options)) {
      if (typeof q.correctAnswer === 'string') {
        const cleanTarget = cleanText(q.correctAnswer).toLowerCase();
        const found = options.findIndex((opt: string) => opt.toLowerCase() === cleanTarget);
        if (found !== -1) correctOptionIndex = found;
      }
    }

    // Text answers
    let correctAnswer: string | number | undefined = q.correctAnswer ?? q.respostaCorreta;
    if (typeof correctAnswer === 'string') {
      correctAnswer = cleanText(correctAnswer);
    }
    let correctAnswers: string[] | undefined = undefined;
    if (Array.isArray(q.correctAnswers)) {
      correctAnswers = q.correctAnswers.map(cleanText);
    } else if (Array.isArray(q.respostasValidas)) {
      correctAnswers = q.respostasValidas.map(cleanText);
    } else if (correctAnswer !== undefined) {
      correctAnswers = [String(correctAnswer)];
    }

    // Boolean
    let correctBoolean: boolean | undefined = undefined;
    if (typeof q.correctBoolean === 'boolean') {
      correctBoolean = q.correctBoolean;
    } else if (typeof q.verdadeiro === 'boolean') {
      correctBoolean = q.verdadeiro;
    } else if (correctOptionIndex !== undefined && inferredType === 'boolean') {
      correctBoolean = correctOptionIndex === 0;
    }

    return {
      id: q.id || `q-${idx + 1}-${Math.random().toString(36).substring(2, 7)}`,
      question: questionText,
      type: inferredType,
      options,
      correctOptionIndex: correctOptionIndex !== undefined && !isNaN(correctOptionIndex) ? correctOptionIndex : (inferredType === 'multiple_choice' ? 0 : undefined),
      correctOptionIndices: Array.isArray(q.correctOptionIndices) ? q.correctOptionIndices.map(Number) : undefined,
      correctAnswer,
      correctAnswers,
      correctBoolean,
      explanation,
      category: q.category || q.categoria,
      placeholder: q.placeholder ? cleanText(q.placeholder) : undefined
    };
  });

  const finalQuestions = shouldShuffle ? shuffleArray(normalizedQuestions) : normalizedQuestions;

  return {
    title,
    description,
    videoUrl: videoUrl ? String(videoUrl).trim() : undefined,
    videoTitle: videoTitle ? cleanText(videoTitle) : undefined,
    videoDescription: videoDescription ? cleanText(videoDescription) : undefined,
    questions: finalQuestions
  };
}

/**
 * Checks whether user response is correct for any question type
 */
export function evaluateAnswer(question: Question, answer: any): boolean {
  if (answer === undefined || answer === null || answer === '') return false;

  switch (question.type) {
    case 'multiple_choice':
      return Number(answer) === question.correctOptionIndex;

    case 'boolean':
      if (question.correctBoolean !== undefined) {
        return Boolean(answer) === question.correctBoolean;
      }
      return Number(answer) === question.correctOptionIndex;

    case 'multiple_select':
      if (!Array.isArray(answer) || !Array.isArray(question.correctOptionIndices)) return false;
      const userSorted = [...answer].sort();
      const targetSorted = [...question.correctOptionIndices].sort();
      return (
        userSorted.length === targetSorted.length &&
        userSorted.every((val, index) => val === targetSorted[index])
      );

    case 'number':
      const numAnswer = parseFloat(String(answer).replace(',', '.'));
      const targetNum = parseFloat(String(question.correctAnswer).replace(',', '.'));
      if (isNaN(numAnswer) || isNaN(targetNum)) return false;
      return Math.abs(numAnswer - targetNum) < 0.001;

    case 'text':
    default:
      const cleanUser = cleanText(answer).toLowerCase();
      if (!cleanUser) return false;
      if (question.correctAnswers && question.correctAnswers.length > 0) {
        return question.correctAnswers.some(ans => cleanText(ans).toLowerCase() === cleanUser);
      }
      if (question.correctAnswer !== undefined) {
        return cleanText(question.correctAnswer).toLowerCase() === cleanUser;
      }
      return false;
  }
}
