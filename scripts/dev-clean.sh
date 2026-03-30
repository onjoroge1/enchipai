#!/bin/bash
# Clean script to kill all Next.js processes and remove lock files

echo "🧹 Cleaning up Next.js processes and lock files..."

# Kill processes on ports 3000 and 3001
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true

# Kill any next dev processes
pkill -f "next dev" 2>/dev/null || true

# Remove lock files
rm -rf .next/dev/lock 2>/dev/null || true

echo "✅ Cleanup complete!"
echo "🚀 Starting dev server..."

# Start the dev server
npm run dev

