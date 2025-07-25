import { auth, UserButton } from '@clerk/nextjs'
import { Music, Plus, Heart, Play, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserTracks } from '@/lib/supabase'
import { formatDate, formatTime } from '@/lib/utils'

export default async function DashboardPage() {
  const { userId } = auth()
  
  if (!userId) {
    return null // This should be handled by middleware
  }

  // Fetch user's tracks
  let tracks = []
  try {
    tracks = await getUserTracks(userId)
  } catch (error) {
    console.error('Failed to fetch tracks:', error)
  }

  const favoriteCount = tracks.filter(track => track.is_favorite).length
  const totalPlayCount = tracks.reduce((sum, track) => sum + track.play_count, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Himig</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/generate">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Music
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Music Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your AI-generated music collection and create new tracks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tracks.length}</div>
              <p className="text-xs text-muted-foreground">
                Generated compositions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favoriteCount}</div>
              <p className="text-xs text-muted-foreground">
                Liked tracks
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPlayCount}</div>
              <p className="text-xs text-muted-foreground">
                Playback count
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tracks Library */}
        <Card>
          <CardHeader>
            <CardTitle>Your Music Library</CardTitle>
            <CardDescription>
              All your generated tracks in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start creating your first AI-generated music track
                </p>
                <Link href="/generate">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Your First Track
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{track.title}</h3>
                        {track.is_favorite && (
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {track.genre} • {track.mood} • {formatTime(track.duration)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(new Date(track.created_at))} • {track.play_count} plays
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={track.audio_url} download={`${track.title}.mp3`}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
