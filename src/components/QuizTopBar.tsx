import React from 'react';
import { Share2, Check, X } from 'lucide-react';
import { QuestionAnswerState } from '../types/quiz';

interface QuizTopBarProps {
  currentIndex: number;
  totalQuestions: number;
  answers: Record<number, QuestionAnswerState>;
  onShare?: () => void;
  onSelectIndex?: (index: number) => void;
}

export const QuizTopBar: React.FC<QuizTopBarProps> = ({
  currentIndex,
  totalQuestions,
  answers,
  onShare,
  onSelectIndex,
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

  return (
    <div className="w-full flex flex-col gap-3 pb-3">
      {/* Top action row */}
      <div className="flex items-center justify-end">
        <button
          onClick={onShare}
          title="Compartilhar Quiz"
          className="p-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5 stroke-[2]" />
        </button>
      </div>

      {/* Segmented bar and counters row - matching screenshot */}
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Dash segments */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 overflow-x-auto py-1 scrollbar-none">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const isAnswered = answers[idx]?.answered;
            const isCorrect = answers[idx]?.isCorrect;
            const isCurrent = idx === currentIndex;
            const isPastOrCurrent = idx <= currentIndex;

            // In the screenshot, segments are small rounded horizontal dashes
            // Active up to current question is dark charcoal; future is light grey.
            let segmentColor = "bg-[#e2e8f0]";
            if (isAnswered) {
              segmentColor = "bg-slate-700";
            } else if (isPastOrCurrent) {
              segmentColor = "bg-slate-700";
            }

            return (
              <button
                key={idx}
                onClick={() => onSelectIndex && onSelectIndex(idx)}
                title={`Pergunta ${idx + 1}${isAnswered ? (isCorrect ? ' (Correta)' : ' (Incorreta)') : ''}`}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${segmentColor} ${
                  isCurrent ? 'ring-1 ring-offset-1 ring-slate-400' : ''
                }`}
                style={{
                  minWidth: totalQuestions > 30 ? '5px' : totalQuestions > 15 ? '10px' : '16px',
                  flexGrow: 1
                }}
              />
            );
          })}
        </div>

        {/* Counters: Index / Total, Wrong count, Correct count */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-sm font-semibold tabular-nums">
          <span className="text-slate-700 text-xs sm:text-[15px]">
            {currentIndex + 1} / {totalQuestions}
          </span>

          {/* Wrong answers badge */}
          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#fca5a5]/50 text-[#b91c1c] text-[11px] sm:text-xs font-bold">
            <X className="w-3 h-3 stroke-[2.5]" />
            {wrongCount}
          </span>

          {/* Correct answers badge */}
          <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-[#86efac]/50 text-[#15803d] text-[11px] sm:text-xs font-bold">
            <Check className="w-3 h-3 stroke-[2.5]" />
            {correctCount}
          </span>
        </div>
      </div>
    </div>
  );
};
