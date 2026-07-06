"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Users,
  MessageSquare,
  Play,
  ArrowRight,
  Sparkles,
  Layers,
  Code,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import MouseEffectCard from "@/components/kokonutui/mouse-effect-card";
import { Safari } from "@/components/ui/safari";
import { Meteors } from "@/components/ui/meteors";
import { Accordion, AccordionItem } from "@heroui/react";
import { motion } from "motion/react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // States for interactive components
  const [showBanner, setShowBanner] = useState(true);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<string | null>("src/services/docker.ts");
  const [terminalStep, setTerminalStep] = useState(0);

  // Terminal simulated typing loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => {
        if (prev >= 4) return 0;
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Features description for the target radar section
  const targetFeatures = [
    {
      title: "30s Spin Up Time",
      desc: "Instant isolated Docker container provisioned for your room on-demand.",
      tag: "Environment"
    },
    {
      title: "Up to 4+ Collaborators",
      desc: "Real-time presence tracking, cursor sync, and active session management.",
      tag: "Presence"
    },
    {
      title: "Isolated Container Sandbox",
      desc: "Safe code execution in insulated cloud instances running Python, Node, Java, etc.",
      tag: "Security"
    },
    {
      title: "Chat & Docs Collaboration",
      desc: "Shared room chat paired with syncable markdown documents to avoid context switches.",
      tag: "Teamwork"
    }
  ];

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 110,
        damping: 16
      }
    }
  } as const;

  const previewVariants = {
    hidden: { opacity: 0, scale: 0.97, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 16,
        delay: 0.2
      }
    }
  } as const;

  return (
    <div className="w-full min-h-screen bg-black text-white overflow-x-hidden relative font-sans">
      {/* Background shooting stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Meteors number={25} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:scale-102 transition-transform duration-200">
            <Image src="/icon.svg" alt="StackSpace" width={32} height={32} />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">StackSpace</span>
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-green-950/20">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-green-950/20 border border-green-900/30 rounded-full">
                <Sparkles className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">Live Collaborative Sandbox</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.08] tracking-tighter text-pretty">
                Code <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 bg-clip-text text-transparent">Smarter.</span> <span className="text-white">Together.</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg md:text-xl text-zinc-400 mb-8 max-w-xl leading-relaxed">
                A browser-based IDE with 8 programming stacks. Spin up containerized rooms in 30 seconds, invite teammates, and run code instantly.
              </motion.p>

              <motion.div variants={itemVariants} className="flex gap-4 flex-wrap mb-12">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold group shadow-lg shadow-green-950/20">
                    Start Coding Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="lg" variant="outline" className="border-green-900/40 text-green-400 hover:bg-green-950/10 hover:border-green-700">
                    View Demo
                  </Button>
                </Link>
              </motion.div>

              {/* Supported Stacks Badges */}
              <motion.div variants={itemVariants} className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">Supported Stacks</p>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "Python", "Java", "C++", "Next.js", "HTML/CSS/JS", "DSA"].map((stack) => (
                    <motion.span
                      key={stack}
                      whileHover={{ scale: 1.05, translateY: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="px-3 py-1.5 text-xs font-mono bg-zinc-900/80 border border-zinc-800/60 rounded-full text-zinc-400 backdrop-blur-sm hover:border-green-500/30 hover:text-green-400 transition-colors duration-200 cursor-default"
                    >
                      {stack}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Feature Preview - Right Column */}
            <motion.div
              variants={previewVariants}
              initial="hidden"
              animate="visible"
              className="relative lg:pl-4"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-emerald-500/10 rounded-3xl blur-2xl pointer-events-none" />
              <Safari
                url="stackspace.dev/room/collab-demo"
                videoSrc="/demo.mp4"
                className="relative border border-green-900/30 shadow-2xl shadow-green-950/20 rounded-2xl overflow-hidden bg-black"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-zinc-900 relative z-10 bg-zinc-950/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { val: "8+", label: "Programming Stacks" },
              { val: "30s", label: "IDE Spin Up Time" },
              { val: "4+", label: "Team Size Limit" },
              { val: "100%", label: "Browser-Based" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-green-400 mb-2 tracking-tight">{stat.val}</div>
                <p className="text-gray-400 text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Target Radar / Collaboration Highlights */}
      <section className="py-24 px-6 relative z-10 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Security & Speed</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight text-pretty">Built for instant collaboration.<br />Controlled by you.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* SVG Target radar sweeps */}
            <div className="relative flex justify-center items-center h-[350px]">
              <div className="absolute inset-0 bg-green-500/5 rounded-full filter blur-3xl pointer-events-none" />
              <svg width="320" height="320" viewBox="0 0 320 320" className="relative z-10">
                {/* Concentric circles */}
                <circle cx="160" cy="160" r="140" stroke="#1f2937" strokeWidth="1" fill="none" />
                <circle cx="160" cy="160" r="100" stroke="#1f2937" strokeWidth="1" fill="none" />
                <circle cx="160" cy="160" r="60" stroke="#1f2937" strokeWidth="1" fill="none" />
                <circle cx="160" cy="160" r="20" stroke="#22c55e" strokeWidth="1" fill="none" className="animate-pulse" />
                {/* Radar lines */}
                <line x1="160" y1="20" x2="160" y2="300" stroke="#1f2937" strokeWidth="1" />
                <line x1="20" y1="160" x2="300" y2="160" stroke="#1f2937" strokeWidth="1" />
                {/* Dynamic cross lines highlighting active feature */}
                {activeFeature === 0 && (
                  <circle cx="160" cy="60" r="6" fill="#22c55e" className="animate-ping" />
                )}
                {activeFeature === 1 && (
                  <circle cx="260" cy="160" r="6" fill="#22c55e" className="animate-ping" />
                )}
                {activeFeature === 2 && (
                  <circle cx="160" cy="260" r="6" fill="#22c55e" className="animate-ping" />
                )}
                {activeFeature === 3 && (
                  <circle cx="60" cy="160" r="6" fill="#22c55e" className="animate-ping" />
                )}
                <circle cx="160" cy="60" r="4" fill={activeFeature === 0 ? "#22c55e" : "#374151"} className="transition-colors duration-300" />
                <circle cx="260" cy="160" r="4" fill={activeFeature === 1 ? "#22c55e" : "#374151"} className="transition-colors duration-300" />
                <circle cx="160" cy="260" r="4" fill={activeFeature === 2 ? "#22c55e" : "#374151"} className="transition-colors duration-300" />
                <circle cx="60" cy="160" r="4" fill={activeFeature === 3 ? "#22c55e" : "#374151"} className="transition-colors duration-300" />
                
                {/* Radar sweep hand */}
                <line x1="160" y1="160" x2="260" y2="60" stroke="#22c55e" strokeWidth="1.5" strokeOpacity="0.4" className="origin-[160px_160px] animate-[spin_10s_linear_infinite]" />
              </svg>
            </div>

            {/* Feature details list */}
            <div className="space-y-4">
              {targetFeatures.map((feat, index) => (
                <motion.div
                  key={index}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeFeature === index
                      ? "bg-zinc-900/60 border-green-500/30"
                      : "bg-zinc-950/20 border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold text-lg ${activeFeature === index ? "text-green-400" : "text-white"}`}>{feat.title}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-400">{feat.tag}</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Pipeline Architecture */}
      <section className="py-24 px-6 relative z-10 border-b border-zinc-900 bg-zinc-950/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Engineering Pipeline</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">Everything instant. In your browser.</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm">Hover over pipeline stages to see how StackSpace streams collaborative container environments directly to client browsers.</p>
          </motion.div>

          {/* Diagram Flow nodes */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-zinc-800 -translate-y-1/2 hidden md:block z-0" />
            
            {/* Stage 1 */}
            <motion.div
              onMouseEnter={() => setActiveFlow("client")}
              onMouseLeave={() => setActiveFlow(null)}
              whileHover={{ scale: 1.02, translateY: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative z-10 p-6 rounded-2xl border bg-black text-center transition-all duration-300 cursor-default ${
                activeFlow === "client" ? "border-green-500/40 shadow-lg shadow-green-950/20" : "border-zinc-800"
              }`}
            >
              <div className="w-12 h-12 bg-green-950/30 border border-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Teammates Connect</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Up to 4+ developers connect to a room link via Socket.IO client stream.</p>
            </motion.div>

            {/* Stage 2 */}
            <motion.div
              onMouseEnter={() => setActiveFlow("server")}
              onMouseLeave={() => setActiveFlow(null)}
              whileHover={{ scale: 1.02, translateY: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative z-10 p-6 rounded-2xl border bg-black text-center transition-all duration-300 cursor-default ${
                activeFlow === "server" ? "border-green-500/40 shadow-lg shadow-green-950/20" : "border-zinc-800"
              }`}
            >
              <div className="w-12 h-12 bg-green-950/30 border border-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. Docker Sandbox Provision</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Appwrite backend orchestrates Docker container boot, ready to execute code in 30 seconds.</p>
            </motion.div>

            {/* Stage 3 */}
            <motion.div
              onMouseEnter={() => setActiveFlow("ide")}
              onMouseLeave={() => setActiveFlow(null)}
              whileHover={{ scale: 1.02, translateY: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative z-10 p-6 rounded-2xl border bg-black text-center transition-all duration-300 cursor-default ${
                activeFlow === "ide" ? "border-green-500/40 shadow-lg shadow-green-950/20" : "border-zinc-800"
              }`}
            >
              <div className="w-12 h-12 bg-green-950/30 border border-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Collaborative IDE Live</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">VS Code workspace editor activates with shared terminal, cursor tracking, and sync chat.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mock Workspace file explorer */}
      <section className="py-24 px-6 relative z-10 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Visual File Explorer mockup */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden font-mono text-xs shadow-2xl"
            >
              <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500/80 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-yellow-500/80 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-green-500/80 rounded-full" />
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Workspace Explorer</span>
              </div>
              <div className="p-4 grid grid-cols-3 divide-x divide-zinc-900">
                {/* File list */}
                <div className="col-span-1 pr-4 space-y-2">
                  <p className="text-zinc-500 font-bold uppercase text-[9px] mb-2">Files</p>
                  <div
                    onClick={() => setActiveFile("src/services/docker.ts")}
                    className={`p-1.5 rounded cursor-pointer transition-colors ${
                      activeFile === "src/services/docker.ts" ? "bg-green-950/30 text-green-400 border border-green-500/20" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    📄 docker.ts
                  </div>
                  <div
                    onClick={() => setActiveFile("src/services/socket.ts")}
                    className={`p-1.5 rounded cursor-pointer transition-colors ${
                      activeFile === "src/services/socket.ts" ? "bg-green-950/30 text-green-400 border border-green-500/20" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    📄 socket.ts
                  </div>
                  <div
                    onClick={() => setActiveFile("src/app/page.tsx")}
                    className={`p-1.5 rounded cursor-pointer transition-colors ${
                      activeFile === "src/app/page.tsx" ? "bg-green-950/30 text-green-400 border border-green-500/20" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    📄 page.tsx
                  </div>
                </div>

                {/* Editor Content mockup */}
                <div className="col-span-2 pl-4 text-zinc-400 leading-relaxed font-mono">
                  {activeFile === "src/services/docker.ts" && (
                    <div className="space-y-1">
                      <p><span className="text-green-500 font-semibold">export class</span> DockerService &#123;</p>
                      <p className="pl-4"><span className="text-green-500 font-semibold">async</span> startContainer(roomId) &#123;</p>
                      <p className="pl-8 text-zinc-500">// Spin up container in 30s</p>
                      <p className="pl-8"><span className="text-green-500">await</span> this.orchestrate(roomId);</p>
                      <p className="pl-4">&#125;</p>
                      <p>&#125;</p>
                    </div>
                  )}
                  {activeFile === "src/services/socket.ts" && (
                    <div className="space-y-1">
                      <p><span className="text-green-500 font-semibold">import</span> io <span className="text-green-500 font-semibold">from</span> "socket.io-client";</p>
                      <p><span className="text-green-500 font-semibold">export const</span> initSync = (room) =&gt; &#123;</p>
                      <p className="pl-4">const socket = io(conf.socketUrl);</p>
                      <p className="pl-4 text-zinc-500">// Syncing 4+ collaborators cursors</p>
                      <p className="pl-4">socket.emit("join", room);</p>
                      <p>&#125;;</p>
                    </div>
                  )}
                  {activeFile === "src/app/page.tsx" && (
                    <div className="space-y-1">
                      <p><span className="text-green-500 font-semibold">export default function</span> Home() &#123;</p>
                      <p className="pl-4">return &lt;div className="relative"&gt;</p>
                      <p className="pl-8 text-zinc-500">&lt;!-- 8 Stacks support --&gt;</p>
                      <p className="pl-8">&lt;Meteors number=&#123;25&#125; /&gt;</p>
                      <p className="pl-4">&lt;/div&gt;;</p>
                      <p>&#125;</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Copy descriptions */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Zero Configuration</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 tracking-tight text-pretty">Work anywhere.<br />Sync everywhere.</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-white mb-2">Zero Local Installation</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">Code from an iPad, a school computer, or your main work machine. 100% of execution runs in secure cloud containers.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-2">Active Room Session State</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">Containers and files are stored in AWS/Appwrite databases, so returning to your room link restores your workspace exactly where you left off.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-configured Stacks Section */}
      <section className="py-24 px-6 relative z-10 border-b border-zinc-900 bg-zinc-950/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Code Execution</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-6 tracking-tight">Power beats config.</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-white mb-2">8 Pre-configured Stacks</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">Spin up sandboxes with React, Node, Python, Java, C++, Next.js, HTML/CSS, and Data Structures configurations preloaded.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white mb-2">Real-Time Interactive Terminals</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">Terminal commands run securely in Docker, returning standard output streams synchronously in your browser window.</p>
                </div>
              </div>
            </div>

            {/* Terminal Preview */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-black border border-zinc-800 rounded-xl p-5 font-mono text-xs text-zinc-300 leading-relaxed shadow-xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-zinc-900 mb-3 text-zinc-500 text-[10px]">
                <span>TERMINAL - PYTHON STACK</span>
                <span>bash</span>
              </div>
              <p className="text-zinc-500">$ python -m http.server 8000</p>
              <p className="text-green-400">Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...</p>
              <p className="text-zinc-500">$ curl localhost:8000/api/status</p>
              <p className="text-emerald-400">HTTP/1.0 200 OK</p>
              <p className="text-emerald-400">Content-Type: application/json</p>
              <p className="text-emerald-400">{"{"} "status": "running", "roomId": "collab-sandbox" {"}"}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 relative z-10 border-b border-zinc-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Tool Suite</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">Everything You Need to Code Together</h2>
            <p className="text-center text-gray-400 text-sm mt-4 max-w-xl mx-auto">Comprehensive collaboration tools built for remote developer rooms.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MouseEffectCard
              title="Full IDE Experience"
              subtitle="VS Code running in your browser. All extensions and features you need."
              topText="IDE"
              topSubtext="Browser-based"
              primaryCtaText="Try Now"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Powered by VS Code"
              className="border-green-900/30 hover:border-green-700/50 bg-zinc-950"
            />
            <MouseEffectCard
              title="Live Collaboration"
              subtitle="See teammates' cursors, presence status, and collaborate in real-time."
              topText="Real-time"
              topSubtext="Zero latency"
              primaryCtaText="Start Collab"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Multi-user editing"
              className="border-green-900/30 hover:border-green-700/50 bg-zinc-950"
            />
            <MouseEffectCard
              title="Team Chat & Docs"
              subtitle="Integrated messaging that supports sharing documents and real-time syncing."
              topText="Chat & Docs"
              topSubtext="Fully Integrated"
              primaryCtaText="Join Chat"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Supports documents too"
              className="border-green-900/30 hover:border-green-700/50 bg-zinc-950"
            />
            <MouseEffectCard
              title="8 Language Stacks"
              subtitle="React, Node.js, Python, Java, C++, Next.js, HTML/CSS/JS, and DSA."
              topText="Languages"
              topSubtext="Pre-configured"
              primaryCtaText="Explore"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Ready to code"
              className="border-green-900/30 hover:border-green-700/50 bg-zinc-950"
            />
            <MouseEffectCard
              title="Instant Execution"
              subtitle="Run code directly from your IDE with pre-configured environments."
              topText="Execute"
              topSubtext="One-click run"
              primaryCtaText="Run Code"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="Fast compilation"
              className="border-green-900/30 hover:border-green-700/50 bg-zinc-950"
            />
            <MouseEffectCard
              title="30s IDE Spin Up"
              subtitle="Spin up a complete collaborative environment in 30 seconds. Invite teammates and code together instantly."
              topText="Setup"
              topSubtext="Fast Spin Up"
              primaryCtaText="Create Room"
              primaryCtaUrl="/auth/signup"
              secondaryCtaText=""
              footerText="30 seconds setup"
              className="border-green-900/30 hover:border-green-700/50 bg-zinc-950"
            />
          </div>
        </div>
      </section>

      {/* Simulated Terminal Creation mockup */}
      <section className="py-24 px-6 relative z-10 border-b border-zinc-900 bg-zinc-950/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">Terminal API</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">Built for control freaks</h2>
          </div>

          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-zinc-950 border border-green-900/20 rounded-2xl overflow-hidden p-6 font-mono text-xs text-zinc-300 leading-relaxed shadow-2xl relative"
          >
            <div className="absolute top-4 right-4 flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Live Sim</span>
            </div>
            
            <p className="text-zinc-500 mb-2"># Spin up a live workspace container from the command line</p>
            <p className="text-zinc-100 font-semibold flex items-center gap-1">
              <span className="text-green-500">$</span> stackspace room create --stack react
            </p>
            
            {terminalStep >= 1 && (
              <p className="text-green-400 mt-2">✔ Validating developer credentials... (Appwrite)</p>
            )}
            {terminalStep >= 2 && (
              <p className="text-green-400">✔ Provisioning AWS ECS container sandbox (30s)...</p>
            )}
            {terminalStep >= 3 && (
              <p className="text-green-400">✔ Syncing room WebSockets... (Port 5000 ready)</p>
            )}
            {terminalStep >= 4 && (
              <p className="text-emerald-400 mt-3 font-semibold bg-green-950/20 p-2 border border-green-900/40 rounded">
                🚀 Room successfully running! Invite teammates: https://stackspace.dev/room/collab-demo
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-24 px-6 relative z-10 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-400">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">Frequently Asked Questions</h2>
          </div>

          <Accordion variant="splitted" className="w-full">
            <AccordionItem
              key="faq-1"
              aria-label="What is StackSpace?"
              title="What is StackSpace?"
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-white hover:border-green-500/20 transition-colors"
            >
              <p className="text-zinc-400 text-sm leading-relaxed pb-4">
                StackSpace is a real-time collaborative development platform that allows developers to spin up secure, pre-configured programming workspaces. Multiple developers can edit code simultaneously, compile instantly, and chat in real-time right inside their web browser.
              </p>
            </AccordionItem>
            <AccordionItem
              key="faq-2"
              aria-label="How fast does a room spin up?"
              title="How fast does a room spin up?"
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-white hover:border-green-500/20 transition-colors"
            >
              <p className="text-zinc-400 text-sm leading-relaxed pb-4">
                A room spins up in under 30 seconds. When you create a workspace, StackSpace communicates with Appwrite and provisions a secure Docker container hosting your selected tech stack, which is then made accessible through the browser IDE.
              </p>
            </AccordionItem>
            <AccordionItem
              key="faq-3"
              aria-label="How many developers can collaborate in one room?"
              title="How many developers can collaborate in one room?"
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-white hover:border-green-500/20 transition-colors"
            >
              <p className="text-zinc-400 text-sm leading-relaxed pb-4">
                Each room is designed to support 4+ active collaborators per session. Every member sees live cursor paths, presence updates, and synchronized workspace file edits.
              </p>
            </AccordionItem>
            <AccordionItem
              key="faq-4"
              aria-label="Which language stacks are supported?"
              title="Which language stacks are supported?"
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-white hover:border-green-500/20 transition-colors"
            >
              <p className="text-zinc-400 text-sm leading-relaxed pb-4">
                StackSpace supports 8 pre-configured developer environments: React, Node.js, Python, Java, C++, Next.js, HTML/CSS/JS, and DSA. Each stack has standard compilation tools and scripts ready to execute in one click.
              </p>
            </AccordionItem>
            <AccordionItem
              key="faq-5"
              aria-label="Is my code execution sandboxed?"
              title="Is my code execution sandboxed?"
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-white hover:border-green-500/20 transition-colors"
            >
              <p className="text-zinc-400 text-sm leading-relaxed pb-4">
                Yes, every room runs inside an insulated cloud sandbox container. When you trigger code compilation or execute shell commands, the process runs securely inside the isolated container and cannot access host structures or other rooms.
              </p>
            </AccordionItem>
            <AccordionItem
              key="faq-6"
              aria-label="Does the chat support documents?"
              title="Does the chat support documents?"
              className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl text-white hover:border-green-500/20 transition-colors"
            >
              <p className="text-zinc-400 text-sm leading-relaxed pb-4">
                Yes, the integrated room chat features document and notes sharing, letting you write markdown documents collaboratively while maintaining communication logs directly next to your workspace file explorer.
              </p>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Wireframe Funnel CTA */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Wireframe Funnel grid wrapper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden py-20 px-8 border border-green-900/30 bg-gradient-to-b from-green-950/15 to-zinc-950/60 text-center backdrop-blur-sm shadow-2xl"
          >
            {/* SVG Wireframe funnel layout */}
            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
                {/* Horizontal wireframe grid */}
                <line x1="0" y1="200" x2="800" y2="200" stroke="#22c55e" strokeWidth="0.5" />
                <line x1="0" y1="250" x2="800" y2="250" stroke="#22c55e" strokeWidth="0.5" />
                <line x1="0" y1="300" x2="800" y2="300" stroke="#22c55e" strokeWidth="0.5" />
                <line x1="0" y1="350" x2="800" y2="350" stroke="#22c55e" strokeWidth="0.5" />
                {/* Funnel curves */}
                <path d="M 0 350 Q 400 300 800 350" fill="none" stroke="#22c55e" strokeWidth="1" />
                <path d="M 100 350 Q 400 250 700 350" fill="none" stroke="#22c55e" strokeWidth="1" />
                <path d="M 200 350 Q 400 200 600 350" fill="none" stroke="#22c55e" strokeWidth="1" />
                <path d="M 300 350 Q 400 150 500 350" fill="none" stroke="#22c55e" strokeWidth="1" />
                {/* Funnel grid lines */}
                <line x1="400" y1="0" x2="400" y2="400" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10 tracking-tight">
              Break free from local config
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
              Create a sandbox room and invite teammates. Code, debug, and ship together instantly.
            </p>
            <div className="relative z-10">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold px-8 shadow-lg shadow-green-950/20">
                  Create Room Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-900 z-10 relative bg-black/60 backdrop-blur">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image src="/icon.svg" alt="StackSpace" width={32} height={32} />
              <span className="text-lg font-bold">StackSpace</span>
            </div>
            <p className="text-zinc-600 text-sm">© 2026 StackSpace. Built to showcase developer skills. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.8 }}
          className="fixed bottom-6 right-6 z-50 max-w-md p-5 rounded-2xl border border-green-500/20 bg-zinc-950/90 backdrop-blur-md shadow-2xl flex flex-col gap-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-950/40 border border-green-500/20 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">AWS Cloud Environment Offline</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The AWS Free Plan hosting the container infrastructure has expired. Live IDE rooms cannot be created on this demo deployment.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowBanner(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
            <a
              href="https://github.com/rohankrsingh/StackSpace#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-500 text-black hover:bg-green-400 rounded-lg transition-colors"
            >
              See README
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
