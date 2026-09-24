import React from 'react';

interface QuizBottomNavProps {
  currentIndex: number;
  totalQuestions: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish?: () => void;
  isLastQuestion: boolean;
  hasAnsweredCurrent: boolean;
}

export const QuizBottomNav: React.FC<QuizBottomNavProps> = ({
  currentIndex,
  totalQuestions,
  canGoBack,
  canGoForward,
  onPrev,
  onNext,
  onFinish,
  isLastQuestion,
  hasAnsweredCurrent,
}) => {
  return (
    <div className="w-full pt-6 pb-2 sm:pb-4 mt-auto">
      <div className="flex items-center justify-end gap-2.5 sm:gap-3">
        {/* Voltar button */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoBack}
          className={`px-5 sm:px-6 py-2.5 rounded-full text-sm sm:text-[15px] font-medium transition-all ${
            canGoBack
              ? 'bg-[#f1f3f5] text-slate-800 hover:bg-slate-200 active:scale-95 cursor-pointer'
              : 'bg-[#f1f3f5]/50 text-slate-400 cursor-not-allowed'
          }`}
        >
          Voltar
        </button>

        {/* Avançar / Concluir button */}
        {isLastQuestion ? (
          <button
            type="button"
            onClick={onFinish}
            className="px-5 sm:px-6 py-2.5 rounded-full bg-[#bfe0ff] hover:bg-[#a9d5ff] active:scale-95 text-[#003366] text-sm sm:text-[15px] font-semibold transition-all shadow-xs cursor-pointer"
          >
            Concluir
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="px-5 sm:px-6 py-2.5 rounded-full bg-[#bfe0ff] hover:bg-[#a9d5ff] active:scale-95 text-[#003366] text-sm sm:text-[15px] font-semibold transition-all shadow-xs cursor-pointer"
          >
            Avançar
          </button>
        )}
      </div>
    </div>
  );
};
