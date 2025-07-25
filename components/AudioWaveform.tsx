'use client'

import React, { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AudioWaveformProps {
  audioUrl: string
  isPlaying: boolean
  currentTime: number
  duration: number
  className?: string
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number>()
  const [waveformData, setWaveformData] = useState<number[]>([])

  // Generate mock waveform data for demo purposes
  useEffect(() => {
    const generateMockWaveform = () => {
      const bars = 60
      const data = Array.from({ length: bars }, (_, i) => {
        // Create a more realistic waveform pattern
        const baseHeight = Math.sin(i * 0.1) * 0.3 + 0.5
        const variation = Math.random() * 0.4
        return Math.max(0.1, Math.min(1, baseHeight + variation))
      })
      setWaveformData(data)
    }

    generateMockWaveform()
  }, [audioUrl])

  // Initialize Web Audio API (for future real waveform analysis)
  useEffect(() => {
    if (typeof window !== 'undefined' && audioUrl && !audioUrl.startsWith('data:')) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        
        const bufferLength = analyserRef.current.frequencyBinCount
        dataArrayRef.current = new Uint8Array(bufferLength)
      } catch (error) {
        console.warn('Web Audio API not supported:', error)
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [audioUrl])

  // Animation loop for real-time visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      if (!isPlaying) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw waveform bars
      const barWidth = canvas.width / waveformData.length
      const progress = duration > 0 ? currentTime / duration : 0

      waveformData.forEach((height, index) => {
        const barHeight = height * canvas.height * 0.8
        const x = index * barWidth
        const y = (canvas.height - barHeight) / 2

        // Determine bar color based on progress
        const barProgress = index / waveformData.length
        const isPlayed = barProgress <= progress
        
        // Add some animation to the bars
        const animationOffset = isPlaying ? Math.sin(Date.now() * 0.01 + index * 0.1) * 2 : 0
        const finalHeight = barHeight + animationOffset

        ctx.fillStyle = isPlayed 
          ? 'hsl(217.2 91.2% 59.8%)' // Primary color for played portion
          : 'hsl(217.2 32.6% 17.5%)' // Secondary color for unplayed portion
        
        ctx.fillRect(x, y - animationOffset / 2, barWidth - 1, finalHeight)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, currentTime, duration, waveformData])

  // Static waveform rendering when not playing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isPlaying) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw static waveform
    const barWidth = canvas.width / waveformData.length
    const progress = duration > 0 ? currentTime / duration : 0

    waveformData.forEach((height, index) => {
      const barHeight = height * canvas.height * 0.8
      const x = index * barWidth
      const y = (canvas.height - barHeight) / 2

      const barProgress = index / waveformData.length
      const isPlayed = barProgress <= progress

      ctx.fillStyle = isPlayed 
        ? 'hsl(217.2 91.2% 59.8%)' 
        : 'hsl(217.2 32.6% 17.5%)'
      
      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })
  }, [currentTime, duration, waveformData, isPlaying])

  return (
    <div className={cn("relative w-full h-20 bg-secondary/20 rounded-lg overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        width={800}
        height={80}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Progress indicator */}
      <div 
        className="absolute top-0 left-0 h-full w-0.5 bg-primary/80 transition-all duration-100"
        style={{ 
          left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
          opacity: duration > 0 ? 1 : 0
        }}
      />
      
      {/* Loading overlay */}
      {waveformData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading waveform...</div>
        </div>
      )}
    </div>
  )
}

export default AudioWaveform
