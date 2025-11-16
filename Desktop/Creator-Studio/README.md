<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to Netlify.

View your app in AI Studio: https://ai.studio/apps/drive/1yG5g9IOYSdMzYzzL1uyhhY8HPXB5tp24

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. For local development, you can create a `.env.local` file with:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
   Note: The API key is only used for local development. In production, it's securely stored in Netlify's environment variables.

3. Run the app:
   ```bash
   npm run dev
   ```

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
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Netlify will auto-detect these from `netlify.toml`

4. **Set Environment Variable**
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add a new variable:
     - Key: `GEMINI_API_KEY`
     - Value: Your Gemini API key
   - Click "Save"

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
