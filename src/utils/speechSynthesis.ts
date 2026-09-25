/**
 * Native Text-to-Speech (TTS) helper for QuizSchema
 */

export type TTSLanguage = 'auto' | 'pt-BR' | 'es-ES' | 'en-US';

/**
 * Heuristically detects language between Spanish, Portuguese, and English
 */
export function detectLanguage(text: string): string {
  if (!text) return 'pt-BR';

  const t = text.toLowerCase();

  // Spanish indicators (inverted marks, common spanish grammatical words)
  if (
    text.includes('¿') ||
    text.includes('¡') ||
    /\b(cuál|cuáles|quién|cómo|dónde|por qué|entonces|también|después|según|sobre|las|los|de la|del|en el|con el|una|unas|unos|respuesta|pregunta)\b/i.test(t)
  ) {
    return 'es-ES';
  }

  // English indicators
  if (
    /\b(which|what|where|who|how|why|because|following|statement|choose|select|correct|answer|question|about|between)\b/i.test(t)
  ) {
    return 'en-US';
  }

  // Default to Brazilian Portuguese
  return 'pt-BR';
}

class SpeechManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingActive = false;
  private listeners: Set<(speaking: boolean) => void> = new Set();

  public subscribe(listener: (speaking: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isSpeakingActive);
    return () => this.listeners.delete(listener);
  }

  private notify(speaking: boolean) {
    this.isSpeakingActive = speaking;
    this.listeners.forEach(cb => cb(speaking));
  }

  public isAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public stop(): void {
    if (!this.isAvailable()) return;
    window.speechSynthesis.cancel();
    this.currentUtterance = null;
    this.notify(false);
  }

  public speak(
    text: string,
    options: {
      lang?: TTSLanguage;
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
    } = {}
  ): void {
    if (!this.isAvailable()) return;

    this.stop();

    if (!text || !text.trim()) return;

    const resolvedLang =
      !options.lang || options.lang === 'auto'
        ? detectLanguage(text)
        : options.lang;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = resolvedLang;
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    // Pick best matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = resolvedLang.split('-')[0].toLowerCase();
      const matchVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
    }

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      this.notify(false);
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e.error);
      }
      this.currentUtterance = null;
      this.notify(false);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isAvailable()) return [];
    return window.speechSynthesis.getVoices();
  }
}

export const speechManager = new SpeechManager();
