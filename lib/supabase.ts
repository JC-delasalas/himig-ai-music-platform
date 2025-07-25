import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface GeneratedTrack {
  id: string
  user_id: string
  title: string
  prompt: string
  genre: string
  mood: string
  duration: number
  audio_url: string
  created_at: string
  updated_at: string
  is_favorite: boolean
  play_count: number
}

export interface UserPreferences {
  id: string
  user_id: string
  default_genre?: string
  default_mood?: string
  default_duration: number
  created_at: string
  updated_at: string
}

// Helper functions for database operations
export async function createUser(userData: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getUserTracks(userId: string) {
  const { data, error } = await supabase
    .from('generated_tracks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function saveGeneratedTrack(trackData: Partial<GeneratedTrack>) {
  const { data, error } = await supabase
    .from('generated_tracks')
    .insert([trackData])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTrackFavorite(trackId: string, isFavorite: boolean) {
  const { data, error } = await supabase
    .from('generated_tracks')
    .update({ is_favorite: isFavorite })
    .eq('id', trackId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function incrementPlayCount(trackId: string) {
  const { data, error } = await supabase
    .rpc('increment_play_count', { track_id: trackId })
  
  if (error) throw error
  return data
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert([{ user_id: userId, ...preferences }])
    .select()
    .single()
  
  if (error) throw error
  return data
}
