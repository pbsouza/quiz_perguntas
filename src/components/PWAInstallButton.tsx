import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'button' | 'menu-item';
  onInstalledSuccess?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  onInstalledSuccess,
}) => {
  const { isInstallable, hasPrompt, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running standalone / installed, do not show button
  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleClick = async () => {
    if (hasPrompt) {
      const accepted = await promptInstall();
      if (accepted && onInstalledSuccess) {
        onInstalledSuccess();
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'menu-item' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-indigo-700 font-semibold cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span>Instalar Aplicativo</span>
        </button>
      ) : variant === 'button' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          title="Instalar QuizSchema como aplicativo"
          className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100/90 font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-indigo-200 shrink-0 ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Instalar</span>
        </button>
      )}

      {/* iOS Safari Guided Install Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <img src="./favicon.png" alt="QuizSchema" className="w-10 h-10 rounded-xl shadow-xs" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Instalar no iPhone / iPad</h3>
                <p className="text-xs text-slate-500">Adicione à Tela de Início</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  No Safari, toque no botão <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5" /> barra inferior).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  Role as opções para baixo e toque em <strong>Adicionar à Tela de Início</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                <div>
                  Toque em <strong>Adicionar</strong> no canto superior direito.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
