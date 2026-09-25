import React, { useState, useEffect } from 'react';
import { QuizSchema } from '../types/quiz';
import { normalizeQuizJson } from '../utils/quizParser';
import { SPANISH_QUIZ_PRESET } from '../data/defaultQuizzes';
import { getSavedQuizzes, SavedQuizItem } from '../utils/quizStorage';
import { Code, Upload, Sparkles, AlertCircle, ArrowRight, BookOpen, Play } from 'lucide-react';

interface EmptyStateProps {
  onLoadQuiz: (quiz: QuizSchema) => void;
  onOpenLibrary?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onLoadQuiz, onOpenLibrary }) => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuizItem[]>([]);

  useEffect(() => {
    setSavedQuizzes(getSavedQuizzes());
  }, []);

  const handleProcessJson = (text: string) => {
    if (!text.trim()) {
      setError('Por favor, cole ou digite o texto com as suas questões.');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      const normalized = normalizeQuizJson(parsed, true);
      setError(null);
      onLoadQuiz(normalized);
    } catch (err: any) {
      setError('Não foi possível identificar o formato das perguntas. Verifique o texto ou use o exemplo.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      handleProcessJson(content);
    };
    reader.readAsText(file);
  };

  const handleLoadExample = () => {
    onLoadQuiz(normalizeQuizJson(SPANISH_QUIZ_PRESET, true));
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-4 px-2">
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <Code className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Comece Seu Questionário
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Cole as perguntas no campo abaixo, envie um arquivo ou escolha um dos seus questionários salvos.
          </p>
        </div>

        {/* Saved Quizzes Quick Access */}
        {savedQuizzes.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Seus Questionários Salvos ({savedQuizzes.length}):
              </span>
              {onOpenLibrary && (
                <button
                  type="button"
                  onClick={onOpenLibrary}
                  className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold cursor-pointer hover:underline"
                >
                  Ver todos
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedQuizzes.slice(0, 4).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onLoadQuiz(item.data)}
                  className="p-2.5 rounded-xl bg-white hover:bg-indigo-100/50 border border-indigo-100/80 text-left transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-950">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {item.questionCount} questões
                    </div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-indigo-600 shrink-0 fill-indigo-600/30 group-hover:fill-indigo-600" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium text-xs sm:text-sm">{error}</span>
          </div>
        )}

        {/* Textarea */}
        <div className="mb-4 relative">
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setError(null);
            }}
            placeholder={`{\n  "questions": [\n    {\n      "question": "Enunciado da pergunta...",\n      "options": [\n        "Alternativa A",\n        "Alternativa B"\n      ],\n      "correctOptionIndex": 0,\n      "explanation": "Explicação..."\n    }\n  ]\n}`}
            rows={8}
            spellCheck={false}
            className="w-full p-4 font-mono text-xs sm:text-sm text-slate-800 bg-[#f8fafc] rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:bg-white outline-none transition-all resize-y"
          />
        </div>

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl cursor-pointer transition-colors w-full sm:w-auto active:scale-95">
              <Upload className="w-4 h-4" />
              <span>Enviar arquivo com perguntas</span>
              <input
                type="file"
                accept=".json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleProcessJson(jsonInput)}
              disabled={!jsonInput.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Gerar Questionário</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Example Loader */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleLoadExample}
            className="text-xs text-sky-700 hover:text-sky-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ou clique aqui para testar com um questionário de exemplo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
