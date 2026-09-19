// Types for the parts of react-audio-canvas we use (the package ships none).
declare module 'react-audio-canvas' {
  export interface UseAudio {
    audioNode: HTMLAudioElement | null
    audioContext: AudioContext | null
    isPlaying: boolean
    play: () => void
    pause: () => void
    toggleAudio: () => void
    stopAudio: () => void
    /** 0–100 */
    setVolume: (volume: number) => void
    analyzer: AnalyserNode | null
    bufferLength: number | null
    dataArray: Uint8Array | null
    audioDuration: number
    audioCurrentTime: number
    audioVolume: number
  }
  export function useAudio(src: string | Blob | File | null, fftSize?: number, detector?: boolean): UseAudio
  export interface DetectedNote {
    frequency: string
    pitch: string
    octave: number
    confidence: string
    note: string
    cents: number
  }
  /** Autocorrelation pitch detection over 128-centred byte samples (time-domain data). */
  export function detectNote(samples: Uint8Array, sampleRate?: number): DetectedNote[] | null
}
