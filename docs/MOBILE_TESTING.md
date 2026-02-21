# Mobile Testing Guide

## Quick Local Testing on Your Phone

### Step 1: Start the dev server with network access
```bash
npm run dev:mobile
```

### Step 2: Find your local IP
Your local IP is: **172.24.236.201**

### Step 3: Connect your phone
1. Make sure your phone is on the **same WiFi network** as your computer
2. Open your phone's browser
3. Go to: `http://172.24.236.201:5173`

### Troubleshooting
- **Can't connect?** Check your firewall settings
- **IP changed?** Run `hostname -I | awk '{print $1}'` to get your current IP
- **Still not working?** Try `npm run dev:mobile` and look for the "Local" and "Network" URLs in the terminal

## Vercel Auto-Deploy

Vercel will automatically deploy when you push to your main branch if:
- Your GitHub repo is connected to Vercel
- Auto-deploy is enabled (usually on by default)

To check/enable:
1. Go to https://vercel.com/ileanas-projects/tip-me/settings/git
2. Make sure your GitHub repo is connected
3. Auto-deploy should be enabled by default

## Tips
- Use local testing for quick iterations
- Use Vercel for final testing before sharing
- Hot reload works on mobile too! 🎉

