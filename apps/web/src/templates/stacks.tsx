import React from "react";
import {
  siPython,
  siNodedotjs,
  siReact,
  siVite,
  siNextdotjs,
  siOpenjdk,
  siCplusplus,
  siHtml5,
} from "simple-icons/icons";

export type StackTemplate = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  language: string;
  icon: React.ReactNode;
  files: Record<string, string>;
  run?: {
    entryFile: string;
    command?: string;
  };
};

const BrandIcon = ({ icon, className = "w-full h-full" }: { icon: any; className?: string }) => (
  <div className={className} style={{ color: `#${icon.hex}` }}>
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  </div>
);

export const STACKS: StackTemplate[] = [
  {
    id: "python-basic",
    name: "Python (Basic)",
    description: "Simple Python starter with main.py",
    tags: ["Beginner", "Python"],
    language: "python",
    icon: <BrandIcon icon={siPython} />,
    files: {
      "main.py": `# Python Basic Starter
print("Hello, World!")

def greet(name):
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Python"))
`,
      "README.md": `# Python Basic Project

This is a basic Python starter template.

## How to run

\`\`\`bash
python main.py
\`\`\`
`,
    },
    run: {
      entryFile: "main.py",
      command: "python main.py",
    },
  },
  {
    id: "node-basic",
    name: "Node.js (Basic)",
    description: "Simple Node.js starter with Express",
    tags: ["Beginner", "Node.js"],
    language: "javascript",
    icon: <BrandIcon icon={siNodedotjs} />,
    files: {
      "package.json": `{
  "name": "node-basic",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {}
}
`,
      "index.js": `// Node.js Basic Starter
console.log("Hello from Node.js!");

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Node.js"));
`,
      "README.md": `# Node.js Basic Project

Simple Node.js starter template.

## How to run

\`\`\`bash
npm start
\`\`\`
`,
    },
    run: {
      entryFile: "index.js",
      command: "node index.js",
    },
  },
  {
    id: "react-vite",
    name: "React + Vite",
    description: "Modern React with Vite bundler",
    tags: ["React", "Frontend", "Vite"],
    language: "javascript",
    icon: (
      <div className="flex gap-1 items-center justify-center w-full h-full">
        <div className="w-1/2 h-1/2">
          <BrandIcon icon={siVite} />
        </div>
        <div className="w-1/2 h-1/2">
          <BrandIcon icon={siReact} />
        </div>
      </div>
    ),
    files: {
      "package.json": `{
  "name": "react-vite",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0"
  }
}
`,
      "vite.config.js": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
})
`,
      "index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Vite</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      "src/main.jsx": `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
      "src/App.jsx": `export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to React + Vite!</h1>
      <p>Start building your React app here.</p>
    </div>
  )
}
`,
    },
    run: {
      entryFile: "index.html",
      command: "npm run dev",
    },
  },
  {
    id: "nextjs-starter",
    name: "Next.js (Full Stack)",
    description: "Next.js with TypeScript and API routes",
    tags: ["Next.js", "Full Stack", "React"],
    language: "typescript",
    icon: <BrandIcon icon={siNextdotjs} className="w-full h-full text-white dark:text-white" />,
    files: {
      "package.json": `{
  "name": "nextjs-starter",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
`,
      "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
`,
      "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
`,
      "app/page.tsx": `export default function Home() {
  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to Next.js!</h1>
      <p>Start building your full-stack app here.</p>
    </main>
  )
}
`,
      "app/layout.tsx": `export const metadata = {
  title: 'Next.js App',
  description: 'Built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
    },
    run: {
      entryFile: "app/page.tsx",
      command: "npm run dev",
    },
  },
  {
    id: "java-basic",
    name: "Java (Basic)",
    description: "Simple Java starter with Hello World",
    tags: ["Java", "Beginner"],
    language: "java",
    icon: <BrandIcon icon={siOpenjdk} />,
    files: {
      "Main.java": `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        String greeting = greet("Java");
        System.out.println(greeting);
    }
    
    static String greet(String name) {
        return "Hello, " + name + "!";
    }
}
`,
      "README.md": `# Java Basic Project

Simple Java starter template.

## How to compile and run

\`\`\`bash
javac Main.java
java Main
\`\`\`
`,
    },
    run: {
      entryFile: "Main.java",
      command: "javac Main.java && java Main",
    },
  },
  {
    id: "cpp-basic",
    name: "C++ (Basic)",
    description: "Simple C++ starter with cout",
    tags: ["C++", "Beginner"],
    language: "cpp",
    icon: <BrandIcon icon={siCplusplus} />,
    files: {
      "main.cpp": `#include <iostream>
#include <string>

using namespace std;

string greet(string name) {
    return "Hello, " + name + "!";
}

int main() {
    cout << "Hello, World!" << endl;
    cout << greet("C++") << endl;
    return 0;
}
`,
      "README.md": `# C++ Basic Project

Simple C++ starter template.

## How to compile and run

\`\`\`bash
g++ -o main main.cpp
./main
\`\`\`
`,
    },
    run: {
      entryFile: "main.cpp",
      command: "g++ -o main main.cpp && ./main",
    },
  },
  {
    id: "html-css-js",
    name: "HTML/CSS/JS",
    description: "Vanilla web starter",
    tags: ["Frontend", "Web", "Vanilla"],
    language: "javascript",
    icon: <BrandIcon icon={siHtml5} />,
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML/CSS/JS Starter</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Vanilla Web!</h1>
        <p id="greeting"></p>
        <button onclick="handleClick()">Click Me!</button>
    </div>
    <script src="script.js"></script>
</body>
</html>
`,
      "style.css": `.container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  text-align: center;
  background: #f5f5f5;
  border-radius: 8px;
}

h1 {
  color: #333;
}

button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #0056b3;
}
`,
      "script.js": `function greet(name) {
  return \`Hello, \${name}!\`;
}

document.getElementById('greeting').textContent = greet('HTML/CSS/JS');

function handleClick() {
  alert('Button clicked!');
}
`,
    },
    run: {
      entryFile: "index.html",
    },
  },
  {
    id: "dsa-practice",
    name: "DSA Practice",
    description: "Data Structure & Algorithm template with I/O",
    tags: ["DSA", "Algorithm", "Python"],
    language: "python",
    icon: <BrandIcon icon={siPython} />,
    files: {
      "solution.py": `# DSA Practice Template
# Solve coding problems here!

def solve():
    """
    Read input, solve problem, print output
    """
    # Read input
    n = int(input())
    arr = list(map(int, input().split()))
    
    # Solve (replace with your logic)
    result = sum(arr)
    
    # Print output
    print(result)

if __name__ == "__main__":
    solve()
`,
      "test_input.txt": `5
1 2 3 4 5
`,
      "README.md": `# DSA Practice

Template for solving Data Structure & Algorithm problems.

## How to run

\`\`\`bash
python solution.py < test_input.txt
\`\`\`

Or provide input interactively:

\`\`\`bash
python solution.py
\`\`\`
`,
    },
    run: {
      entryFile: "solution.py",
      command: "python solution.py",
    },
  },
];
