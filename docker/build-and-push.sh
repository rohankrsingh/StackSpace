#!/bin/bash

# ==============================
# CONFIGURATION
# ==============================

AWS_REGION="ap-south-1"
AWS_ACCOUNT_ID="245713705362"
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
ECR_REPOSITORY="stackspace"

# Docker Hub username required
if [ -z "$1" ]; then
    echo "Usage: ./docker/build-and-push.sh <dockerhub-username>"
    exit 1
fi

DOCKER_USERNAME=$1

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "============================================"
echo "Logging in to Docker Hub..."
echo "============================================"
docker login || { echo "❌ Docker Hub login failed"; exit 1; }

echo ""
echo "============================================"
echo "Logging in to AWS ECR..."
echo "============================================"
aws ecr get-login-password --region $AWS_REGION | \
docker login --username AWS --password-stdin $ECR_REGISTRY \
    || { echo "❌ ECR login failed"; exit 1; }

echo "✅ Logged in to both registries"
echo ""

# Format: name:version:Dockerfile
declare -a IMAGES=(
    "openvscode-node:20:Dockerfile.nodejs"
    "openvscode-python:3.12:Dockerfile.python"
    "openvscode-nextjs:20:Dockerfile.nextjs"
    "openvscode-java:21:Dockerfile.java"
    "openvscode-cpp:bookworm:Dockerfile.cpp"
)

for image in "${IMAGES[@]}"; do
    IFS=':' read -r tag version dockerfile <<< "$image"

    LOCAL_TAG="stackspace-$tag:$version"
    DOCKERHUB_TAG="$DOCKER_USERNAME/stackspace-$tag:$version"
    ECR_TAG="$ECR_REGISTRY/$ECR_REPOSITORY:$tag-$version"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Building: $LOCAL_TAG"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    docker build -f "$DOCKER_DIR/$dockerfile" -t "$LOCAL_TAG" "$DOCKER_DIR" \
        || { echo "❌ Build failed for $LOCAL_TAG"; exit 1; }

    echo ""
    echo "Tagging for Docker Hub..."
    docker tag "$LOCAL_TAG" "$DOCKERHUB_TAG" \
        || { echo "❌ Docker Hub tag failed"; exit 1; }

    echo "Tagging for AWS ECR..."
    docker tag "$LOCAL_TAG" "$ECR_TAG" \
        || { echo "❌ ECR tag failed"; exit 1; }

    echo ""
    echo "Pushing to Docker Hub: $DOCKERHUB_TAG"
    docker push "$DOCKERHUB_TAG" \
        || { echo "❌ Docker Hub push failed"; exit 1; }

    echo "Pushing to AWS ECR: $ECR_TAG"
    docker push "$ECR_TAG" \
        || { echo "❌ ECR push failed"; exit 1; }

    echo "✅ Successfully pushed to both registries"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All images pushed to Docker Hub & AWS ECR!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"