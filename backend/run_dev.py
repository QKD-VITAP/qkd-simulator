#!/usr/bin/env python3
"""
Development server startup script for QKD Simulator Backend
"""

import uvicorn
import sys
import os

def main():
    """Start the development server"""
    print("🚀 Starting QKD Simulator Backend Development Server")
    print("=" * 50)
    print("📍 Server will be available at:")
    print("   • API: http://localhost:8000")
    print("   • Docs: http://localhost:8000/docs")
    print("   • WebSocket: ws://localhost:8000/ws")
    print("=" * 50)
    print("Press CTRL+C to stop the server")
    print()
    
    try:
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=["app"],
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
