/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QuizSchema, QuestionAnswerState } from './types/quiz';
import { evaluateAnswer, shuffleQuiz } from './utils/quizParser';
import { 
  saveQuizToLibrary, 
  getSavedQuizzes, 
  recordQuizScore, 
  saveActiveSession, 
  loadActiveSession, 
  clearActiveSession 
} from './utils/quizStorage';
import { parseQuizFromUrlHash, clearQuizHashFromUrl } from './utils/shareLink';
import { HeaderBar } from './components/HeaderBar';
import { QuizTopBar } from './components/QuizTopBar';
import { QuestionCard } from './components/QuestionCard';
import { QuizBottomNav } from './components/QuizBottomNav';
import { ResultsScreen } from './components/ResultsScreen';
import { JsonEditorModal } from './components/JsonEditorModal';
import { SavedQuizzesModal } from './components/SavedQuizzesModal';
import { ShareModal } from './components/ShareModal';
import { EmptyState } from './components/EmptyState';

export default function App() {
  const [currentQuiz, setCurrentQuiz] = useState<QuizSchema | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, QuestionAnswerState>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Modals state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  // Library count
  const [savedCount, setSavedCount] = useState<number>(0);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Initialize: Check URL hash first, then local active session
  useEffect(() => {
    // 1. Check for shared quiz in URL
    const sharedQuiz = parseQuizFromUrlHash();
    if (sharedQuiz) {
      // Auto-randomize and load
      const randomized = shuffleQuiz(sharedQuiz, { shuffleQuestions: true, shuffleOptions: true });
      setCurrentQuiz(randomized);
      setCurrentIndex(0);
      setAnswers({});
      setShowResults(false);
      saveQuizToLibrary(randomized);
      setSavedCount(getSavedQuizzes().length);
      setShareToast('Questionário carregado via link compartilhado!');
      clearQuizHashFromUrl();
      setTimeout(() => setShareToast(null), 3000);
      return;
    }

    // 2. Otherwise restore previous active session if existing
    const session = loadActiveSession();
    if (session && session.quiz && session.quiz.questions?.length > 0) {
      setCurrentQuiz(session.quiz);
      setCurrentIndex(session.currentIndex || 0);
      setAnswers(session.answers || {});
    }

    // 3. Update saved quizzes count
    setSavedCount(getSavedQuizzes().length);
  }, []);

  // Save active session whenever quiz, index or answers change
  useEffect(() => {
    if (currentQuiz) {
      saveActiveSession(currentQuiz, currentIndex, answers);
    }
  }, [currentQuiz, currentIndex, answers]);

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
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
    if (currentQuiz) {
      let correct = 0;
      let wrong = 0;
      currentQuiz.questions.forEach((_, idx) => {
        const st = answers[idx];
        if (st?.answered && st.isCorrect) correct++;
        else wrong++;
      });
      recordQuizScore(currentQuiz.title || 'Questionário', correct, wrong, totalQuestions);
      setSavedCount(getSavedQuizzes().length);
    }
  };

  const handleResetAnswers = () => {
    // Re-shuffle order when resetting quiz
    if (currentQuiz) {
      const reshuffled = shuffleQuiz(currentQuiz, { shuffleQuestions: true, shuffleOptions: false });
      setCurrentQuiz(reshuffled);
    }
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
  };

  const handleShuffleQuestions = () => {
    if (!currentQuiz) return;
    const reshuffled = shuffleQuiz(currentQuiz, { shuffleQuestions: true, shuffleOptions: false });
    setCurrentQuiz(reshuffled);
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setShareToast('Ordem das perguntas embaralhada!');
    setTimeout(() => setShareToast(null), 2000);
  };

  const handleShuffleOptions = () => {
    if (!currentQuiz) return;
    const reshuffled = shuffleQuiz(currentQuiz, { shuffleQuestions: false, shuffleOptions: true });
    setCurrentQuiz(reshuffled);
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setShareToast('Alternativas (A, B, C...) de todas as questões foram embaralhadas!');
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleShuffleAll = () => {
    if (!currentQuiz) return;
    const reshuffled = shuffleQuiz(currentQuiz, { shuffleQuestions: true, shuffleOptions: true });
    setCurrentQuiz(reshuffled);
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);
    setShareToast('Perguntas e alternativas embaralhadas com sucesso!');
    setTimeout(() => setShareToast(null), 2500);
  };

  const handleClearQuiz = () => {
    clearActiveSession();
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
    // Automatically randomize questions and options
    const randomized = shuffleQuiz(newQuiz, { shuffleQuestions: true, shuffleOptions: true });
    setCurrentQuiz(randomized);
    setAnswers({});
    setCurrentIndex(0);
    setShowResults(false);

    // Save to local library
    saveQuizToLibrary(randomized);
    setSavedCount(getSavedQuizzes().length);
  };

  return (
    <div className="min-h-screen bg-slate-50 sm:bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-sky-200">
      
      {/* Top Header */}
      <HeaderBar
        onOpenJsonEditor={() => setIsJsonModalOpen(true)}
        onResetAnswers={handleResetAnswers}
        onShuffleQuestions={handleShuffleQuestions}
        onShuffleOptions={handleShuffleOptions}
        onShuffleAll={handleShuffleAll}
        onOpenLibrary={() => setIsLibraryModalOpen(true)}
        onOpenShare={hasQuiz ? () => setIsShareModalOpen(true) : undefined}
        onClearQuiz={handleClearQuiz}
        hasQuiz={hasQuiz}
        savedQuizzesCount={savedCount}
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
          /* Clean Empty State with Saved Quizzes Library shortcuts */
          <div className="w-full max-w-2xl px-4 py-6">
            <EmptyState 
              onLoadQuiz={handleApplyNewQuiz} 
              onOpenLibrary={() => setIsLibraryModalOpen(true)}
            />
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
              onOpenShare={() => setIsShareModalOpen(true)}
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
              onShare={() => setIsShareModalOpen(true)}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
            />

            {/* Dynamic Question Renderer with Text-to-Speech Pronunciation */}
            {currentQuestion && (
              <div className="flex-1 mt-3 sm:mt-4">
                <QuestionCard
                  key={`${currentIndex}-${currentQuestion.id || currentIndex}`}
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
              onFinish={finishQuiz}
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

      {/* Saved Quizzes ("Meus Quizzes") Modal */}
      <SavedQuizzesModal
        isOpen={isLibraryModalOpen}
        onClose={() => {
          setIsLibraryModalOpen(false);
          setSavedCount(getSavedQuizzes().length);
        }}
        onLoadQuiz={(quiz) => {
          handleApplyNewQuiz(quiz);
        }}
        onOpenShareModal={(quiz) => {
          setIsLibraryModalOpen(false);
          setCurrentQuiz(quiz);
          setIsShareModalOpen(true);
        }}
      />

      {/* Direct Share Link Modal */}
      {currentQuiz && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          quiz={currentQuiz}
        />
      )}

    </div>
  );
}
