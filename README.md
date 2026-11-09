<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2b0f45e5-bd7f-4c5a-8057-18092a42bc1f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

The project includes Vercel serverless handlers for sign-in and registration under `api/auth`.
Configure `MONGODB_URI` in the Vercel project environment variables before deploying; authentication
uses the MongoDB database rather than in-memory storage so accounts persist between function calls.
Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` there as needed for administrator access.
