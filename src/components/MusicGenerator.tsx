import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Volume2, Loader2, Music, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { musicAPI, GenerationRequest, GeneratedTrack } from '../services/mockMusicAPI';
import { cn } from '@/lib/utils';

type GenerationState = 'idle' | 'generating' | 'success' | 'error';

interface FormData {
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
}

const GENRES = [
  'Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 
  'Country', 'Blues', 'Reggae', 'Folk', 'Ambient', 'Cinematic'
];

const MOODS = [
  'Happy', 'Sad', 'Energetic', 'Calm', 'Mysterious', 'Romantic',
  'Epic', 'Melancholic', 'Uplifting', 'Dark', 'Peaceful', 'Intense'
];

const MusicGenerator: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    prompt: '',
    genre: '',
    mood: '',
    duration: 30
  });
  
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [generatedTrack, setGeneratedTrack] = useState<GeneratedTrack | null>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // 5 seconds = 50 steps of 2%
      });
    }, 100);
    return interval;
  };

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) {
      setError('Please enter a prompt for your music');
      return;
    }
    
    if (!formData.genre || !formData.mood) {
      setError('Please select both genre and mood');
      return;
    }

    setGenerationState('generating');
    setError('');
    setGeneratedTrack(null);
    
    const progressInterval = simulateProgress();

    try {
      const request: GenerationRequest = {
        prompt: formData.prompt,
        genre: formData.genre,
        mood: formData.mood,
        duration: formData.duration
      };

      const track = await musicAPI.generateMusic(request);
      setGeneratedTrack(track);
      setGenerationState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
      setGenerationState('error');
    } finally {
      clearInterval(progressInterval);
      setProgress(0);
    }
  };

  // Audio player functions
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const vol = parseFloat(e.target.value);
    audioRef.current.volume = vol;
    setVolume(vol);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!generatedTrack) return;
    
    const link = document.createElement('a');
    link.href = generatedTrack.audioUrl;
    link.download = `${generatedTrack.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [generatedTrack]);

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
    if (!generatedTrack) return null;

    return (
      <Card className="w-full max-w-2xl mx-auto mt-6">
        <CardHeader>
          <CardTitle className="text-xl">{generatedTrack.title}</CardTitle>
          <CardDescription>
            {generatedTrack.genre} • {generatedTrack.mood} • Generated {generatedTrack.createdAt.toLocaleTimeString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={generatedTrack.audioUrl}
            onError={() => setError('Failed to load audio. Please try generating again.')}
          />

          {/* Waveform visualization placeholder */}
          <div className="h-20 bg-secondary/20 rounded-lg flex items-center justify-center border-2 border-dashed border-secondary">
            <div className="flex items-center gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 bg-primary/60 rounded-full transition-all duration-150",
                    isPlaying ? "animate-pulse" : ""
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
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
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
                {isPlaying ? (
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
                  value={volume}
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
            <p><strong>Prompt:</strong> {generatedTrack.prompt}</p>
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
                setGenerationState('idle');
                setGeneratedTrack(null);
                setError('');
                setIsPlaying(false);
                setCurrentTime(0);
                setDuration(0);
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
