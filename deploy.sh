#!/bin/bash

# BookSAN Deployment Script
# Handles PM2 process management with error recovery

set -e  # Exit on any error

echo "🚀 Starting BookSAN deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Function to safely stop PM2 processes
cleanup_pm2() {
    print_status "Cleaning up existing PM2 processes..."
    
    # List current processes
    pm2 list || true
    
    # Try to delete specific app first
    pm2 delete booksan-backend 2>/dev/null || print_warning "No booksan-backend process to delete"
    
    # Kill all PM2 processes if needed
    if pm2 list 2>/dev/null | grep -q "online\|errored\|stopped"; then
        print_warning "Found running processes, killing PM2 daemon..."
        pm2 kill || true
    fi
    
    # Clear logs
    pm2 flush 2>/dev/null || true
    
    print_success "PM2 cleanup completed"
}

# Function to start PM2 services
start_pm2() {
    print_status "Starting PM2 services..."
    
    # Start the application
    pm2 start ecosystem.config.js --env production
    
    # Wait for startup
    sleep 5
    
    # Save PM2 configuration
    pm2 save
    
    # Show status
    pm2 status
    
    print_success "PM2 services started successfully"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if process is running
    if pm2 list | grep -q "booksan-backend.*online"; then
        print_success "BookSAN backend is running"
        
        # Show recent logs
        print_status "Recent logs:"
        pm2 logs booksan-backend --lines 5 || true
        
        return 0
    else
        print_error "BookSAN backend is not running properly"
        pm2 logs booksan-backend --lines 20 || true
        return 1
    fi
}

# Main deployment flow
main() {
    print_status "Starting BookSAN deployment process..."
    
    # Step 1: Cleanup
    cleanup_pm2
    
    # Step 2: Start services
    start_pm2
    
    # Step 3: Verify
    if verify_deployment; then
        print_success "🎉 BookSAN deployment completed successfully!"
        echo ""
        echo "📊 PM2 Status:"
        pm2 monit --no-interaction || pm2 status
    else
        print_error "❌ Deployment verification failed"
        exit 1
    fi
}

# Run main function
main "$@"