import MusicGenerator from './components/MusicGenerator'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Himig</h1>
          <p className="text-muted-foreground text-lg">AI-Powered Music Generation Platform</p>
        </header>
        <MusicGenerator />
      </div>
    </div>
  )
}

export default App
