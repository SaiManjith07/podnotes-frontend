# PodNotes Frontend

## Deployment mode: Vercel frontend + local backend

Use this setup if YouTube extraction is blocked on hosted backends.

### 1) Run backend locally

From `backend/`:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 5001 --reload
```

### 2) Expose local backend with HTTPS tunnel

Example with Cloudflare Tunnel:

```powershell
cloudflared tunnel --url http://127.0.0.1:5001
```

Copy the generated `https://...trycloudflare.com` URL.

### 3) Configure Vercel env

In Vercel project (`podnotes-frontend`) add:

- `VITE_API_BASE_URL=https://<your-tunnel-url>`

Redeploy frontend.

### 4) CORS on local backend

In `backend/.env`, keep `CORS_ORIGINS` containing:

- `https://podnotes-frontend.vercel.app`
- local dev origins (`http://localhost:8000`, `http://127.0.0.1:8000`, etc.)

Restart backend after `.env` changes.

### 5) Important

- Tunnel URL changes when restarted (unless you use a paid/static tunnel).
- Update `VITE_API_BASE_URL` in Vercel whenever tunnel URL changes.

### 6) Mobile demo checklist (same Wi-Fi)

1. On laptop, run:
   - `backend\start-backend.ps1`
   - `backend\start-tunnel.ps1`
2. Confirm tunnel health in browser:
   - `https://<your-tunnel-url>/api/podcast/health`
3. In Vercel, set `VITE_API_BASE_URL=https://<your-tunnel-url>` and redeploy.
4. On phone (same Wi-Fi), open:
   - `https://podnotes-frontend.vercel.app`
5. Keep laptop awake and both terminal windows running during demo.
6. If mobile still calls an old tunnel URL, clear app/site data and relaunch:
   - Android Chrome: Site settings -> Storage -> Clear & reset
   - iPhone Safari: Settings -> Safari -> Advanced -> Website Data -> remove site

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
