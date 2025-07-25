import { Music } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MusicGenerator from '@/components/MusicGenerator'

export default function GeneratePage() {
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
            <Link href="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <MusicGenerator />
      </div>
    </div>
  )
}
