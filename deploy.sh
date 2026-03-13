#!/bin/bash

# Get the current date and time
CURRENT_DATE=$(date +'%Y-%m-%d %H:%M:%S')

# Check if a custom commit message was provided as the first argument
if [ -z "$1" ]
then
  COMMIT_MSG="portfolio update $CURRENT_DATE"
else
  COMMIT_MSG="$1"
fi

echo "Saving source code to GitHub..."
git add .
git commit -m "$COMMIT_MSG"
git push origin main

echo "Building and deploying the live site..."
ng deploy

echo "Deployment complete!"
