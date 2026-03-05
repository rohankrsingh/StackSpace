# StackSpace Docker Images

Production-ready Docker images with OpenVSCode Server for different programming stacks.

Built on researched stable versions:
- **Node.js 20 LTS** (Bookworm - recommended by Snyk)
- **Python 3.12** (Latest stable modern Python)
- **Eclipse Temurin Java 21** (Recommended, openjdk deprecated)
- **GCC C++ on Debian Bookworm** (Stable)

## Available Images

| Image | Runtime | Version | Size | Stacks |
|-------|---------|---------|------|--------|
| `stackspace-openvscode-node` | Node.js LTS | 20 | ~700MB | Node.js, React+Vite, HTML/CSS/JS |
| `stackspace-openvscode-python` | Python | 3.12 | ~600MB | Python, DSA Practice |
| `stackspace-openvscode-nextjs` | Node.js + Next | 20 | ~750MB | Next.js |
| `stackspace-openvscode-java` | Eclipse Temurin | 21 | ~800MB | Java |
| `stackspace-openvscode-cpp` | GCC | bookworm | ~650MB | C++ |

## Building Images

### Build All Images Locally

```bash
cd docker

# Build individual image
docker build -f Dockerfile.nodejs -t stackspace-openvscode-node:20 ..
docker build -f Dockerfile.python -t stackspace-openvscode-python:3.12 ..
docker build -f Dockerfile.nextjs -t stackspace-openvscode-nextjs:20 ..
docker build -f Dockerfile.java -t stackspace-openvscode-java:21 ..
docker build -f Dockerfile.cpp -t stackspace-openvscode-cpp:bookworm ..
```

### Build and Push to Docker Hub

```bash
# Make script executable
chmod +x build-and-push.sh

# Build and push (requires Docker Hub login)
./build-and-push.sh yourusername
```

This will build and push:
- `yourusername/stackspace-openvscode-node:20`
- `yourusername/stackspace-openvscode-python:3.12`
- `yourusername/stackspace-openvscode-nextjs:20`
- `yourusername/stackspace-openvscode-java:21`
- `yourusername/stackspace-openvscode-cpp:bookworm`

## What's Included

Each image includes:
- OpenVSCode Server (VS Code in browser)
- Language runtime/compiler
- Git, curl, wget for development
- Build tools

### Per-Image Details

**openvscode-node:20** (Node.js 20 LTS)
- npm, yarn (latest)
- Build tools, Python 3
- Recommended stable per Snyk research

**openvscode-python:3.12** (Python 3.12 Latest Stable)
- pip, setuptools, wheel
- pip-tools, ipython, jupyter
- Latest stable modern Python

**openvscode-nextjs:20** (Node.js 20 LTS + Next.js)
- Node.js 20, npm, yarn
- Next.js CLI (global), TypeScript

**openvscode-java:21** (Eclipse Temurin Java 21 LTS)
- Java 21 LTS (Eclipse Temurin - openjdk deprecated)
- Maven (latest)
- Build tools

**openvscode-cpp:bookworm** (Debian Bookworm GCC)
- GCC/G++ (latest stable)
- CMake, Make, gdb, valgrind
- Debian Bookworm stable packages

## Usage in StackSpace

Update `docker.ts` to map stacks to images:

```typescript
const STACK_IMAGES: Record<string, string> = {
  "nodejs-basic": "yourusername/stackspace-nodejs:latest",
  "python-basic": "yourusername/stackspace-python:latest",
  "react-vite": "yourusername/stackspace-nodejs:latest",
  "next-js": "yourusername/stackspace-nextjs:latest",
  "java-basic": "yourusername/stackspace-java:latest",
  "cpp-basic": "yourusername/stackspace-cpp:latest",
  "html-css-js": "yourusername/stackspace-nodejs:latest",
  "dsa-practice": "yourusername/stackspace-python:latest",
};
```

## Development Workflow

1. **Locally test** a Dockerfile:
   ```bash
   docker build -f docker/Dockerfile.nodejs -t test-nodejs:latest .
   docker run -it -p 3000:3000 -v $(pwd)/workspace:/home/workspace test-nodejs
   ```

2. **Verify it works** at http://localhost:3000

3. **Push to Docker Hub** (see build-and-push.sh above)

## Notes

- OpenVSCode Server v1.84.2 - update version in Dockerfiles as needed
- All images expose port 3000
- Workspace mounted at `/home/workspace`
- First container startup takes ~1-2 minutes (image download + VS Code init)
- Subsequent startups are ~10-30 seconds

## Updating Images

To update an image:
1. Modify the Dockerfile
2. Rebuild: `docker build -f docker/Dockerfile.xxx -t yourusername/stackspace-xxx:latest .`
3. Push: `docker push yourusername/stackspace-xxx:latest`

Or use the script:
```bash
./docker/build-and-push.sh yourusername
```
