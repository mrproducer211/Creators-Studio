<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to Netlify.

View your app in AI Studio: https://ai.studio/apps/drive/1yG5g9IOYSdMzYzzL1uyhhY8HPXB5tp24

## Run Locally

**Prerequisites:**
- Node.js (v18 or higher)
- npm or yarn
- A Gemini API key

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   ⚠️ **Important:** Never commit `.env` to git - it's already in `.gitignore`

3. **Run with Netlify Dev (Recommended):**
   ```bash
   npm run dev:netlify
   ```
   This will:
   - Start the Vite dev server
   - Start Netlify Functions locally
   - Load environment variables from `.env`
   - Make serverless functions available at `/.netlify/functions/*`
   
   Your app will be available at `http://localhost:8888`

4. **Alternative: Run Vite only (without serverless functions):**
   ```bash
   npm run dev
   ```
   ⚠️ **Note:** This won't work for API calls since serverless functions won't be running. Use `npm run dev:netlify` for full functionality.

### Troubleshooting

**Port already in use:**
- Netlify Dev defaults to port 8888
- If occupied, it will prompt for an alternative port
- Or specify: `netlify dev --port 3000`

**Environment variables not loading:**
- Ensure `.env` is in the root directory (same level as `package.json`)
- Restart `netlify dev` after creating/modifying `.env`
- Verify `GEMINI_API_KEY` is set correctly (no quotes needed)

**Functions not working:**
- Make sure you're using `npm run dev:netlify`, not `npm run dev`
- Check terminal for function errors
- Verify `@netlify/functions` is installed: `npm list @netlify/functions`

**TypeScript errors:**
- Run `npm install` to ensure all dependencies are installed
- If `@types/node` error persists, restart your IDE/editor

## Deploy to Netlify

### Prerequisites
- A GitHub account
- A Netlify account (free tier works great)
- A Gemini API key

### Steps

1. **Push to GitHub**
   - Create a new repository on GitHub
   - Push this code to your repository

2. **Connect to Netlify**
   - Go to [Netlify](https://www.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account and select your repository

3. **Configure Build Settings**
   - Netlify will auto-detect from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`
     - Functions directory: `netlify/functions`
   - ✅ No manual configuration needed - it's all in `netlify.toml`

4. **Set Environment Variable (IMPORTANT)**
   - In Netlify dashboard, go to **Site settings** → **Environment variables**
   - Click **Add a variable**
   - Add:
     - **Key:** `GEMINI_API_KEY`
     - **Value:** `AIzaSyC7HpdeAe0g_AWJqUnXokHvLd1pOdzZB00`
   - Click **Save**
   - ⚠️ **Important:** This must be set before deploying, or the serverless functions won't work

5. **Deploy**
   - Netlify will automatically deploy your site
   - Your site will be live at `https://your-site-name.netlify.app`

### Architecture

This app uses a secure serverless architecture:
- **Frontend**: React app built with Vite
- **Backend**: Netlify serverless functions in `netlify/functions/`
- **API Client**: `services/apiClient.ts` handles all API calls
- **Service Layer**: `services/geminiService.ts` contains the Gemini API logic

The API key is never exposed to the browser - it's securely stored in Netlify's serverless functions.

### Swapping API Providers

To replace Gemini with another provider:
1. Create a new service file (e.g., `services/openAiService.ts`) with the same function signatures
2. Update the imports in `netlify/functions/*.ts` to use your new service
3. No changes needed in the React components!
