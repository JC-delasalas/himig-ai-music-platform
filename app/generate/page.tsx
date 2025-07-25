import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { Music } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <SignedOut>
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Music className="h-6 w-6" />
                Sign In Required
              </CardTitle>
              <CardDescription>
                Please sign in to generate music and save your creations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <SignInButton mode="modal">
                <Button size="lg">Sign In to Continue</Button>
              </SignInButton>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <MusicGenerator />
        </SignedIn>
      </div>
    </div>
  )
}
