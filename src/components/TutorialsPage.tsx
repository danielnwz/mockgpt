import { ArrowLeft, Play } from 'lucide-react';

interface TutorialsPageProps {
  onBack: () => void;
}

export function TutorialsPage({ onBack }: TutorialsPageProps) {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <header className="h-14 border-b border-border flex items-center px-4 gap-3 flex-shrink-0 bg-card/50 backdrop-blur">
        <button
          onClick={onBack}
          className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium text-foreground">Tutorials</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Learn how to use MOCKGPT</h2>
            <p className="text-muted-foreground">Watch these tutorials to get the most out of your AI assistants.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Tutorial Card 1 */}
            <div className="group border border-border rounded-xl bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer">
              <div className="aspect-video bg-muted relative flex items-center justify-center group-hover:bg-accent/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">Getting Started with MOCKGPT</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Learn the basics of creating and managing your first AI assistant. We'll cover workspace setup and basic settings.</p>
              </div>
            </div>

            {/* Tutorial Card 2 */}
            <div className="group border border-border rounded-xl bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer">
              <div className="aspect-video bg-muted relative flex items-center justify-center group-hover:bg-accent/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">Advanced Prompt Engineering</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Master system prompts to get the exact behavior you need. Discover tips and tricks for complex task automation.</p>
              </div>
            </div>
            
            {/* Tutorial Card 3 */}
            <div className="group border border-border rounded-xl bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer">
              <div className="aspect-video bg-muted relative flex items-center justify-center group-hover:bg-accent/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">Managing Privacy & Data</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Understand the difference between Secure and Standard Workspaces and how to protect sensitive information.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
