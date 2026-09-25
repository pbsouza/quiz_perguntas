import React, { useState, useEffect } from 'react';
import { Question, QuestionAnswerState } from '../types/quiz';
import { Check, X, Send, AlertCircle, HelpCircle, Volume2, Square } from 'lucide-react';
import { cleanText } from '../utils/quizParser';
import { speechManager } from '../utils/speechSynthesis';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  answerState?: QuestionAnswerState;
  onAnswer: (answer: any) => void;
  showExplanation?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  answerState,
  onAnswer,
  showExplanation = true,
}) => {
  const isAnswered = Boolean(answerState?.answered);
  const userAnswer = answerState?.userAnswer;

  // Local state for free text / number / multi-select before submission
  const [textInput, setTextInput] = useState<string>('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  // Speech TTS state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = speechManager.subscribe((active) => {
      setIsSpeaking(active);
      if (!active) setSpeakingId(null);
    });
    return () => {
      unsubscribe();
      speechManager.stop();
    };
  }, []);

  // Stop speaking when question changes
  useEffect(() => {
    speechManager.stop();
    setSpeakingId(null);
  }, [questionIndex]);

  useEffect(() => {
    if (isAnswered && answerState) {
      if (question.type === 'text' || question.type === 'number') {
        setTextInput(String(answerState.userAnswer || ''));
      } else if (question.type === 'multiple_select' && Array.isArray(answerState.userAnswer)) {
        setSelectedIndices(answerState.userAnswer);
      }
    } else {
      setTextInput('');
      setSelectedIndices([]);
    }
  }, [questionIndex, isAnswered, answerState, question.type]);

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Handle single selection click
  const handleSingleSelect = (index: number) => {
    if (isAnswered) return;
    onAnswer(index);
  };

  // Handle boolean selection
  const handleBooleanSelect = (val: boolean) => {
    if (isAnswered) return;
    onAnswer(val);
  };

  // Handle text input submission
  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !textInput.trim()) return;
    onAnswer(textInput.trim());
  };

  // Handle multi-select toggle
  const toggleMultiSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleMultiSelectSubmit = () => {
    if (isAnswered || selectedIndices.length === 0) return;
    onAnswer(selectedIndices);
  };

  const handleToggleSpeakQuestion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking && speakingId === 'question') {
      speechManager.stop();
    } else {
      setSpeakingId('question');
      speechManager.speak(cleanText(question.question), {
        onEnd: () => setSpeakingId(null)
      });
    }
  };

  const handleSpeakText = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    if (isSpeaking && speakingId === id) {
      speechManager.stop();
    } else {
      setSpeakingId(id);
      speechManager.speak(cleanText(text), {
        onEnd: () => setSpeakingId(null)
      });
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* Question Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Pergunta {questionIndex + 1}
          </h2>

          {/* TTS Audio Button */}
          {speechManager.isAvailable() && (
            <button
              type="button"
              onClick={handleToggleSpeakQuestion}
              title={isSpeaking && speakingId === 'question' ? 'Parar leitura' : 'Ouvir pergunta em voz alta'}
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                isSpeaking && speakingId === 'question'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {isSpeaking && speakingId === 'question' ? (
                <>
                  <Square className="w-3 h-3 fill-current" />
                  <span>Parar</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ouvir</span>
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-[17px] leading-relaxed text-slate-900 font-normal select-text">
          {question.question}
        </p>
      </div>

      {/* RENDER BASED ON QUESTION TYPE */}

      {/* 1. MULTIPLE CHOICE */}
      {(!question.type || question.type === 'multiple_choice') && question.options && (
        <div className="flex flex-col gap-3 mt-2">
          {question.options.map((option, idx) => {
            const letter = optionLetters[idx] || `${idx + 1}`;
            const isUserSelection = isAnswered && Number(userAnswer) === idx;
            const isCorrectOption = idx === question.correctOptionIndex;

            // Determine card appearance matching the screenshot
            let containerBg = "bg-[#f1f3f5] hover:bg-[#e9ecef] border-transparent";
            let textColor = "text-slate-900";

            if (isAnswered) {
              if (isCorrectOption) {
                containerBg = "bg-[#f1f3f5] border-transparent";
              } else if (isUserSelection && !isCorrectOption) {
                containerBg = "bg-[#fef2f2] border-red-200";
              } else {
                containerBg = "bg-[#f1f3f5]/70 opacity-80";
              }
            }

            return (
              <div
                key={idx}
                onClick={() => handleSingleSelect(idx)}
                className={`w-full rounded-2xl p-4 transition-all duration-150 select-text ${containerBg} ${
                  !isAnswered ? 'cursor-pointer active:scale-[0.99] active:bg-[#e2e6ea]' : 'cursor-default'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="font-semibold text-slate-800 text-[15px] shrink-0 pt-0.5">
                      {letter}.
                    </span>
                    <span className={`text-[15px] leading-normal font-normal ${textColor} break-words min-w-0 flex-1`}>
                      {option}
                    </span>
                    {speechManager.isAvailable() && (
                      <button
                        type="button"
                        onClick={(e) => handleSpeakText(e, option, `opt-${idx}`)}
                        title="Ouvir pronúncia desta alternativa"
                        className={`p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors shrink-0 mt-0.5 ${
                          isSpeaking && speakingId === `opt-${idx}` ? 'text-amber-700 bg-amber-100 animate-pulse' : ''
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Badges row matching screenshot */}
                  {isAnswered && (
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:justify-end pt-0.5 pl-6 sm:pl-0">
                      {isUserSelection && (
                        <span className="text-xs text-slate-500 font-medium">
                          (Sua resposta)
                        </span>
                      )}

                      {isCorrectOption && (
                        <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#15803d] text-xs font-semibold px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          Resposta correta
                        </span>
                      )}

                      {isUserSelection && !isCorrectOption && (
                        <span className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          Resposta incorreta
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Explanation inside or right under the correct or selected option if answered (matching screenshot!) */}
                {isAnswered && isCorrectOption && question.explanation && showExplanation && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 text-[14px] leading-relaxed text-slate-700">
                    <p>{cleanText(question.explanation)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. TEXT INPUT / PREENCHIMENTO DE LACUNA */}
      {question.type === 'text' && (
        <div className="flex flex-col gap-3 mt-2">
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                disabled={isAnswered}
                placeholder={question.placeholder || "Digite sua resposta..."}
                className={`flex-1 px-4 py-3.5 rounded-2xl bg-[#f1f3f5] border text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 text-[15px] transition-colors ${
                  isAnswered
                    ? answerState?.isCorrect
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-red-300 bg-red-50/50'
                    : 'border-transparent'
                }`}
              />
              {!isAnswered && (
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="px-5 py-3.5 bg-sky-200 hover:bg-sky-300 text-sky-950 font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirmar</span>
                </button>
              )}
            </div>
          </form>

          {/* Feedback after answer */}
          {isAnswered && (
            <div className="rounded-2xl p-4 bg-[#f1f3f5] border border-slate-200/80 mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">Sua resposta: &ldquo;{userAnswer}&rdquo;</span>
                {answerState?.isCorrect ? (
                  <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#15803d] text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    Correto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold px-2.5 py-1 rounded-full">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    Incorreto
                  </span>
                )}
              </div>

              {!answerState?.isCorrect && (
                <div className="text-sm font-medium text-slate-800 mb-2">
                  Resposta esperada:{' '}
                  <span className="text-emerald-700 font-semibold">
                    {question.correctAnswer || (question.correctAnswers && question.correctAnswers.join(' ou '))}
                  </span>
                </div>
              )}

              {question.explanation && showExplanation && (
                <p className="text-[14px] leading-relaxed text-slate-700 border-t border-slate-200/80 pt-2.5 mt-2">
                  {cleanText(question.explanation)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. MULTIPLE SELECT (CHECKBOXES) */}
      {question.type === 'multiple_select' && question.options && (
        <div className="flex flex-col gap-3 mt-2">
          <p className="text-xs text-slate-500 font-medium">Selecione uma ou mais opções e confirme:</p>
          <div className="flex flex-col gap-2.5">
            {question.options.map((option, idx) => {
              const letter = optionLetters[idx] || `${idx + 1}`;
              const isChecked = selectedIndices.includes(idx);
              const isTargetCorrect = question.correctOptionIndices?.includes(idx);

              let cardBg = isChecked ? "bg-sky-50 border-sky-300" : "bg-[#f1f3f5] border-transparent";
              if (isAnswered) {
                if (isTargetCorrect) {
                  cardBg = "bg-[#f1f3f5] border-emerald-400";
                } else if (isChecked && !isTargetCorrect) {
                  cardBg = "bg-red-50 border-red-300";
                } else {
                  cardBg = "bg-[#f1f3f5]/70 opacity-80 border-transparent";
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => toggleMultiSelectOption(idx)}
                  className={`w-full rounded-2xl p-4 border transition-all duration-150 ${cardBg} ${
                    !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-400 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="font-semibold text-slate-800 text-[15px] shrink-0">
                        {letter}.
                      </span>
                      <span className="text-[15px] leading-normal font-normal text-slate-900">
                        {option}
                      </span>
                      {speechManager.isAvailable() && (
                        <button
                          type="button"
                          onClick={(e) => handleSpeakText(e, option, `ms-opt-${idx}`)}
                          title="Ouvir pronúncia desta alternativa"
                          className={`p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors shrink-0 mt-0.5 ${
                            isSpeaking && speakingId === `ms-opt-${idx}` ? 'text-amber-700 bg-amber-100 animate-pulse' : ''
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isAnswered && (
                      <div className="shrink-0 flex items-center gap-1.5">
                        {isTargetCorrect && (
                          <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#15803d] text-xs font-semibold px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[2.5]" /> Correta
                          </span>
                        )}
                        {isChecked && !isTargetCorrect && (
                          <span className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold px-2 py-0.5 rounded-full">
                            <X className="w-3 h-3 stroke-[2.5]" /> Incorreta
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isAnswered && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleMultiSelectSubmit}
                disabled={selectedIndices.length === 0}
                className="px-5 py-3 bg-sky-200 hover:bg-sky-300 text-sky-950 font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                Confirmar seleção ({selectedIndices.length})
              </button>
            </div>
          )}

          {isAnswered && question.explanation && showExplanation && (
            <div className="rounded-2xl p-4 bg-[#f1f3f5] border border-slate-200/80 mt-1">
              <p className="text-[14px] leading-relaxed text-slate-700">
                {cleanText(question.explanation)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. BOOLEAN (VERDADEIRO OU FALSO) */}
      {question.type === 'boolean' && (
        <div className="flex flex-col gap-3 mt-2">
          {[
            { label: 'Verdadeiro', val: true, letter: 'A' },
            { label: 'Falso', val: false, letter: 'B' }
          ].map((item, idx) => {
            const isUserSelection = isAnswered && Boolean(userAnswer) === item.val;
            const isTargetCorrect = question.correctBoolean === item.val;

            let containerBg = "bg-[#f1f3f5] hover:bg-[#e9ecef] border-transparent";
            if (isAnswered) {
              if (isTargetCorrect) {
                containerBg = "bg-[#f1f3f5] border-transparent";
              } else if (isUserSelection && !isTargetCorrect) {
                containerBg = "bg-[#fef2f2] border-red-200";
              } else {
                containerBg = "bg-[#f1f3f5]/70 opacity-80";
              }
            }

            return (
              <div
                key={idx}
                onClick={() => handleBooleanSelect(item.val)}
                className={`w-full rounded-2xl p-4 border transition-all duration-150 select-text ${containerBg} ${
                  !isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-800 text-[15px]">
                      {item.letter}.
                    </span>
                    <span className="text-[15px] font-medium text-slate-900">
                      {item.label}
                    </span>
                  </div>

                  {isAnswered && (
                    <div className="flex items-center gap-2">
                      {isUserSelection && (
                        <span className="text-xs text-slate-500 font-medium">
                          (Sua resposta)
                        </span>
                      )}
                      {isTargetCorrect && (
                        <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#15803d] text-xs font-semibold px-2.5 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          Resposta correta
                        </span>
                      )}
                      {isUserSelection && !isTargetCorrect && (
                        <span className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold px-2.5 py-1 rounded-full">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          Resposta incorreta
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isAnswered && isTargetCorrect && question.explanation && showExplanation && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 text-[14px] leading-relaxed text-slate-700">
                    <p>{cleanText(question.explanation)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. NUMBER INPUT */}
      {question.type === 'number' && (
        <div className="flex flex-col gap-3 mt-2">
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                step="any"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                disabled={isAnswered}
                placeholder={question.placeholder || "Digite um número..."}
                className={`flex-1 px-4 py-3.5 rounded-2xl bg-[#f1f3f5] border text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 text-[15px] ${
                  isAnswered
                    ? answerState?.isCorrect
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-red-300 bg-red-50/50'
                    : 'border-transparent'
                }`}
              />
              {!isAnswered && (
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="px-5 py-3.5 bg-sky-200 hover:bg-sky-300 text-sky-950 font-semibold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  Confirmar
                </button>
              )}
            </div>
          </form>

          {isAnswered && (
            <div className="rounded-2xl p-4 bg-[#f1f3f5] border border-slate-200/80 mt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">Sua resposta: {userAnswer}</span>
                {answerState?.isCorrect ? (
                  <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#15803d] text-xs font-semibold px-2.5 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    Correto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold px-2.5 py-1 rounded-full">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    Incorreto
                  </span>
                )}
              </div>

              {!answerState?.isCorrect && (
                <div className="text-sm font-medium text-slate-800 mb-2">
                  Resposta correta: <span className="text-emerald-700 font-semibold">{question.correctAnswer}</span>
                </div>
              )}

              {question.explanation && showExplanation && (
                <p className="text-[14px] leading-relaxed text-slate-700 border-t border-slate-200/80 pt-2.5 mt-2">
                  {cleanText(question.explanation)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
