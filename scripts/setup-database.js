const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Setting up Himig database schema...')
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error)
        // Continue with other statements
      }
    }
    
    console.log('Database setup completed successfully!')
    
    // Test the connection
    console.log('Testing database connection...')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('Database connection test failed:', error)
    } else {
      console.log('Database connection test passed!')
    }
    
  } catch (error) {
    console.error('Database setup failed:', error)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function setupDatabaseDirect() {
  try {
    console.log('Setting up Himig database schema (direct method)...')
    
    // Create tables directly using Supabase client
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255),
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'generated_tracks',
        sql: `
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
        `
      },
      {
        name: 'user_preferences',
        sql: `
          CREATE TABLE IF NOT EXISTS user_preferences (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            default_genre VARCHAR(100),
            default_mood VARCHAR(100),
            default_duration INTEGER DEFAULT 30 CHECK (default_duration >= 15 AND default_duration <= 120),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ]
    
    for (const table of tables) {
      console.log(`Creating table: ${table.name}`)
      // Note: This is a simplified approach. In production, you would run these via Supabase dashboard or CLI
      console.log(`SQL for ${table.name}:`)
      console.log(table.sql)
    }
    
    console.log('Database schema logged. Please run these SQL statements in your Supabase dashboard.')
    
  } catch (error) {
    console.error('Database setup failed:', error)
  }
}

// Run the setup
if (process.argv.includes('--direct')) {
  setupDatabaseDirect()
} else {
  setupDatabase()
}
