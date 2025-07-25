import { Music } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
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
              <Button variant="outline">Generate Music</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Create Music with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your ideas into professional-quality music using advanced AI technology. 
            Describe your vision, and watch it come to life as a unique musical composition.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generate">
              <Button size="lg" className="text-lg px-8 py-6">
                Generate Music
              </Button>
            </Link>
            <Link href="/generate">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Generation</h3>
            <p className="text-muted-foreground">
              Advanced AI models create unique compositions based on your text descriptions and preferences.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customizable Controls</h3>
            <p className="text-muted-foreground">
              Fine-tune genre, mood, duration, and style to match your exact creative vision.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border border-border bg-card">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Quality</h3>
            <p className="text-muted-foreground">
              Export high-quality audio files ready for commercial use, streaming, or personal enjoyment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
