'use client'

import React, { useState } from 'react'
import { Share2, Copy, Twitter, Facebook, Link, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { useToast } from '@/hooks/use-toast'
import { GeneratedTrack } from '@/lib/supabase'
import { trackUserInteraction } from '@/lib/analytics'

interface ShareDialogProps {
  track: GeneratedTrack
  children?: React.ReactNode
}

const ShareDialog: React.FC<ShareDialogProps> = ({ track, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}/track/${track.id}`
  const shareText = `Check out this AI-generated music: "${track.title}" - Created with Himig AI`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied",
        description: "Track link copied to clipboard",
      })
      trackUserInteraction('copy_link', 'share_dialog', { track_id: track.id })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link",
        variant: "destructive",
      })
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')
    trackUserInteraction('share_twitter', 'share_dialog', { track_id: track.id })
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=550,height=420')
    trackUserInteraction('share_facebook', 'share_dialog', { track_id: track.id })
  }

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: track.title,
          text: shareText,
          url: shareUrl,
        })
        trackUserInteraction('share_native', 'share_dialog', { track_id: track.id })
      } else {
        handleCopyLink()
      }
    } catch (error) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', error)
    }
  }

  const handleDownloadTrack = () => {
    const link = document.createElement('a')
    link.href = track.audio_url
    link.download = `${track.title}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    trackUserInteraction('download', 'share_dialog', { track_id: track.id })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{track.title}"</DialogTitle>
          <DialogDescription>
            Share this AI-generated music track with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Track Info */}
          <div className="flex items-center space-x-3 p-3 bg-secondary/20 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{track.title}</p>
              <p className="text-sm text-muted-foreground">
                {track.genre} • {track.mood}
              </p>
            </div>
          </div>

          {/* Share URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share Link</label>
            <div className="flex space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share On</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleTwitterShare}
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={handleFacebookShare}
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={handleNativeShare}
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadTrack}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareDialog
