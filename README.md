<<<<<<< HEAD
# Himig - AI-Powered Music Generation Platform

A professional-grade Next.js application for generating music from text prompts using AI, built to match the quality and functionality of platforms like Suno AI.

## 🚀 Features

### Core Functionality
- **AI Music Generation**: Create unique compositions from text descriptions
- **Advanced Controls**: Genre, mood, duration, and style customization
- **Professional Audio Player**: Waveform visualization, seek controls, volume management
- **User Authentication**: Secure sign-up/sign-in with Clerk
- **Track Library**: Personal collection with favorites and play history
- **Real-time Progress**: Live generation progress with visual feedback

### Technical Features
- **Server-Side Rendering**: Optimized performance and SEO
- **Database Integration**: Persistent user data and track storage
- **API Routes**: Built-in backend functionality
- **State Management**: Zustand for efficient global state
- **Responsive Design**: Mobile-first, works on all devices
- **Production Ready**: Vercel deployment with CDN

## 🛠 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Zustand** - Lightweight state management
- **Lucide React** - Modern icon library

### Backend & Database
- **Next.js API Routes** - Built-in backend functionality
- **Supabase** - PostgreSQL database with real-time features
- **Clerk** - Authentication and user management
- **Row Level Security** - Database-level security policies

### Deployment & Infrastructure
- **Vercel** - Serverless deployment platform
- **Cloudflare** - CDN and security (planned)
- **Environment Variables** - Secure configuration management

## 📋 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account (for authentication)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd himig
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

3. **Set up the database:**
```bash
# Run the database schema setup
node scripts/setup-database.js --direct
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## 🏗 Project Structure

```
himig/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   │   ├── generate/      # Music generation endpoint
│   │   ├── tracks/        # Track management
│   │   └── webhooks/      # Clerk webhooks
│   ├── dashboard/         # User dashboard
│   ├── generate/          # Music generation page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components
│   └── MusicGenerator.tsx # Main generation component
├── lib/
│   ├── store.ts           # Zustand state management
│   ├── supabase.ts        # Database client and helpers
│   └── utils.ts           # Utility functions
├── database/
│   └── schema.sql         # Database schema
├── scripts/
│   └── setup-database.js  # Database setup script
└── middleware.ts          # Clerk authentication middleware
```

## 🔧 Configuration

### Database Setup

The application uses Supabase with the following tables:
- **users**: User profiles and authentication data
- **generated_tracks**: AI-generated music tracks
- **user_preferences**: User settings and defaults

Run the database schema:
```sql
-- Execute the SQL in database/schema.sql in your Supabase dashboard
-- Or use the setup script: node scripts/setup-database.js --direct
```

### Authentication Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Configure OAuth providers (Google, GitHub, etc.)
3. Set up webhooks for user synchronization
4. Add environment variables to `.env.local`

### Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/himig)

Or manually:
```bash
npm run build
vercel --prod
```

## 🎵 Usage

### For Users
1. **Sign Up**: Create an account or sign in
2. **Generate Music**: Describe your desired music
3. **Customize**: Select genre, mood, and duration
4. **Listen & Download**: Play your generated track and download
5. **Manage Library**: View history, favorites, and statistics

### For Developers
1. **API Integration**: Replace mock API with real AI service
2. **Custom Components**: Extend UI with new features
3. **Database Queries**: Add new data relationships
4. **State Management**: Extend Zustand stores for new features

## 🔌 API Integration

To integrate with a real AI music generation service:

```typescript
// Replace in app/api/generate/route.ts
const response = await fetch('https://your-ai-service.com/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt,
    genre,
    mood,
    duration,
  }),
})

const audioData = await response.json()
```

## 🧪 Development

### Running Tests
```bash
npm run test
npm run test:watch
```

### Code Quality
```bash
npm run lint
npm run type-check
```

### Database Migrations
```bash
# Add new migrations to database/migrations/
# Run: node scripts/migrate.js
```

## 🚀 Roadmap

### Phase 3 (Weeks 5-6)
- [ ] Radix UI component integration
- [ ] Advanced audio features (Web Audio API)
- [ ] Performance monitoring
- [ ] Analytics integration

### Phase 4 (Weeks 7-8)
- [ ] Cloudflare CDN setup
- [ ] Social sharing features
- [ ] Advanced caching strategies
- [ ] Production monitoring

### Future Enhancements
- [ ] Real-time collaboration
- [ ] Advanced audio effects
- [ ] Mobile app (React Native)
- [ ] API marketplace integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write tests for new features
- Update documentation
- Follow semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Suno AI](https://suno.com) for inspiration
- [Clerk](https://clerk.com) for authentication
- [Supabase](https://supabase.com) for database
- [Vercel](https://vercel.com) for deployment
- [shadcn/ui](https://ui.shadcn.com) for components

## 📞 Support

- 📧 Email: support@himig.ai
- 💬 Discord: [Join our community](https://discord.gg/himig)
- 📖 Documentation: [docs.himig.ai](https://docs.himig.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/JC-delasalas/himig-ai-music-platform/issues)
