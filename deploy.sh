#!/bin/bash

# Configuration
SPACE_URL="https://huggingface.co/spaces/aryancse1/SamvidhanAI"
REMOTE_NAME="space"

echo "🚀 Starting Deployment to Hugging Face Space: $SPACE_URL"

# 1. Initialize Git if needed (should be already done)
if [ ! -d ".git" ]; then
    echo "Initializing Git..."
    git init
fi

# 2. Add Remote
echo "Checking Git Remote..."
if git remote | grep -q "$REMOTE_NAME"; then
    echo "Remote '$REMOTE_NAME' already exists."
    git remote set-url $REMOTE_NAME $SPACE_URL
else
    echo "Adding remote '$REMOTE_NAME'..."
    git remote add $REMOTE_NAME $SPACE_URL
fi

# 3. Authentication & Push
echo ""
echo "🔐 AUTHENTICATION REQUIRED"
echo "I need your Hugging Face Access Token to push the code."
echo "Get it here: https://huggingface.co/settings/tokens (Make sure it has 'Write' permissions)"
echo ""
read -sp "Paste your User Access Token: " HF_TOKEN
echo ""

if [ -z "$HF_TOKEN" ]; then
    echo "❌ No token provided. Aborting."
    exit 1
fi

# Construct URL with token for authentication
# Format: https://USER:TOKEN@huggingface.co/...
AUTH_URL="https://aryancse1:$HF_TOKEN@huggingface.co/spaces/aryancse1/SamvidhanAI"

echo "📤 Pushing code to Hugging Face..."
git push --force "$AUTH_URL" main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "Go to https://huggingface.co/spaces/aryancse1/SamvidhanAI to see your app building."
else
    echo ""
    echo "❌ Deployment Failed. Please check your token and permissions."
fi
