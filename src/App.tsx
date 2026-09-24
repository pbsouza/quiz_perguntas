/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QuizSchema, QuestionAnswerState } from './types/quiz';
import { evaluateAnswer, shuffleArray } from './utils/quizParser';
import { HeaderBar } from './components/HeaderBar';
import { QuizTopBar } from './components/QuizTopBar';
import { QuestionCard } from './components/QuestionCard';
import { QuizBottomNav } from './components/QuizBottomNav';
import { ResultsScreen } from './components/ResultsScreen';
import { JsonEditorModal } from './components/JsonEditorModal';
import { EmptyState } from './components/EmptyState';

export default function App() {
  // System starts completely clean - nothing pre-loaded!
  const [currentQuiz, setCurrentQuiz] = useState<QuizSchema | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, QuestionAnswerState>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const hasQuiz = Boolean(currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0);
  const totalQuestions = currentQuiz?.questions?.length || 0;
  const currentQuestion = currentQuiz?.questions?.[currentIndex];
  const currentAnswerState = answers[currentIndex];

  // If questions change and index is out of bounds, reset index
  useEffect(() => {
    if (totalQuestions > 0 && currentIndex >= totalQuestions) {
      setCurrentIndex(Math.max(0, totalQuestions - 1));
    }
  }, [totalQuestions, currentIndex]);

  // Answer handler
  const handleAnswer = (answerValue: any) => {
    if (!currentQuestion) return;
    const isCorrect = evaluateAnswer(currentQuestion, answerValue);

    setAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        answered: true,
        userAnswer: answerValue,
        isCorrect
      }
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setShowResults(true);
  };

  const handleResetAnswers = () => {
    // Re-shuffle order when resetting quiz
    if (currentQuiz) {
      setCurrentQuiz({
        ...currentQuiz,
        questions: shuffleArray(currentQuiz.questions)
      });
    }
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  const handleShuffleQuestions = () => {
    if (!currentQuiz) return;
    setCurrentQuiz({
      ...currentQuiz,
      questions: shuffleArray(currentQuiz.questions)
    });
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setShareToast('Ordem das perguntas embaralhada!');
    setTimeout(() => setShareToast(null), 2000);
  };

  const handleClearQuiz = () => {
    setCurrentQuiz(null);
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  const handleRetakeMissed = () => {
    if (!currentQuiz) return;
    const updatedAnswers: Record<number, QuestionAnswerState> = {};
    let firstMissedIndex: number | null = null;

    currentQuiz.questions.forEach((_, idx) => {
      const state = answers[idx];
      if (state && state.answered && state.isCorrect) {
        updatedAnswers[idx] = state;
      } else {
        if (firstMissedIndex === null) firstMissedIndex = idx;
      }
    });

    setAnswers(updatedAnswers);
    setCurrentIndex(firstMissedIndex !== null ? firstMissedIndex : 0);
    setShowResults(false);
  };

  const handleApplyNewQuiz = (newQuiz: QuizSchema) => {
    // Automatically randomize the order of questions when loading any file or JSON
    const randomizedQuestions = shuffleArray(newQuiz.questions);
    setCurrentQuiz({
      ...newQuiz,
      questions: randomizedQuestions
    });
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  const handleShare = () => {
    if (!currentQuiz) return;
    if (navigator.share) {
      navigator.share({
        title: currentQuiz.title || 'QuizSchema',
        text: `Estou respondendo ao quiz "${currentQuiz.title || 'Questionário'}" com ${totalQuestions} questões!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareToast('Link copiado para a área de transferência!');
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 sm:bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-sky-200">
      
      {/* Top Header */}
      <HeaderBar
        onOpenJsonEditor={() => setIsJsonModalOpen(true)}
        onResetAnswers={handleResetAnswers}
        onShuffleQuestions={handleShuffleQuestions}
        onClearQuiz={handleClearQuiz}
        hasQuiz={hasQuiz}
      />

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-full shadow-lg transition-all animate-in fade-in slide-in-from-top-2">
          {shareToast}
        </div>
      )}

      {/* Main Content Area - Fully fluid and responsive */}
      <main className="flex-1 flex flex-col items-center justify-start w-full px-0 sm:px-4 md:px-6 sm:py-6">

        {!hasQuiz ? (
          /* Clean Empty State */
          <div className="w-full max-w-2xl px-4 py-6">
            <EmptyState onLoadQuiz={handleApplyNewQuiz} />
          </div>
        ) : showResults ? (
          /* Results Screen */
          <div className="w-full max-w-2xl lg:max-w-3xl">
            <ResultsScreen
              quiz={currentQuiz!}
              answers={answers}
              onRestart={handleResetAnswers}
              onRetakeMissed={handleRetakeMissed}
              onGoToQuestion={(idx) => {
                setCurrentIndex(idx);
                setShowResults(false);
              }}
            />
          </div>
        ) : (
          /* RESPONSIVE QUIZ CONTAINER: Full width on mobile, centered card on tablet & desktop */
          <div className="w-full max-w-2xl lg:max-w-3xl bg-white sm:rounded-3xl sm:border sm:border-slate-200/90 sm:shadow-xs flex flex-col min-h-[calc(100vh-53px)] sm:min-h-[580px] p-4 sm:p-8 lg:p-10 transition-all">
            
            {/* Top Bar with Segmented dashes & score badges */}
            <QuizTopBar
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              answers={answers}
              onShare={handleShare}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
            />

            {/* Dynamic Question Renderer */}
            {currentQuestion && (
              <div className="flex-1 mt-3 sm:mt-4">
                <QuestionCard
                  key={currentIndex}
                  question={currentQuestion}
                  questionIndex={currentIndex}
                  answerState={currentAnswerState}
                  onAnswer={handleAnswer}
                  showExplanation={true}
                />
              </div>
            )}

            {/* Bottom Navigation with Voltar and Avançar buttons */}
            <QuizBottomNav
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              canGoBack={currentIndex > 0}
              canGoForward={currentIndex < totalQuestions - 1}
              onPrev={handlePrev}
              onNext={handleNext}
              onFinish={handleFinish}
              isLastQuestion={currentIndex === totalQuestions - 1}
              hasAnsweredCurrent={Boolean(currentAnswerState?.answered)}
            />

          </div>
        )}

      </main>

      {/* JSON Editor & Visual Question Builder Modal */}
      <JsonEditorModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentQuiz={currentQuiz}
        onApplyQuiz={handleApplyNewQuiz}
      />

    </div>
  );
}
