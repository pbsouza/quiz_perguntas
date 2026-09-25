import LZString from 'lz-string';
import { QuizSchema } from '../types/quiz';
import { normalizeQuizJson } from './quizParser';

/**
 * Encodes a QuizSchema into a compressed URL hash string
 */
export function generateShareUrl(quiz: QuizSchema): string {
  try {
    const minified = {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        correctOptionIndices: q.correctOptionIndices,
        correctAnswer: q.correctAnswer,
        correctAnswers: q.correctAnswers,
        correctBoolean: q.correctBoolean,
        explanation: q.explanation,
        category: q.category,
      }))
    };

    const jsonString = JSON.stringify(minified);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#quiz=${compressed}`;
  } catch (error) {
    console.error('Error generating share URL:', error);
    return window.location.href;
  }
}

/**
 * Checks URL hash for an embedded quiz and extracts it
 */
export function parseQuizFromUrlHash(): QuizSchema | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('#quiz=')) {
      return null;
    }

    const encoded = hash.split('#quiz=')[1];
    if (!encoded) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed);
    return normalizeQuizJson(parsed, false);
  } catch (err) {
    console.error('Failed to parse quiz from URL hash:', err);
    return null;
  }
}

/**
 * Clears the quiz hash from browser history without refreshing the page
 */
export function clearQuizHashFromUrl(): void {
  try {
    const baseUrl = window.location.origin + window.location.pathname + window.location.search;
    window.history.replaceState(null, '', baseUrl);
  } catch (e) {
    // Ignore
  }
}
