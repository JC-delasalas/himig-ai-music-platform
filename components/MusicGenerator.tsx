'use client'

import React, { useRef, useEffect } from 'react'
import { Play, Pause, Download, Volume2, Loader2, Music, AlertCircle, Heart } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { useAppStore, useFormData, useGenerationState, useAudioState } from '@/lib/store'
import { validatePrompt, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const GENRES = [
  'Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 
  'Country', 'Blues', 'Reggae', 'Folk', 'Ambient', 'Cinematic'
]

const MOODS = [
  'Happy', 'Sad', 'Energetic', 'Calm', 'Mysterious', 'Romantic',
  'Epic', 'Melancholic', 'Uplifting', 'Dark', 'Peaceful', 'Intense'
]

const MusicGenerator: React.FC = () => {
  const formData = useFormData()
  const { state: generationState, progress, error } = useGenerationState()
  const audioState = useAudioState()
  
  const {
    updateFormData,
    setGenerationState,
    setGenerationProgress,
    setGenerationError,
    setAudioState,
    resetAudioState,
    currentTrack,
    setCurrentTrack,
    addTrack,
  } = useAppStore()

  const audioRef = useRef<HTMLAudioElement>(null)

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    updateFormData(field, value)
  }

  const simulateProgress = () => {
    setGenerationProgress(0)
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2 // 5 seconds = 50 steps of 2%
      })
    }, 100)
    return interval
  }

  const handleGenerate = async () => {
    const validation = validatePrompt(formData.prompt)
    if (!validation.isValid) {
      setGenerationError(validation.error || 'Invalid prompt')
      return
    }
    
    if (!formData.genre || !formData.mood) {
      setGenerationError('Please select both genre and mood')
      return
    }

    setGenerationState('generating')
    setGenerationError('')
    setCurrentTrack(null)
    resetAudioState()
    
    const progressInterval = simulateProgress()

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: formData.prompt,
          genre: formData.genre,
          mood: formData.mood,
          duration: formData.duration,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      const track = data.track
      setCurrentTrack(track)
      addTrack(track)
      setGenerationState('success')
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : 'An error occurred during generation')
      setGenerationState('error')
    } finally {
      clearInterval(progressInterval)
      setGenerationProgress(0)
    }
  }

  // Audio player functions
  const togglePlayPause = () => {
    if (!audioRef.current) return
    
    if (audioState.isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setAudioState({ isPlaying: !audioState.isPlaying })
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = parseFloat(e.target.value)
    audioRef.current.currentTime = time
    setAudioState({ currentTime: time })
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const vol = parseFloat(e.target.value)
    audioRef.current.volume = vol
    setAudioState({ volume: vol })
  }

  const handleDownload = () => {
    if (!currentTrack) return
    
    const link = document.createElement('a')
    link.href = currentTrack.audio_url
    link.download = `${currentTrack.title}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFavorite = async () => {
    if (!currentTrack) return
    
    try {
      const response = await fetch(`/api/tracks/${currentTrack.id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isFavorite: !currentTrack.is_favorite,
        }),
      })

      if (response.ok) {
        const updatedTrack = { ...currentTrack, is_favorite: !currentTrack.is_favorite }
        setCurrentTrack(updatedTrack)
      }
    } catch (error) {
      console.error('Failed to update favorite:', error)
    }
  }

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setAudioState({ duration: audio.duration })
    }

    const handleTimeUpdate = () => {
      setAudioState({ currentTime: audio.currentTime })
    }

    const handleEnded = () => {
      setAudioState({ isPlaying: false, currentTime: 0 })
    }

    const handleError = () => {
      setGenerationError('Failed to load audio. Please try generating again.')
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [currentTrack, setAudioState, setGenerationError])

  const renderPromptForm = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-6 w-6" />
          Generate Your Music
        </CardTitle>
        <CardDescription>
          Describe the music you want to create and customize the settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your music
          </label>
          <Textarea
            placeholder="e.g., A peaceful piano melody for meditation, upbeat electronic dance track, melancholic guitar ballad..."
            value={formData.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Genre</label>
            <Select
              value={formData.genre}
              onChange={(e) => handleInputChange('genre', e.target.value)}
              placeholder="Select genre"
            >
              {GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mood</label>
            <Select
              value={formData.mood}
              onChange={(e) => handleInputChange('mood', e.target.value)}
              placeholder="Select mood"
            >
              {MOODS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Duration: {formData.duration} seconds
          </label>
          <input
            type="range"
            min="15"
            max="120"
            step="5"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>15s</span>
            <span>120s</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generationState === 'generating'}
          className="w-full"
          size="lg"
        >
          {generationState === 'generating' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating... {progress}%
            </>
          ) : (
            'Generate Music'
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderAudioPlayer = () => {
    if (!currentTrack) return null

    return (
      <Card className="w-full max-w-2xl mx-auto mt-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{currentTrack.title}</CardTitle>
              <CardDescription>
                {currentTrack.genre} • {currentTrack.mood} • Generated {new Date(currentTrack.created_at).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className={cn(
                "shrink-0",
                currentTrack.is_favorite && "text-red-500"
              )}
            >
              <Heart className={cn(
                "h-5 w-5",
                currentTrack.is_favorite && "fill-current"
              )} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={currentTrack.audio_url}
          />

          {/* Waveform visualization placeholder */}
          <div className="h-20 bg-secondary/20 rounded-lg flex items-center justify-center border-2 border-dashed border-secondary">
            <div className="flex items-center gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-primary/60 rounded-full transition-all duration-150",
                    audioState.isPlaying ? "animate-pulse" : ""
                  )}
                  style={{
                    height: `${Math.random() * 60 + 10}px`,
                    animationDelay: `${i * 50}ms`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={audioState.duration || 0}
              value={audioState.currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(audioState.currentTime)}</span>
              <span>{formatTime(audioState.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="rounded-full w-12 h-12"
              >
                {audioState.isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-1" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioState.volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Track info */}
          <div className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-lg">
            <p><strong>Prompt:</strong> {currentTrack.prompt}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {generationState !== 'success' && renderPromptForm()}
      {generationState === 'success' && (
        <>
          {renderAudioPlayer()}
          <div className="text-center">
            <Button
              onClick={() => {
                setGenerationState('idle')
                setCurrentTrack(null)
                setGenerationError('')
                resetAudioState()
              }}
              variant="outline"
            >
              Generate Another Track
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MusicGenerator;
