import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { GeneratedTrack, User, UserPreferences } from './supabase'

// Generation state types
export type GenerationState = 'idle' | 'generating' | 'success' | 'error'

export interface FormData {
  prompt: string
  genre: string
  mood: string
  duration: number
}

// Audio player state
export interface AudioState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  currentTrack: GeneratedTrack | null
}

// Main app state interface
interface AppState {
  // User state
  user: User | null
  userPreferences: UserPreferences | null
  
  // Tracks state
  tracks: GeneratedTrack[]
  currentTrack: GeneratedTrack | null
  
  // Generation state
  generationState: GenerationState
  generationProgress: number
  generationError: string
  
  // Form state
  formData: FormData
  
  // Audio player state
  audioState: AudioState
  
  // Actions
  setUser: (user: User | null) => void
  setUserPreferences: (preferences: UserPreferences | null) => void
  setTracks: (tracks: GeneratedTrack[]) => void
  addTrack: (track: GeneratedTrack) => void
  updateTrack: (trackId: string, updates: Partial<GeneratedTrack>) => void
  removeTrack: (trackId: string) => void
  setCurrentTrack: (track: GeneratedTrack | null) => void
  
  // Generation actions
  setGenerationState: (state: GenerationState) => void
  setGenerationProgress: (progress: number) => void
  setGenerationError: (error: string) => void
  
  // Form actions
  updateFormData: (field: keyof FormData, value: string | number) => void
  resetFormData: () => void
  
  // Audio actions
  setAudioState: (updates: Partial<AudioState>) => void
  resetAudioState: () => void
}

const defaultFormData: FormData = {
  prompt: '',
  genre: '',
  mood: '',
  duration: 30,
}

const defaultAudioState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  currentTrack: null,
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        userPreferences: null,
        tracks: [],
        currentTrack: null,
        generationState: 'idle',
        generationProgress: 0,
        generationError: '',
        formData: defaultFormData,
        audioState: defaultAudioState,

        // User actions
        setUser: (user) => set({ user }),
        setUserPreferences: (userPreferences) => set({ userPreferences }),

        // Tracks actions
        setTracks: (tracks) => set({ tracks }),
        addTrack: (track) => set((state) => ({
          tracks: [track, ...state.tracks]
        })),
        updateTrack: (trackId, updates) => set((state) => ({
          tracks: state.tracks.map(track =>
            track.id === trackId ? { ...track, ...updates } : track
          )
        })),
        removeTrack: (trackId) => set((state) => ({
          tracks: state.tracks.filter(track => track.id !== trackId)
        })),
        setCurrentTrack: (currentTrack) => set({ currentTrack }),

        // Generation actions
        setGenerationState: (generationState) => set({ generationState }),
        setGenerationProgress: (generationProgress) => set({ generationProgress }),
        setGenerationError: (generationError) => set({ generationError }),

        // Form actions
        updateFormData: (field, value) => set((state) => ({
          formData: { ...state.formData, [field]: value }
        })),
        resetFormData: () => set({ formData: defaultFormData }),

        // Audio actions
        setAudioState: (updates) => set((state) => ({
          audioState: { ...state.audioState, ...updates }
        })),
        resetAudioState: () => set({ audioState: defaultAudioState }),
      }),
      {
        name: 'himig-storage',
        partialize: (state) => ({
          userPreferences: state.userPreferences,
          formData: state.formData,
          audioState: {
            volume: state.audioState.volume,
          },
        }),
      }
    ),
    {
      name: 'himig-store',
    }
  )
)

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user)
export const useTracks = () => useAppStore((state) => state.tracks)
export const useCurrentTrack = () => useAppStore((state) => state.currentTrack)
export const useGenerationState = () => useAppStore((state) => ({
  state: state.generationState,
  progress: state.generationProgress,
  error: state.generationError,
}))
export const useFormData = () => useAppStore((state) => state.formData)
export const useAudioState = () => useAppStore((state) => state.audioState)
