export interface GenerationRequest {
  prompt: string;
  genre: string;
  mood: string;
  duration: number;
}

export interface GeneratedTrack {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  createdAt: Date;
  prompt: string;
  genre: string;
  mood: string;
}

// Mock audio URLs - using sample audio files from freesound.org or similar
const SAMPLE_AUDIO_URLS = [
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'https://file-examples.com/storage/fe68c1b7c1a9d6b/2017/11/file_example_MP3_700KB.mp3',
  // Fallback to a data URL with a simple tone if external URLs don't work
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmHgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
];

class MockMusicAPI {
  private static instance: MockMusicAPI;
  private generationCount = 0;

  static getInstance(): MockMusicAPI {
    if (!MockMusicAPI.instance) {
      MockMusicAPI.instance = new MockMusicAPI();
    }
    return MockMusicAPI.instance;
  }

  async generateMusic(request: GenerationRequest): Promise<GeneratedTrack> {
    // Simulate API call delay (5 seconds as requested)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Generation failed. Please try again.');
    }

    this.generationCount++;
    
    // Generate a title based on the prompt
    const title = this.generateTitle(request.prompt, request.genre, request.mood);
    
    // Select a random sample audio URL
    const audioUrl = SAMPLE_AUDIO_URLS[Math.floor(Math.random() * SAMPLE_AUDIO_URLS.length)];

    const track: GeneratedTrack = {
      id: `track_${Date.now()}_${this.generationCount}`,
      title,
      audioUrl,
      duration: request.duration,
      createdAt: new Date(),
      prompt: request.prompt,
      genre: request.genre,
      mood: request.mood,
    };

    return track;
  }

  private generateTitle(prompt: string, genre: string, mood: string): string {
    const words = prompt.split(' ').filter(word => word.length > 3);
    const keyWord = words[Math.floor(Math.random() * words.length)] || 'Untitled';
    
    const titleTemplates = [
      `${keyWord} in ${genre}`,
      `${mood} ${keyWord}`,
      `${keyWord} Dreams`,
      `${genre} ${keyWord}`,
      `${keyWord} Vibes`,
    ];

    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  }
}

export const musicAPI = MockMusicAPI.getInstance();
