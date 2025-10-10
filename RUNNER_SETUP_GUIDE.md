# GitHub Self-Hosted Runner Setup Guide

## Prerequisites
- Ubuntu/Linux server with sudo access
- Node.js 18+ installed
- PM2 installed globally

## Step 1: Create Runner on GitHub
1. Go to your repository: https://github.com/rai-12300063/Team77-BookSAN
2. Navigate to Settings → Actions → Runners
3. Click "New self-hosted runner"
4. Select Linux x64
5. Copy the download and configuration commands

## Step 2: Install Runner on Your Server
```bash
# SSH into your deployment server
ssh ubuntu@your-server-ip

# Create a directory for the runner
mkdir actions-runner && cd actions-runner

# Download the runner (use the URL from GitHub)
curl -o actions-runner-linux-x64-2.310.2.tar.gz -L https://github.com/actions/runner/releases/download/v2.310.2/actions-runner-linux-x64-2.310.2.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.310.2.tar.gz

# Configure the runner (use the token from GitHub)
./config.sh --url https://github.com/rai-12300063/Team77-BookSAN --token YOUR_TOKEN_FROM_GITHUB --labels deploy-runner

# Install as a service
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start
```

## Step 3: Verify Runner Status
- Check GitHub Settings → Actions → Runners
- Should show "Idle" status when ready

## Step 4: Test Deployment
- Push to BOOKSAN-150-development-final branch
- Monitor workflow in Actions tab

## Troubleshooting
- Check runner logs: `journalctl -u actions.runner.rai-12300063-Team77-BookSAN.deploy-runner.service -f`
- Restart service: `sudo ./svc.sh restart`
- Check permissions: Ensure runner user can execute PM2 commands