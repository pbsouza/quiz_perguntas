import React from 'react';
import { Share2, Check, X, FileCode, Video } from 'lucide-react';
import { QuestionAnswerState } from '../types/quiz';

interface QuizTopBarProps {
  currentIndex: number;
  totalQuestions: number;
  answers: Record<number, QuestionAnswerState>;
  onShare?: () => void;
  onEditQuestions?: () => void;
  onSelectIndex?: (index: number) => void;
  onSwitchToVideo?: () => void;
  hasVideo?: boolean;
}

export const QuizTopBar: React.FC<QuizTopBarProps> = ({
  currentIndex,
  totalQuestions,
  answers,
  onShare,
  onEditQuestions,
  onSelectIndex,
  onSwitchToVideo,
  hasVideo,
}) => {
  // Calculate correct and wrong counts
  let correctCount = 0;
  let wrongCount = 0;

  Object.values(answers).forEach(ans => {
    if (ans.answered) {
      if (ans.isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }
  });

  const progressPercent = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const useContinuousBar = totalQuestions > 20;

  return (
    <div className="w-full max-w-full flex flex-col gap-2.5 pb-2.5 select-none">
      
      {/* Top action row: Question counter & Score & Quick actions */}
      <div className="flex items-center justify-between gap-2 w-full">
        {/* Progress text */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
            {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            ({progressPercent}%)
          </span>
        </div>

        {/* Right side: Score badges and actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Wrong answers badge */}
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold tabular-nums">
            <X className="w-3 h-3 stroke-[2.5]" />
            {wrongCount}
          </span>

          {/* Correct answers badge */}
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold tabular-nums">
            <Check className="w-3 h-3 stroke-[2.5]" />
            {correctCount}
          </span>

          {/* Video shortcut if quiz has video */}
          {hasVideo && onSwitchToVideo && (
            <button
              type="button"
              onClick={onSwitchToVideo}
              title="Voltar ao vídeo da aula (Parte 1)"
              className="p-1 sm:px-2.5 sm:py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200/80 shrink-0"
            >
              <Video className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline sm:inline">Vídeo</span>
            </button>
          )}

          {/* Optional edit shortcut inside topbar */}
          {onEditQuestions && (
            <button
              type="button"
              onClick={onEditQuestions}
              title="Editar questões"
              className="p-1 sm:px-2 sm:py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          )}

          {/* Share icon button */}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              title="Compartilhar Quiz"
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar - 100% Fluid & NEVER causes horizontal overflow */}
      {useContinuousBar ? (
        /* Continuous bar for larger quizzes (e.g. 50 questions) */
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
          <div
            className="bg-slate-800 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      ) : (
        /* Segmented dashed progress bar for smaller quizzes (<= 20 questions) */
        <div className="w-full flex items-center gap-1 overflow-hidden py-0.5">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isAnswered = answers[idx]?.answered;
            const isCorrect = answers[idx]?.isCorrect;
            const isCurrent = idx === currentIndex;
            const isPastOrCurrent = idx <= currentIndex;

            let segmentColor = "bg-slate-200";
            if (isAnswered) {
              segmentColor = isCorrect ? "bg-emerald-500" : "bg-rose-500";
            } else if (isCurrent) {
              segmentColor = "bg-slate-900";
            } else if (isPastOrCurrent) {
              segmentColor = "bg-slate-600";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectIndex && onSelectIndex(idx)}
                title={`Pergunta ${idx + 1}`}
                className={`h-1.5 sm:h-2 rounded-full flex-1 min-w-0 transition-all duration-150 cursor-pointer ${segmentColor} ${
                  isCurrent ? 'ring-1 ring-offset-1 ring-slate-400' : ''
                }`}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};
