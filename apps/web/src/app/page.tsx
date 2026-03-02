"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Users, Zap, GitBranch, MessageSquare, Play, ArrowRight, Sparkles } from "lucide-react";
import MouseEffectCard from "@/components/kokonutui/mouse-effect-card";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {

  }, [isAuthenticated, router]);

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-green-900/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded flex items-center justify-center">
              <Code2 className="h-5 w-5 text-black" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">CollabCode</span>
          </div>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="default" className="">
                Dashboard
              </Button>
            </Link>
          ) : <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-green-900/20">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold">
                Get Started
              </Button>
            </Link>
          </div>}

        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-900/20 border border-green-900/40 rounded-full">
                <Sparkles className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">AI-Powered Collaboration</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Code <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">Smarter.</span> <span className="text-white">Together.</span>
              </h1>

              <p className="text-xl text-gray-400 mb-8">
                Real-time collaborative IDE with 8 programming stacks. Create rooms, invite teammates, and code together instantly—no setup required.
              </p>

              <div className="flex gap-4 flex-wrap">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold group">
                    Start Coding Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="lg" variant="outline" className="border-green-900/40 text-white hover:bg-green-900/10 hover:border-green-700">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Feature Preview - Right Column */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-900/30 rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-green-900/20">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">8 Language Stacks Ready</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-green-900/20">
                    <Users className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Real-time Presence Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-green-900/20">
                    <MessageSquare className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Integrated Team Chat</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg border border-green-900/20">
                    <Play className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Instant Execution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-green-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">8+</div>
              <p className="text-gray-400">Programming Languages</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">0ms</div>
              <p className="text-gray-400">Setup Time</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">∞</div>
              <p className="text-gray-400">Team Members</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
              <p className="text-gray-400">Browser-Based</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">
            Everything You Need to Code <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Together</span>
          </h2>
          <p className="text-center text-gray-400 text-lg mb-16">Comprehensive collaboration tools built for modern teams</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <MouseEffectCard
              title="Full IDE Experience"
              subtitle="VS Code running in your browser. All extensions and features you need."
              topText="IDE"
              topSubtext="Browser-based"
              primaryCtaText="Try Now"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Powered by VS Code"
              className="border-green-900/30 hover:border-green-700/50"
            />

            {/* Feature 2 */}
            <MouseEffectCard
              title="Live Collaboration"
              subtitle="See teammates' cursors, presence status, and collaborate in real-time."
              topText="Real-time"
              topSubtext="Zero latency"
              primaryCtaText="Start Collab"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Multi-user editing"
              className="border-green-900/30 hover:border-green-700/50"
            />

            {/* Feature 3 */}
            <MouseEffectCard
              title="Team Chat"
              subtitle="Integrated messaging for seamless team communication without context switching."
              topText="Chat"
              topSubtext="Built-in"
              primaryCtaText="Join Chat"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Instant messaging"
              className="border-green-900/30 hover:border-green-700/50"
            />

            {/* Feature 4 */}
            <MouseEffectCard
              title="8 Language Stacks"
              subtitle="React, Node.js, Python, Java, C++, Next.js, HTML/CSS/JS, and DSA."
              topText="Languages"
              topSubtext="Pre-configured"
              primaryCtaText="Explore"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Ready to code"
              className="border-green-900/30 hover:border-green-700/50"
            />

            {/* Feature 5 */}
            <MouseEffectCard
              title="Instant Execution"
              subtitle="Run code directly from your IDE with pre-configured environments."
              topText="Execute"
              topSubtext="One-click run"
              primaryCtaText="Run Code"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Fast compilation"
              className="border-green-900/30 hover:border-green-700/50"
            />

            {/* Feature 6 */}
            <MouseEffectCard
              title="One-Click Setup"
              subtitle="Create a room and invite teammates. No installation or configuration needed."
              topText="Setup"
              topSubtext="Instant"
              primaryCtaText="Create Room"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Zero config"
              className="border-green-900/30 hover:border-green-700/50"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-green-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Code <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Together?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join teams worldwide using CollabCode for seamless remote collaboration.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold group">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="border-green-900/40 text-white hover:bg-green-900/10 hover:border-green-700">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-green-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded flex items-center justify-center">
                <Code2 className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold">CollabCode</span>
            </div>
            <p className="text-gray-500 text-sm">© 2026 CollabCode. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
