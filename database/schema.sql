-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated tracks table
CREATE TABLE IF NOT EXISTS generated_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    genre VARCHAR(100) NOT NULL,
    mood VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL CHECK (duration >= 15 AND duration <= 120),
    audio_url TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_genre VARCHAR(100),
    default_mood VARCHAR(100),
    default_duration INTEGER DEFAULT 30 CHECK (default_duration >= 15 AND default_duration <= 120),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_tracks_user_id ON generated_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_tracks_created_at ON generated_tracks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_tracks_is_favorite ON generated_tracks(is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(track_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE generated_tracks 
    SET play_count = play_count + 1, updated_at = NOW()
    WHERE id = track_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_tracks_updated_at 
    BEFORE UPDATE ON generated_tracks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Generated tracks policies
CREATE POLICY "Users can view own tracks" ON generated_tracks
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own tracks" ON generated_tracks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own tracks" ON generated_tracks
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own tracks" ON generated_tracks
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Sample data for testing (optional)
-- INSERT INTO users (id, email, full_name) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User');

-- INSERT INTO user_preferences (user_id, default_genre, default_mood, default_duration) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', 'Electronic', 'Energetic', 60);
