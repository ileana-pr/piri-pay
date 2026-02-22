# Mobile Testing Guide

How we test our app on mobile.

## Quick local testing on a phone

### Step 1: Start the dev server with network access
```bash
npm run dev:mobile
```

### Step 2: Find our local IP
Example: **172.24.236.201** (run `hostname -I | awk '{print $1}'` for current IP)

### Step 3: Connect the phone
1. Phone and dev machine on the **same WiFi**
2. Open the phone’s browser
3. Go to: `http://<OUR_LOCAL_IP>:5173`

### Troubleshooting
- **Can’t connect?** We check firewall settings
- **IP changed?** Run `hostname -I | awk '{print $1}'` for current IP
- **Still not working?** We run `npm run dev:mobile` and use the "Local" / "Network" URLs from the terminal

## Vercel auto-deploy

Vercel deploys when we push to main if:
- Our GitHub repo is connected to Vercel
- Auto-deploy is enabled (default)

To check or enable:
1. Go to https://vercel.com/ileanas-projects/tip-me/settings/git
2. Confirm our GitHub repo is connected
3. Confirm auto-deploy is on

## Tips
- We use local testing for quick iterations
- We use Vercel for final testing before sharing
- Hot reload works on mobile too 🎉

