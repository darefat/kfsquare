#!/usr/bin/env python3
"""
KFSQUARE Python Setup and Deployment Utility
Cross-platform helper script for development and deployment tasks
"""

import os
import sys
import subprocess
import platform
import json
import urllib.request
import urllib.error
from pathlib import Path
import argparse
import time

try:
    from colorama import init, Fore, Back, Style
    init()  # Initialize colorama for cross-platform colors
    COLORS = True
except ImportError:
    # Fallback if colorama is not installed
    class Fore:
        RED = GREEN = YELLOW = BLUE = MAGENTA = CYAN = WHITE = RESET = ""
    class Style:
        DIM = NORMAL = BRIGHT = RESET_ALL = ""
    COLORS = False

def print_colored(text, color=Fore.WHITE, style=Style.NORMAL):
    """Print colored text if colorama is available"""
    if COLORS:
        print(f"{style}{color}{text}{Style.RESET_ALL}")
    else:
        print(text)

def print_header(text):
    """Print a formatted header"""
    print_colored(f"\n🚀 {text}", Fore.CYAN, Style.BRIGHT)
    print_colored("=" * (len(text) + 3), Fore.CYAN)

def print_success(text):
    """Print success message"""
    print_colored(f"✅ {text}", Fore.GREEN)

def print_error(text):
    """Print error message"""
    print_colored(f"❌ {text}", Fore.RED)

def print_warning(text):
    """Print warning message"""
    print_colored(f"⚠️  {text}", Fore.YELLOW)

def print_info(text):
    """Print info message"""
    print_colored(f"ℹ️  {text}", Fore.BLUE)

def detect_platform():
    """Detect the current platform"""
    system = platform.system().lower()
    if system == "windows":
        return "Windows"
    elif system == "darwin":
        return "macOS"
    elif system == "linux":
        return "Linux"
    else:
        return "Unknown"

def run_command(command, shell=False, capture_output=True):
    """Run a command and return the result"""
    try:
        if isinstance(command, str) and not shell:
            command = command.split()
        
        result = subprocess.run(
            command, 
            shell=shell, 
            capture_output=capture_output, 
            text=True,
            timeout=30
        )
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_node_js():
    """Check if Node.js is installed"""
    success, stdout, _ = run_command("node --version")
    if success:
        version = stdout.replace("v", "")
        print_success(f"Node.js {version} is installed")
        return True, version
    else:
        print_error("Node.js is not installed")
        return False, None

def check_npm():
    """Check if npm is installed"""
    success, stdout, _ = run_command("npm --version")
    if success:
        print_success(f"npm {stdout} is available")
        return True, stdout
    else:
        print_error("npm is not available")
        return False, None

def check_python():
    """Check Python installation"""
    version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print_success(f"Python {version} is running this script")
    return True, version

def install_python_requirements():
    """Install Python requirements"""
    print_info("Installing Python requirements...")
    
    requirements_files = ["requirements-minimal.txt", "requirements.txt"]
    installed = False
    
    for req_file in requirements_files:
        if Path(req_file).exists():
            print_info(f"Found {req_file}")
            success, stdout, stderr = run_command(f"pip install -r {req_file}")
            if success:
                print_success(f"Python packages installed from {req_file}")
                installed = True
                break
            else:
                print_warning(f"Failed to install from {req_file}: {stderr}")
    
    if not installed:
        print_warning("No requirements.txt file found, skipping Python package installation")
    
    return installed

def install_node_dependencies():
    """Install Node.js dependencies"""
    if Path("package.json").exists():
        print_info("Installing Node.js dependencies...")
        success, stdout, stderr = run_command("npm install")
        if success:
            print_success("Node.js dependencies installed successfully")
            return True
        else:
            print_error(f"Failed to install Node.js dependencies: {stderr}")
            return False
    else:
        print_warning("package.json not found")
        return False

def create_env_file():
    """Create .env file from template"""
    if not Path(".env").exists():
        if Path(".env.example").exists():
            print_info("Creating .env file from template...")
            try:
                with open(".env.example", "r") as src, open(".env", "w") as dst:
                    dst.write(src.read())
                print_success(".env file created successfully")
                print_warning("Please edit .env file with your actual configuration")
                return True
            except Exception as e:
                print_error(f"Failed to create .env file: {e}")
                return False
        else:
            print_warning(".env.example template not found")
            return False
    else:
        print_success(".env file already exists")
        return True

def health_check(port=3000):
    """Check if the server is running"""
    try:
        url = f"http://localhost:{port}/health"
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode())
            if data.get("status") == "healthy":
                print_success(f"Server is healthy at port {port}")
                return True
            else:
                print_warning(f"Server responded but not healthy: {data}")
                return False
    except urllib.error.URLError:
        print_error(f"Server is not responding at port {port}")
        return False
    except Exception as e:
        print_error(f"Health check failed: {e}")
        return False

def start_development_server():
    """Start the development server"""
    print_info("Starting development server...")
    try:
        # Try npm run dev first
        if Path("package.json").exists():
            print_info("Starting Node.js development server...")
            subprocess.run(["npm", "run", "dev"], check=False)
        else:
            # Fallback to Python server
            print_info("Starting Python HTTP server...")
            port = 8080
            print_info(f"Server will be available at http://localhost:{port}")
            subprocess.run([sys.executable, "-m", "http.server", str(port)], check=False)
    except KeyboardInterrupt:
        print_info("Server stopped by user")
    except Exception as e:
        print_error(f"Failed to start server: {e}")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="KFSQUARE Setup and Deployment Utility")
    parser.add_argument("--setup", action="store_true", help="Run full setup")
    parser.add_argument("--install-python", action="store_true", help="Install Python requirements")
    parser.add_argument("--install-node", action="store_true", help="Install Node.js dependencies")
    parser.add_argument("--create-env", action="store_true", help="Create .env file")
    parser.add_argument("--health", action="store_true", help="Check server health")
    parser.add_argument("--start", action="store_true", help="Start development server")
    parser.add_argument("--port", type=int, default=3000, help="Port for health check")
    
    args = parser.parse_args()
    
    # If no specific command, show help
    if not any(vars(args).values()):
        args.setup = True
    
    print_header("KFSQUARE Cross-Platform Setup Utility")
    
    # Detect platform
    current_platform = detect_platform()
    print_info(f"Platform: {current_platform}")
    
    # Check prerequisites
    print_header("Checking Prerequisites")
    python_ok, python_version = check_python()
    node_ok, node_version = check_node_js()
    npm_ok, npm_version = check_npm()
    
    if args.setup or args.install_python:
        print_header("Python Setup")
        install_python_requirements()
    
    if args.setup or args.install_node:
        if node_ok and npm_ok:
            print_header("Node.js Setup")
            install_node_dependencies()
        else:
            print_warning("Node.js/npm not available, skipping Node.js dependencies")
    
    if args.setup or args.create_env:
        print_header("Environment Configuration")
        create_env_file()
    
    if args.health:
        print_header("Health Check")
        health_check(args.port)
    
    if args.start:
        print_header("Starting Development Server")
        start_development_server()
    
    if args.setup:
        print_header("Setup Complete")
        print_success("KFSQUARE setup completed successfully!")
        print_info("Next steps:")
        print_info("1. Edit .env file with your configuration")
        print_info("2. Run: python setup.py --start")
        print_info("3. Open: http://localhost:3000 (Node.js) or http://localhost:8080 (Python)")

if __name__ == "__main__":
    main()
