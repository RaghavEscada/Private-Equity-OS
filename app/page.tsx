import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, MessageSquare, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <span className="text-xl font-semibold tracking-tight">Deal&nbsp;Lab&nbsp;AI</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/chat">Chatbot</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/deals">CRM</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Your Intelligent
              <br />
              <span className="text-primary">Private Equity</span> Assistant
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Streamline your deal pipeline with AI-powered insights. Search, analyze, and manage your private equity deals effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8">
                <Link href="/chat">
                  Start Chatbot
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href="/deals">
                  View Deals CRM
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold text-center mb-12">
                Powerful Features for Deal Management
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Natural Language Queries</CardTitle>
                    <CardDescription>
                      Ask questions in plain English and get instant answers about your deal pipeline.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Real-time Analytics</CardTitle>
                    <CardDescription>
                      Get comprehensive summaries and insights about your deals, sectors, and valuations.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Lightning Fast</CardTitle>
                    <CardDescription>
                      Instant responses powered by advanced AI to help you make decisions faster.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Pipeline Insights</CardTitle>
                    <CardDescription>
                      Track deal status, valuations, and sector distribution at a glance.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Smart Filtering</CardTitle>
                    <CardDescription>
                      Filter deals by sector, status, revenue, or valuation with natural language commands.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Data Visualization</CardTitle>
                    <CardDescription>
                      Beautiful tables and summaries that make complex deal data easy to understand.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
        </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Deal Lab AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
