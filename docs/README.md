# Kenya Finance | KeshoKwako

KeshoKwako is a premium, localized personal finance manager specifically designed for the Kenyan market. Built as a Progressive Web Application (PWA), it works seamlessly offline and natively on mobile devices. It provides comprehensive tools for tracking expenses (including M-Pesa tracking categories), planning monthly budgets, tracking asset portfolios (like SACCOs and MMFs), and offering localized financial insights and recommendations.

## Tech Stack
- **Frontend**: Next.js 14, React 19, Tailwind CSS, Zustand, React Query, Recharts, Framer Motion
- **Backend**: Django, Django REST Framework, Simple JWT, PostgreSQL (production), SQLite (local)

---

## Local Development Setup

### 1. Backend (Django) Setup

Open a terminal and navigate to the `backend` directory:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Set up environment variables:
Create a `.env` file in the `backend/` directory with the following:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

Run migrations and start the server:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
The API will be available at `http://localhost:8000`.

### 2. Frontend (Next.js) Setup

Open a new terminal and navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
Create a `.env.local` file in the `frontend/` directory with the following:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## Deployment Guide

The recommended stack for deployment is **Vercel** for the frontend and **Railway** or **Render** for the Django backend.

### Backend Deployment (Railway)
1. Push your code to GitHub.
2. Link your repository to a new Railway project.
3. Add a PostgreSQL database to the Railway environment.
4. Set the following environment variables in Railway:
   - `DJANGO_SETTINGS_MODULE=config.settings.production`
   - `SECRET_KEY=generate_a_secure_random_key`
   - `DEBUG=False`
   - `DATABASE_URL=your_railway_postgres_url`
   - `ALLOWED_HOSTS=.up.railway.app`
   - `CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app`
5. Railway will automatically detect the `requirements.txt` and `Procfile` (if added) and deploy.

### Frontend Deployment (Vercel)
1. Push your code to GitHub.
2. Import the `frontend` directory into Vercel.
3. Ensure the Build Command is `npm run build` and Install Command is `npm install`.
4. Add the Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app/api/v1`
5. Click Deploy. Vercel will automatically apply the settings in `vercel.json` to handle static caching and PWA service workers.

---

## Testing the PWA (Android / Mobile)

To experience KeshoKwako as a native app:
1. Deploy the app to Vercel (PWA requires HTTPS to install).
2. Open the deployed URL in Google Chrome on your Android device.
3. Tap the three dots (menu) in the top right corner of Chrome.
4. Select **"Install app"** or **"Add to Home screen"**.
5. The app will install and appear on your app drawer/home screen. 
6. Open the app from your home screen. It will launch in full-screen mode without the browser address bar. Try turning on Airplane mode to test the offline caching capabilities!
