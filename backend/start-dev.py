#!/usr/bin/env python3
"""
Development server script to run both frontend and backend together.
This helps with routing issues during development.
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def run_backend():
    """Run the FastAPI backend server"""
    print("🚀 Starting backend server...")
    os.chdir("backend")
    subprocess.run([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"])

def run_frontend():
    """Run the Vite frontend development server"""
    print("🎨 Starting frontend server...")
    os.chdir("frontend")
    subprocess.run(["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"])

def main():
    """Start both servers"""
    print("🔧 Starting QKD Simulator Development Environment")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Error: Please run this script from the project root directory")
        print("   Expected structure:")
        print("   ├── backend/")
        print("   ├── frontend/")
        print("   └── start-dev.py")
        sys.exit(1)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(2)
    
    # Start frontend (this will block)
    try:
        run_frontend()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down development servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()
