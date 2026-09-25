import React, { useState } from 'react';
import { QuizSchema, QuestionAnswerState } from '../types/quiz';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Share2, Award, Download, Copy, Check, Video } from 'lucide-react';
import { cleanText } from '../utils/quizParser';

interface ResultsScreenProps {
  quiz: QuizSchema;
  answers: Record<number, QuestionAnswerState>;
  onRestart: () => void;
  onRetakeMissed: () => void;
  onGoToQuestion: (index: number) => void;
  onOpenShare?: () => void;
  onWatchVideo?: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  quiz,
  answers,
  onRestart,
  onRetakeMissed,
  onGoToQuestion,
  onOpenShare,
  onWatchVideo,
}) => {
  const total = quiz.questions.length;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;

  quiz.questions.forEach((_, idx) => {
    const ans = answers[idx];
    if (!ans || !ans.answered) {
      unanswered++;
    } else if (ans.isCorrect) {
      correct++;
    } else {
      wrong++;
    }
  });

  const percentage = Math.round((correct / total) * 100);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const text = `📊 Resultado do Quiz: ${quiz.title || 'Questionário'}\n` +
      `✅ Acertos: ${correct}/${total} (${percentage}%)\n` +
      `❌ Erros: ${wrong}\n` +
      `⏱️ Não respondidas: ${unanswered}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredQuestions = quiz.questions.map((q, idx) => ({ q, idx, ans: answers[idx] }))
    .filter(({ ans }) => {
      if (filter === 'correct') return ans?.answered && ans.isCorrect;
      if (filter === 'wrong') return !ans || !ans.answered || !ans.isCorrect;
      return true;
    });

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col py-6 px-4">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
          <Award className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {quiz.title || 'Questionário Concluído'}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Confira o resumo do seu desempenho abaixo
        </p>

        {/* Big percentage & metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#f1f3f5] rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Aproveitamento
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {percentage}%
            </span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Acertos
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 tabular-nums">
              {correct}
            </span>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">
              Erros
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-red-700 tabular-nums">
              {wrong + unanswered}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {quiz.videoUrl && onWatchVideo && (
            <button
              onClick={onWatchVideo}
              className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 border border-indigo-200"
            >
              <Video className="w-4 h-4 text-indigo-600" />
              Rever Vídeo da Aula
            </button>
          )}

          <button
            onClick={onRestart}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar Quiz
          </button>

          {wrong > 0 && (
            <button
              onClick={onRetakeMissed}
              className="px-5 py-2.5 bg-sky-200 hover:bg-sky-300 text-sky-950 text-sm font-semibold rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              Refazer Apenas Erradas ({wrong})
            </button>
          )}

          <button
            onClick={handleCopySummary}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-full flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado!' : 'Copiar Resumo'}
          </button>

          {onOpenShare && (
            <button
              onClick={onOpenShare}
              className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-sm font-semibold rounded-full flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-sky-200"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar Quiz
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          Revisão Detalhada ({filteredQuestions.length})
        </h2>
        <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({total})
          </button>
          <button
            onClick={() => setFilter('wrong')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'wrong' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-red-700'
            }`}
          >
            Erradas ({wrong + unanswered})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filter === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Corretas ({correct})
          </button>
        </div>
      </div>

      {/* Question review list */}
      <div className="flex flex-col gap-4">
        {filteredQuestions.map(({ q, idx, ans }) => {
          const isCorrect = ans?.answered && ans.isCorrect;
          return (
            <div
              key={idx}
              className={`rounded-2xl p-5 border transition-all ${
                isCorrect ? 'bg-white border-slate-200' : 'bg-red-50/30 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Questão {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#15803d] text-xs font-semibold px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acertou
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold px-2 py-0.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Errou
                    </span>
                  )}
                  <button
                    onClick={() => onGoToQuestion(idx)}
                    className="text-xs text-sky-700 hover:underline cursor-pointer"
                  >
                    Ver no Quiz
                  </button>
                </div>
              </div>

              <p className="text-[15px] font-medium text-slate-900 mb-3">
                {q.question}
              </p>

              {/* Show selected answer vs correct answer */}
              {q.options && (
                <div className="space-y-1.5 mb-3 text-sm">
                  {q.options.map((opt, optIdx) => {
                    const wasChosen = ans?.userAnswer === optIdx;
                    const isTarget = q.correctOptionIndex === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`px-3 py-2 rounded-xl text-xs sm:text-sm flex items-start gap-2 ${
                          isTarget
                            ? 'bg-emerald-50 text-emerald-900 font-medium border border-emerald-200'
                            : wasChosen
                            ? 'bg-red-100 text-red-900 line-through'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="font-semibold shrink-0">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                        {isTarget && (
                          <span className="ml-auto text-emerald-700 font-bold shrink-0">
                            (Gabarito)
                          </span>
                        )}
                        {wasChosen && !isTarget && (
                          <span className="ml-auto text-red-600 font-bold shrink-0">
                            (Sua resposta)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              {q.explanation && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs sm:text-sm text-slate-700 border border-slate-200/60">
                  <span className="font-semibold text-slate-900 block mb-1">Explicação:</span>
                  {cleanText(q.explanation)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
