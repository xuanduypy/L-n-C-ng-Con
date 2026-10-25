/**
 * Utility functions for text parsing, word counting, and sentence segmentation
 * optimized for Vietnamese and multilingual text-to-speech reading.
 */

export function countWords(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Splits arbitrary text into clean sentences/clauses suitable for sequential speech synthesis.
 * Handles dialogues, punctuation marks (. ! ? ; :), ellipsis, and newlines.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text) return [];

  // Normalize line breaks and remove weird formatting
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/[*_#`~[\]]/g, '')
    .trim();

  // Split by common sentence terminators (. ! ? \n) while preserving meaningful units
  const rawSegments = normalized.split(/(?<=[.!?\n…])\s+/);

  const sentences: string[] = [];

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    // If segment is very long (> 220 chars without punctuation), split by comma or semicolon
    if (trimmed.length > 220 && trimmed.includes(',')) {
      const subParts = trimmed.split(/(?<=[,;])\s+/);
      for (const part of subParts) {
        const subTrimmed = part.trim();
        if (subTrimmed) {
          sentences.push(subTrimmed);
        }
      }
    } else {
      sentences.push(trimmed);
    }
  }

  return sentences.length > 0 ? sentences : [normalized];
}

/**
 * Calculates estimated reading duration in seconds.
 * Average speaking speed for Vietnamese narration is around 140 words per minute (~2.33 words/sec).
 */
export function estimateDuration(wordCount: number, playbackRate: number = 1.0): number {
  if (wordCount <= 0) return 0;
  const baseWordsPerSec = 2.4;
  const effectiveWordsPerSec = baseWordsPerSec * (playbackRate || 1.0);
  return Math.max(2, Math.round(wordCount / effectiveWordsPerSec));
}

/**
 * Formats seconds into Spotify style mm:ss or hh:mm:ss
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSec = Math.floor(seconds);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
