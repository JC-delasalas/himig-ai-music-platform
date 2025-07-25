'use client'

import React, { useRef, useEffect } from 'react'
import { Play, Pause, Download, Volume2, Loader2, Music, AlertCircle, Heart, Settings, Share2 } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Slider } from './ui/slider'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useAppStore, useFormData, useGenerationState, useAudioState } from '@/lib/store'
import { validatePrompt, formatTime } from '@/lib/utils'
import { trackMusicGeneration, trackUserInteraction, trackError } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import AudioWaveform from './AudioWaveform'
import ShareDialog from './ShareDialog'

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
  const { toast } = useToast()

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

    // Track generation start
    const startTime = Date.now()
    trackMusicGeneration('start', {
      prompt: formData.prompt,
      genre: formData.genre,
      mood: formData.mood,
      duration: formData.duration
    })

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

      // Track successful generation
      const generationTime = Date.now() - startTime
      trackMusicGeneration('complete', {
        track_id: track.id,
        generation_time: generationTime,
        prompt: formData.prompt,
        genre: formData.genre,
        mood: formData.mood,
        duration: formData.duration
      })

      // Show success toast
      toast({
        title: "Music Generated Successfully!",
        description: `"${track.title}" is ready to play`,
        variant: "success",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during generation'
      setGenerationError(errorMessage)
      setGenerationState('error')

      // Track generation error
      trackMusicGeneration('error', {
        error: errorMessage,
        prompt: formData.prompt,
        genre: formData.genre,
        mood: formData.mood,
        duration: formData.duration
      })

      // Track error for monitoring
      if (err instanceof Error) {
        trackError(err, { context: 'music_generation' })
      }

      // Show error toast
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      clearInterval(progressInterval)
      setGenerationProgress(0)
    }
  }

  // Audio player functions
  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return

    if (audioState.isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      // Track play event
      trackUserInteraction('play', 'audio_player', {
        track_id: currentTrack.id,
        track_title: currentTrack.title
      })
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

    // Track download event
    trackUserInteraction('download', 'audio_player', {
      track_id: currentTrack.id,
      track_title: currentTrack.title
    })

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

        // Show toast notification
        toast({
          title: updatedTrack.is_favorite ? "Added to Favorites" : "Removed from Favorites",
          description: `"${updatedTrack.title}" ${updatedTrack.is_favorite ? 'added to' : 'removed from'} your favorites`,
        })
      }
    } catch (error) {
      console.error('Failed to update favorite:', error)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    if (!currentTrack) return

    try {
      if (navigator.share) {
        await navigator.share({
          title: currentTrack.title,
          text: `Check out this AI-generated music: "${currentTrack.title}"`,
          url: window.location.href,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "Track link copied to clipboard",
        })
      }
    } catch (error) {
      console.error('Failed to share:', error)
      toast({
        title: "Share Failed",
        description: "Unable to share track",
        variant: "destructive",
      })
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
          <Slider
            value={[formData.duration]}
            onValueChange={(value) => handleInputChange('duration', value[0])}
            max={120}
            min={15}
            step={5}
            className="w-full"
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

        {generationState === 'generating' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Generating your music...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
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
              Generating...
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
            <div className="flex items-center gap-2">
              <ShareDialog track={currentTrack}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </ShareDialog>
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={currentTrack.audio_url}
          />

          {/* Advanced Waveform visualization */}
          <AudioWaveform
            audioUrl={currentTrack.audio_url}
            isPlaying={audioState.isPlaying}
            currentTime={audioState.currentTime}
            duration={audioState.duration}
            className="border border-border"
          />

          {/* Progress bar */}
          <div className="space-y-2">
            <Slider
              value={[audioState.currentTime]}
              onValueChange={(value) => handleSeek({ target: { value: value[0].toString() } } as any)}
              max={audioState.duration || 0}
              min={0}
              step={0.1}
              className="w-full"
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
                <Slider
                  value={[audioState.volume]}
                  onValueChange={(value) => handleVolumeChange({ target: { value: value[0].toString() } } as any)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-20"
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
