# Docker build and push script for CollabCode images
# Usage: ./docker/build-and-push.sh <docker-username>

#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./docker/build-and-push.sh <docker-username>"
    echo "Example: ./docker/build-and-push.sh myusername"
    exit 1
fi

DOCKER_USERNAME=$1
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "Building and pushing CollabCode Docker images..."
echo "Docker Username: $DOCKER_USERNAME"
echo ""

# Array of images to build with version tags
# Format: name:version:Dockerfile
declare -a IMAGES=(
    "openvscode-node:20:Dockerfile.nodejs"
    "openvscode-python:3.12:Dockerfile.python"
    "openvscode-nextjs:20:Dockerfile.nextjs"
    "openvscode-java:21:Dockerfile.java"
    "openvscode-cpp:bookworm:Dockerfile.cpp"
)

# Build and push each image
for image in "${IMAGES[@]}"; do
    IFS=':' read -r tag version dockerfile <<< "$image"
    
    IMAGE_TAG="$DOCKER_USERNAME/collabcode-$tag:$version"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Building: $IMAGE_TAG"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    docker build -f "$DOCKER_DIR/$dockerfile" -t "$IMAGE_TAG" "$DOCKER_DIR" \
        && echo "✓ Built successfully: $IMAGE_TAG" \
        || { echo "✗ Build failed for $IMAGE_TAG"; exit 1; }
    
    echo ""
    echo "Pushing: $IMAGE_TAG"
    docker push "$IMAGE_TAG" \
        && echo "✓ Pushed successfully: $IMAGE_TAG" \
        || { echo "✗ Push failed for $IMAGE_TAG"; exit 1; }
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All images built and pushed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Images available at:"
for image in "${IMAGES[@]}"; do
    IFS=':' read -r tag version dockerfile <<< "$image"
    echo "  • $DOCKER_USERNAME/collabcode-$tag:$version"
done
