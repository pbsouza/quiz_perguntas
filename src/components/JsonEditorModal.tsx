import React, { useState } from 'react';
import { QuizSchema, Question, QuestionType } from '../types/quiz';
import { normalizeQuizJson } from '../utils/quizParser';
import { PRESETS } from '../data/defaultQuizzes';
import { Code, PlusCircle, Check, Copy, Download, Upload, AlertCircle, FileText, Sparkles, RefreshCw, X, Video } from 'lucide-react';

interface JsonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuiz: QuizSchema | null;
  onApplyQuiz: (quiz: QuizSchema) => void;
}

export const JsonEditorModal: React.FC<JsonEditorModalProps> = ({
  isOpen,
  onClose,
  currentQuiz,
  onApplyQuiz,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'builder' | 'docs'>('editor');
  const [jsonText, setJsonText] = useState<string>(() =>
    currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0
      ? JSON.stringify(currentQuiz, null, 2)
      : '{\n  "questions": []\n}'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync if opened
  React.useEffect(() => {
    if (isOpen) {
      if (currentQuiz && currentQuiz.questions && currentQuiz.questions.length > 0) {
        setJsonText(JSON.stringify(currentQuiz, null, 2));
      } else {
        setJsonText('{\n  "questions": []\n}');
      }
      setErrorMsg(null);
    }
  }, [isOpen, currentQuiz]);

  // Visual Builder form state
  const [builderType, setBuilderType] = useState<QuestionType>('multiple_choice');
  const [builderQuestion, setBuilderQuestion] = useState('');
  const [builderOptions, setBuilderOptions] = useState<string[]>(['', '', '', '']);
  const [builderCorrectOption, setBuilderCorrectOption] = useState<number>(0);
  const [builderCorrectText, setBuilderCorrectText] = useState('');
  const [builderCorrectBoolean, setBuilderCorrectBoolean] = useState<boolean>(true);
  const [builderExplanation, setBuilderExplanation] = useState('');

  if (!isOpen) return null;

  const handleJsonChange = (val: string) => {
    setJsonText(val);
    setErrorMsg(null);
  };

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const normalized = normalizeQuizJson(parsed, true);
      onApplyQuiz(normalized);
      setSuccessMsg('Questionário carregado com sucesso!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg('Não foi possível processar o texto das perguntas. Verifique o formato digitado.');
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const found = PRESETS.find(p => p.id === presetId);
    if (found) {
      const formatted = JSON.stringify(found.schema, null, 2);
      setJsonText(formatted);
      setErrorMsg(null);
      setSuccessMsg(`Exemplo "${found.name}" carregado!`);
      setTimeout(() => setSuccessMsg(null), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const normalized = normalizeQuizJson(parsed);
        setJsonText(JSON.stringify(normalized, null, 2));
        setErrorMsg(null);
        setSuccessMsg('Arquivo de perguntas importado com sucesso!');
        setTimeout(() => setSuccessMsg(null), 2000);
      } catch (err: any) {
        setErrorMsg('Falha ao abrir arquivo. Certifique-se de que é um arquivo válido de perguntas.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setSuccessMsg('Conteúdo copiado para a área de transferência!');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVideoUrlFromJson = (): string => {
    try {
      const parsed = JSON.parse(jsonText);
      return parsed.videoUrl || parsed.video || parsed.youtube || parsed.parte1?.video || '';
    } catch {
      return '';
    }
  };

  const handleUpdateVideoUrl = (newUrl: string) => {
    try {
      let parsed = JSON.parse(jsonText);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        parsed = { questions: Array.isArray(parsed) ? parsed : [] };
      }
      parsed.videoUrl = newUrl.trim();
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore if invalid json
    }
  };

  // Add question via Visual Builder into jsonText
  const handleAddQuestionFromBuilder = () => {
    if (!builderQuestion.trim()) {
      setErrorMsg('Informe o enunciado da pergunta.');
      return;
    }

    try {
      let currentParsed: QuizSchema;
      try {
        currentParsed = JSON.parse(jsonText);
      } catch {
        currentParsed = { questions: [] };
      }

      const newQ: Question = {
        question: builderQuestion.trim(),
        type: builderType,
        explanation: builderExplanation.trim()
      };

      if (builderType === 'multiple_choice') {
        const cleanOpts = builderOptions.filter(o => o.trim().length > 0);
        if (cleanOpts.length < 2) {
          setErrorMsg('Adicione pelo menos 2 alternativas para múltipla escolha.');
          return;
        }
        newQ.options = cleanOpts;
        newQ.correctOptionIndex = Math.min(builderCorrectOption, cleanOpts.length - 1);
      } else if (builderType === 'text') {
        if (!builderCorrectText.trim()) {
          setErrorMsg('Informe a resposta correta para o campo de texto.');
          return;
        }
        newQ.correctAnswer = builderCorrectText.trim();
      } else if (builderType === 'boolean') {
        newQ.correctBoolean = builderCorrectBoolean;
      }

      currentParsed.questions = [...(currentParsed.questions || []), newQ];
      const updatedJson = JSON.stringify(currentParsed, null, 2);
      setJsonText(updatedJson);

      // Reset builder form
      setBuilderQuestion('');
      setBuilderExplanation('');
      setBuilderCorrectText('');
      setBuilderOptions(['', '', '', '']);
      setErrorMsg(null);
      setSuccessMsg('Pergunta adicionada! Clique em "Iniciar Questionário" abaixo.');
      setTimeout(() => setSuccessMsg(null), 2500);
      setActiveTab('editor');
    } catch (err: any) {
      setErrorMsg(`Erro ao adicionar pergunta: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-700">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Gerenciar Perguntas do Questionário
              </h2>
              <p className="text-xs text-slate-500">
                Cole o texto das perguntas, monte novas questões ou escolha um exemplo pronto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Editor de Texto
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'builder' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Criar Pergunta
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'docs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Exemplo de Formato
            </button>
          </div>

          {/* Quick presets buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden md:inline">Exemplos Prontos:</span>
            {PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => handleLoadPreset(p.id)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="flex-1 font-medium">{successMsg}</span>
            </div>
          )}

          {/* TAB 1: JSON TEXTAREA */}
          {activeTab === 'editor' && (
            <div className="flex flex-col h-full gap-3">
              {/* Quick YouTube link input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950 shrink-0">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span>Parte 1 (Vídeo do YouTube):</span>
                </div>
                <input
                  type="text"
                  value={getVideoUrlFromJson()}
                  onChange={(e) => handleUpdateVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... (ou edite dentro do JSON abaixo)"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Parte 2: Edite o texto das perguntas abaixo:</span>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer transition-colors shadow-2xs font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    Enviar Arquivo
                    <input
                      type="file"
                      accept=".json,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors shadow-2xs font-medium cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors shadow-2xs font-medium cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Arquivo
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[360px] relative rounded-2xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-sky-400">
                <textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  spellCheck={false}
                  placeholder="Cole as perguntas aqui..."
                  className="w-full h-full p-4 font-mono text-xs sm:text-sm text-slate-800 resize-none outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: VISUAL BUILDER */}
          {activeTab === 'builder' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col gap-5 max-w-2xl mx-auto">
              <h3 className="text-base font-bold text-slate-900">
                Adicionar Nova Questão Dinâmica
              </h3>

              {/* Input Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Tipo de Componente / Entrada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'multiple_choice', label: 'Múltipla Escolha' },
                    { id: 'text', label: 'Campo de Texto' },
                    { id: 'boolean', label: 'Verdadeiro / Falso' },
                    { id: 'number', label: 'Número' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBuilderType(t.id as QuestionType)}
                      className={`px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        builderType === t.id
                          ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Enunciado da Pergunta
                </label>
                <textarea
                  value={builderQuestion}
                  onChange={e => setBuilderQuestion(e.target.value)}
                  placeholder="Ex: No trecho 'Cuando Jehová nos mira...', o que significa 'fijarse en'?"
                  rows={3}
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              {/* Type-specific inputs */}
              {builderType === 'multiple_choice' && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Alternativas (Marque o botão de rádio para a correta)
                  </label>
                  {builderOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={builderCorrectOption === idx}
                        onChange={() => setBuilderCorrectOption(idx)}
                        className="w-4 h-4 text-sky-600 focus:ring-sky-400 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-500 w-5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const updated = [...builderOptions];
                          updated[idx] = e.target.value;
                          setBuilderOptions(updated);
                        }}
                        placeholder={`Alternativa ${String.fromCharCode(65 + idx)}`}
                        className="flex-1 p-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </div>
                  ))}
                </div>
              )}

              {builderType === 'text' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Resposta Esperada
                  </label>
                  <input
                    type="text"
                    value={builderCorrectText}
                    onChange={e => setBuilderCorrectText(e.target.value)}
                    placeholder="Ex: fijarse en"
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    A verificação ignora maiúsculas e espaços extras automaticamente.
                  </span>
                </div>
              )}

              {builderType === 'boolean' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Resposta Correta
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="boolOpt"
                        checked={builderCorrectBoolean === true}
                        onChange={() => setBuilderCorrectBoolean(true)}
                      />
                      <span className="text-sm font-medium">Verdadeiro</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="boolOpt"
                        checked={builderCorrectBoolean === false}
                        onChange={() => setBuilderCorrectBoolean(false)}
                      />
                      <span className="text-sm font-medium">Falso</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Explicação / Justificativa (Exibida após a resposta)
                </label>
                <textarea
                  value={builderExplanation}
                  onChange={e => setBuilderExplanation(e.target.value)}
                  placeholder="Explique o motivo da resposta para quem estiver praticando..."
                  rows={2}
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddQuestionFromBuilder}
                  className="px-6 py-2.5 bg-sky-200 hover:bg-sky-300 text-sky-950 font-semibold rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  Inserir Pergunta no Quiz
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEMA DOCUMENTATION */}
          {activeTab === 'docs' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-slate-800 space-y-4 max-w-2xl mx-auto text-sm leading-relaxed">
              <h3 className="text-base font-bold text-slate-900">
                Esquema em 2 Partes (Vídeo + Perguntas)
              </h3>
              <p>
                O sistema é estruturado em duas etapas interligadas: a <strong>Parte 1 (Vídeo do YouTube)</strong> para estudo prévio e a <strong>Parte 2 (Perguntas)</strong> para fixação do conteúdo.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs overflow-x-auto">
{`{
  "title": "Estudo Bíblico ou Aula",
  "description": "Descrição opcional da atividade",
  
  // PARTE 1: VÍDEO DO YOUTUBE
  "videoUrl": "https://www.youtube.com/watch?v=k1t64lF4-s0",
  "videoTitle": "Vídeo da Aula",

  // PARTE 2: QUESTÕES DO QUESTIONÁRIO
  "questions": [
    // 1. Múltipla Escolha
    {
      "question": "Enunciado da pergunta",
      "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
      "correctOptionIndex": 0,
      "explanation": "Explicação que aparece na tela"
    },
    // 2. Campo de Texto (Preenchimento de lacuna)
    {
      "type": "text",
      "question": "Preencha a lacuna: ...",
      "correctAnswer": "resposta",
      "explanation": "..."
    },
    // 3. Múltipla Seleção (Checkboxes)
    {
      "type": "multiple_select",
      "question": "Selecione todas as corretas",
      "options": ["Opção 1", "Opção 2", "Opção 3"],
      "correctOptionIndices": [0, 2],
      "explanation": "..."
    },
    // 4. Verdadeiro ou Falso
    {
      "type": "boolean",
      "question": "Afirmação para julgar...",
      "correctBoolean": true,
      "explanation": "..."
    }
  ]
}`}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Formatos alternativos aceitos:</strong> Você também pode usar as chaves <code>{'parte1: { "video": "https://..." }'}</code> e <code>{'parte2: { "questions": [...] }'}</code>, ou <code>youtube</code> em vez de <code>videoUrl</code>.</p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Carregar Questionário
          </button>
        </div>

      </div>
    </div>
  );
};
