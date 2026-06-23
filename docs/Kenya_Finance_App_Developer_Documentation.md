🇰🇪

**KENYA PERSONAL FINANCE APP**

Full Developer Documentation · Technical Architecture · Implementation
Guide

Version 1.0 · May 2026

**Stack: Next.js (PWA) + Django REST Framework + PostgreSQL**

Deployment: Vercel (frontend) + Railway/Render (backend) + Supabase (DB)

*Prepared for developer handoff. This document is the single source of
truth for building the app.*

  -----------------------------------------------------------------------
  **SECTION 1 --- PROJECT OVERVIEW & CONTEXT**

  -----------------------------------------------------------------------

**1. What We Are Building**

We are building a Kenya-specific personal finance web application that
functions as a Progressive Web App (PWA). The user can add it to their
Android or iOS home screen and use it exactly like a native mobile app
--- with no browser chrome, an app icon, offline support, and push
notifications.

The app was conceived as a replacement for a fully functional Excel
workbook that already exists. That workbook has 14 interconnected
sheets, 4,254 working formulas, and covers every aspect of personal
finance for a Kenyan user. Our job is to rebuild all of that
functionality in a proper, beautiful, database-backed application.

> *Think of this as a premium, Kenya-specific version of Mint or YNAB
> --- but built from scratch to reflect life in Kenya: M-Pesa, Fuliza,
> SACCOs, Chamas, HELB, matatus, boda bodas, NHIF, and Treasury Bills.*

**1.1 The Problem Being Solved**

Most Kenyans with a salary or business income have no clear picture of
where their money goes. They earn, they spend, and by month-end they are
left wondering what happened. There is no tool properly tailored to
Kenyan financial realities.

This app solves that by giving users a place to:

-   Log every shilling they earn and spend

-   Automatically calculate their financial position

-   Compare actual spending against a monthly budget

-   Monitor savings and investments growing over time

-   Track and plan debt repayment

**1.2 Target Users**

The app is built for two specific users (the person who commissioned it
and a partner) who will share it as a household finance tool. Both users
must be able to log in separately, enter their own data, and optionally
view shared summaries.

**1.3 Core Design Philosophy**

Every product decision must serve three principles:

1.  Minimum effort to enter data --- opening the app, entering a
    transaction, and closing should take under 30 seconds.

2.  Maximum automation --- the app must calculate everything. The user
    never does mental arithmetic.

3.  Beautiful, motivating design --- it must feel like a premium fintech
    product, not a spreadsheet or government form.

  -----------------------------------------------------------------------
  **SECTION 2 --- TECHNOLOGY STACK & ARCHITECTURE**

  -----------------------------------------------------------------------

**2. Why This Stack**

**2.1 The Chosen Stack**

  ---------------- ---------------- --------------------- ------------------
  **Layer**        **Technology**   **Why**               **Hosting**

  **Frontend**     Next.js 14       PWA support, SSR,     Vercel (free tier)
                   (React)          excellent DX,         
                                    Tailwind CSS          
                                    integration           

  **PWA Layer**    next-pwa         Service workers,      Built into Vercel
                                    offline cache, \"Add  deploy
                                    to Home Screen\" on   
                                    Android/iOS           

  **Backend**      Django 4.2 + DRF Mature,               Railway or Render
                                    batteries-included,   (free tier)
                                    excellent for         
                                    data-heavy APIs,      
                                    Python ecosystem      

  **Database**     PostgreSQL       Relational, reliable, Supabase or
                                    excellent Django      Railway Postgres
                                    integration, Supabase 
                                    free tier available   

  **Auth**         Django + DRF     JWT tokens,           Built into Django
                   SimpleJWT        email/password,       backend
                                    session persistence,  
                                    password reset flow   

  **State          Zustand + React  Lightweight global    N/A (client-side)
  (Frontend)**     Query            state + powerful      
                                    server-state caching  
                                    and sync              
  ---------------- ---------------- --------------------- ------------------

**2.2 Why Next.js (not React Native or Flutter)**

The client has prioritized a web app first. Next.js is the best choice
because:

-   It can be configured as a PWA with near-native experience on Android
    (the priority platform)

-   One codebase works on all devices --- Android, iOS, desktop browser

-   No app store submission required --- deploy and update instantly

-   Vercel hosting is free, fast, and requires zero DevOps knowledge

-   Full React ecosystem --- charts, forms, animations, all available

**2.3 Why Django (not Node/Express or FastAPI)**

-   Django ORM maps perfectly to our relational data model (users,
    expenses, budgets)

-   Django REST Framework provides a complete API toolkit out of the box

-   Built-in admin panel is useful for data inspection and debugging

-   SimpleJWT handles all authentication complexity

-   Mature, battle-tested, excellent documentation

**2.4 How Frontend and Backend Communicate**

Next.js calls the Django API over HTTPS. All API endpoints are prefixed
with /api/v1/. Authentication uses JWT bearer tokens stored in httpOnly
cookies for security.

> *Base URL pattern: https://api.kenyafinance.app/api/v1/ (or
> localhost:8000/api/v1/ in development)*

**2.5 The PWA \"Add to Home Screen\" Feature**

This is what makes the web app behave like a native app. When the user
visits the site on Android Chrome, they get a prompt to \"Add to Home
Screen.\" After that:

-   The app opens full screen --- no browser address bar

-   It has its own icon on the home screen

-   It caches assets and works offline (can still view data without
    internet)

-   Push notifications can be sent for budget alerts

This is achieved by configuring a Web App Manifest (manifest.json) and
Service Worker via the next-pwa package.

**2.6 Hosting Cost Estimate**

  --------------------- --------------------- -------------- --------------
  **Service**           **Provider**          **Free Tier**  **Paid (if
                                                             needed)**

  Next.js Frontend      Vercel                Yes ---        \~\$20/mo
                                              unlimited      

  Django Backend        Railway or Render     Yes --- 500    \~\$5-10/mo
                                              hrs/mo         

  PostgreSQL Database   Supabase              Yes --- 500MB  \~\$25/mo

  **TOTAL TO START**    ---                   **Ksh          \~Ksh 5,000/mo
                                              0/month**      
  --------------------- --------------------- -------------- --------------

  -----------------------------------------------------------------------
  **SECTION 3 --- PROJECT STRUCTURE & FOLDER LAYOUT**

  -----------------------------------------------------------------------

**3. Repository Structure**

**3.1 Recommended Monorepo Layout**

Use a single Git repository with two top-level folders: /frontend for
Next.js and /backend for Django. This keeps everything in one place
while keeping the two codebases cleanly separated.

> kenya-finance-app/
>
> frontend/ \# Next.js PWA
>
> src/
>
> app/ \# App Router pages
>
> (auth)/ \# Login, register, forgot-password
>
> (app)/ \# Main app (protected routes)
>
> dashboard/
>
> income/
>
> expenses/\[category\]/
>
> savings/
>
> budget/
>
> insights/
>
> settings/
>
> components/ \# Reusable UI components
>
> ui/ \# Base: Button, Input, Card, Modal
>
> charts/ \# Recharts wrappers
>
> forms/ \# Expense, Income, Savings forms
>
> layout/ \# Navbar, BottomNav, Sidebar
>
> hooks/ \# Custom React hooks
>
> lib/ \# API client, utils, formatters
>
> store/ \# Zustand global state
>
> types/ \# TypeScript interfaces
>
> public/
>
> manifest.json \# PWA manifest
>
> icons/ \# App icons (72x72 to 512x512)
>
> next.config.js \# next-pwa config
>
> backend/ \# Django REST API
>
> config/ \# Django settings, URLs, WSGI
>
> apps/
>
> users/ \# User model, auth endpoints
>
> income/ \# Income model + API
>
> expenses/ \# Expense model + API
>
> savings/ \# Savings model + API
>
> budgets/ \# Budget settings model + API
>
> dashboard/ \# Aggregated dashboard API
>
> insights/ \# Financial ratios API
>
> requirements.txt
>
> README.md
>
> docker-compose.yml \# Local dev environment

  -----------------------------------------------------------------------
  **SECTION 4 --- DATABASE MODELS & SCHEMA**

  -----------------------------------------------------------------------

**4. Database Design**

All data is stored in PostgreSQL. Django models map to these tables.
Every monetary value is stored as a DecimalField with max_digits=12,
decimal_places=2 to handle large Ksh values precisely.

**4.1 Users Table**

  ----------------------------- ------------- -------------- ---------------------------
  **Field**                     **Type**      **Required**   **Notes**

  **id**                        UUID          Auto           Primary key, auto-generated

  **email**                     String        Yes            Unique, used for login

  **display_name**              String        Yes            Shown in dashboard greeting

  **expected_monthly_income**   Decimal (Ksh) No             Used in all ratio
                                                             calculations

  **partner_user_id**           UUID (FK)     No             Links to another user for
                                                             shared view

  **created_at**                Timestamp     Auto           Account creation date
  ----------------------------- ------------- -------------- ---------------------------

**4.2 Category Budgets Table**

  ------------------------ ------------- -------------- ---------------------------
  **Field**                **Type**      **Required**   **Notes**

  **id**                   UUID          Auto           Primary key

  **user**                 FK → User     Yes            Owner of this budget
                                                        setting

  **category_name**        String        Yes            food, transport, housing,
                                                        personal_care,
                                                        entertainment, insurance,
                                                        loans_debt, savings,
                                                        additional

  **monthly_budget_ksh**   Decimal       Yes            User-defined monthly limit

  **priority**             String        Yes            essential / important /
                                                        optional / variable

  **notes**                String        No             User reminder note
  ------------------------ ------------- -------------- ---------------------------

**4.3 Income Entries Table**

  --------------------- ------------- -------------- ---------------------------
  **Field**             **Type**      **Required**   **Notes**

  **id**                UUID          Auto           Primary key

  **user**              FK → User     Yes            Owner

  **date**              Date          Yes            When income was received

  **day_of_week**       String        Auto           Computed from date: Mon,
                                                     Tue, etc.

  **income_source**     String        Yes            Salary / Freelance / Side
                                                     Hustles / Trading /
                                                     Business / Dividends /
                                                     Online Work

  **description**       String        Yes            Free text

  **expected_amount**   Decimal       No             What user expected to
                                                     receive

  **actual_amount**     Decimal       Yes            What was actually received

  **payment_method**    String        Yes            M-Pesa / Bank Transfer /
                                                     Cash

  **notes**             String        No             Optional comments
  --------------------- ------------- -------------- ---------------------------

**4.4 Expense Entries Table**

  -------------------- ------------- -------------- ---------------------------
  **Field**            **Type**      **Required**   **Notes**

  **id**               UUID          Auto           Primary key

  **user**             FK → User     Yes            Owner

  **category**         String        Yes            food / transport / housing
                                                    / personal_care /
                                                    entertainment / insurance /
                                                    loans_debt / additional

  **date**             Date          Yes            When money was spent

  **day_of_week**      String        Auto           Computed from date

  **description**      String        Yes            What was bought

  **subcategory**      String        Yes            From each category\'s
                                                    dropdown list

  **payment_method**   String        Yes            Cash / M-Pesa / Debit Card
                                                    / Credit Card / Bank
                                                    Transfer

  **amount**           Decimal       Yes            Amount spent in Ksh

  **notes**            String        No             Optional
  -------------------- ------------- -------------- ---------------------------

**4.5 Savings & Investments Table**

  ------------------------ ------------- -------------- ---------------------------
  **Field**                **Type**      **Required**   **Notes**

  **id**                   UUID          Auto           Primary key

  **user**                 FK → User     Yes            Owner

  **date**                 Date          Yes            Date of contribution

  **investment_type**      String        Yes            SACCO / MMF / Chama / CHUMZ
                                                        / Emergency Fund / Stocks /
                                                        T-Bills / T-Bonds / Crypto

  **institution**          String        Yes            E.g. \"CIC MMF\", \"Stanbic
                                                        SACCO\"

  **amount_contributed**   Decimal       Yes            Ksh deposited this entry

  **current_value**        Decimal       Yes            Current market / book value

  **goal_target**          Decimal       No             Ksh target for this
                                                        investment

  **notes**                String        No             Optional
  ------------------------ ------------- -------------- ---------------------------

  -----------------------------------------------------------------------
  **SECTION 5 --- DJANGO API ENDPOINTS**

  -----------------------------------------------------------------------

**5. REST API Reference**

All endpoints are prefixed with /api/v1/. All requests (except auth
endpoints) require a Bearer JWT token in the Authorization header. All
responses are JSON. All monetary values are in Ksh as strings (e.g.
\"15000.00\").

**5.1 Authentication Endpoints**

  ------------ ----------------------- ------------------ --------------------
  **Method**   **Endpoint**            **Description**    **Auth Required**

  **POST**     /auth/register/         Create a new user  No
                                       account            

  **POST**     /auth/login/            Login, returns     No
                                       access + refresh   
                                       tokens             

  **POST**     /auth/token/refresh/    Refresh the access Refresh token
                                       token              

  **POST**     /auth/password/reset/   Send password      No
                                       reset email        

  **GET**      /auth/me/               Get current user   Yes
                                       profile            

  **PATCH**    /auth/me/               Update profile /   Yes
                                       expected income    
  ------------ ----------------------- ------------------ --------------------

**5.2 Income Endpoints**

  ------------ --------------------- ------------------ -----------------------
  **Method**   **Endpoint**          **Description**    **Filters**

  **GET**      /income/              List all income    ?month=&year=&source=
                                     entries            

  **POST**     /income/              Create new income  ---
                                     entry              

  **GET**      /income/{id}/         Get single income  ---
                                     entry              

  **PATCH**    /income/{id}/         Edit an income     ---
                                     entry              

  **DELETE**   /income/{id}/         Delete an income   ---
                                     entry              

  **GET**      /income/summary/      Monthly totals and ?month=&year=
                                     stats              
  ------------ --------------------- ------------------ -----------------------

**5.3 Expenses Endpoints**

  ------------ --------------------- ------------------ ------------------------------------------------------
  **Method**   **Endpoint**          **Description**    **Filters**

  **GET**      /expenses/            List all expenses  ?category=&month=&year=&subcategory=&payment_method=
                                     (all categories)   

  **POST**     /expenses/            Create expense     ---
                                     entry              

  **GET**      /expenses/{id}/       Get single expense ---

  **PATCH**    /expenses/{id}/       Edit expense       ---

  **DELETE**   /expenses/{id}/       Delete expense     ---

  **GET**      /expenses/summary/    Per-category       ?month=&year=
                                     totals vs budget   
  ------------ --------------------- ------------------ ------------------------------------------------------

**5.4 Savings Endpoints**

  ------------ --------------------- -------------------- ---------------------
  **Method**   **Endpoint**          **Description**      **Filters**

  **GET**      /savings/             List all             ?type=&month=&year=
                                     savings/investment   
                                     entries              

  **POST**     /savings/             Add savings entry    ---

  **PATCH**    /savings/{id}/        Update current value ---
                                     / details            

  **GET**      /savings/summary/     Portfolio totals,    ---
                                     profit/loss, goals   
  ------------ --------------------- -------------------- ---------------------

**5.5 Dashboard & Insights Endpoints**

  ------------ ------------------------------ ---------------------------------------
  **Method**   **Endpoint**                   **Returns**

  **GET**      /dashboard/                    All summary cards: total income, total
                                              expenses, balance, savings rate,
                                              portfolio value, ratios --- all for
                                              current month

  **GET**      /dashboard/budget-vs-actual/   Per-category table: budget, actual,
                                              difference, % used, status (On Track /
                                              Near Limit / Over Budget)

  **GET**      /insights/                     All 6 financial ratios with benchmarks
                                              and status labels, spending breakdown,
                                              emergency fund status

  **GET**      /insights/trends/              Month-by-month income vs expenses for
                                              charts (last 12 months)

  **GET**      /budgets/                      All category budget settings for
                                              current user

  **PATCH**    /budgets/{category}/           Update budget for a specific category
  ------------ ------------------------------ ---------------------------------------

  -----------------------------------------------------------------------
  **SECTION 6 --- FRONTEND SCREENS & COMPONENTS**

  -----------------------------------------------------------------------

**6. All Screens to Build**

**6.1 Authentication Screens**

-   Login Screen --- email + password, link to Register and Forgot
    Password

-   Register Screen --- display name, email, password, confirm password

-   Forgot Password Screen --- email input, sends reset link

-   Reset Password Screen --- new password + confirm (linked from email)

**6.2 Main App Screens (All Protected by Auth)**

-   Dashboard --- the home screen with all summary cards, budget vs
    actual table, health indicators, and charts

-   Add Transaction --- quick entry screen: user first picks category,
    then fills description, subcategory, amount, payment method, date,
    and notes

-   Income Tracker --- list of income entries with monthly summary and
    total

-   Add / Edit Income Entry --- full form for income

-   Food Expenses --- list of food entries with monthly summary and
    budget status

-   Transport Expenses

-   Housing Expenses

-   Personal Care Expenses

-   Entertainment Expenses

-   Insurance Expenses

-   Loans & Debt Expenses

-   Additional Expenses

-   Savings & Investments --- list of entries with portfolio summary and
    goal progress

-   Add / Edit Savings Entry --- full form

-   Monthly Budget Planner --- auto-populated table of all categories

-   Financial Insights --- ratios, breakdown, emergency fund, money tips

-   Category Settings --- set monthly budget per category

-   Profile / Account --- update name, expected income, link partner

**6.3 Optional Screens (Phase 2)**

-   Recurring Expenses --- list and manage recurring bills

-   Debt Payoff Tracker --- per-debt: balance, monthly payment, months
    remaining

-   Monthly Financial Score --- 0-100 score with breakdown

-   Spending Trends --- multi-month charts

-   Export / Reports --- PDF or Excel download

**6.4 Navigation Structure**

Mobile bottom navigation bar with 5 tabs:

4.  Dashboard (home icon)

5.  Add Expense (large + button, most prominent)

6.  Savings (graph icon)

7.  Budget (chart icon)

8.  More (hamburger: Insights, Settings, Profile, Category Budgets)

  -----------------------------------------------------------------------
  **SECTION 7 --- ALL FINANCIAL CALCULATIONS & FORMULAS**

  -----------------------------------------------------------------------

**7. Calculated Formulas**

These calculations are implemented in the Django backend (in the
dashboard and insights API views) and returned as pre-computed values to
the frontend. The frontend only displays; it never calculates.

**7.1 Dashboard Card Calculations**

  ------------------------ ----------------------------------------------
  **Card**                 **Formula**

  **Total Monthly Income** SUM of actual_amount in income table WHERE
                           date is in current calendar month

  **Total Monthly          SUM of amount in expenses table WHERE date is
  Expenses**               in current calendar month (all categories)

  **Remaining Balance**    Total Monthly Income MINUS Total Monthly
                           Expenses

  **Savings Rate**         This month\'s amount_contributed (savings)
                           DIVIDED BY Total Monthly Income

  **Total Portfolio        SUM of current_value across ALL savings
  Value**                  entries (all time)

  **Debt Payments This     SUM of amount in expenses WHERE category =
  Month**                  loans_debt AND date is in current month

  **Housing Cost Ratio**   Housing current month total DIVIDED BY
                           expected_monthly_income (from user profile)
  ------------------------ ----------------------------------------------

**7.2 Financial Health Ratios**

  --------------------- ------------------ ----------- ------------ -----------
  **Ratio**             **Formula**        **Green**   **Yellow**   **Red**

  **Savings Rate**      savings / income   \>= 20%     10-19%       \< 10%

  **Expense Ratio**     expenses / income  \< 80%      80-90%       \> 90%

  **Housing Cost        housing / income   \<= 30%     30-40%       \> 40%
  Ratio**                                                           

  **Debt-to-Income**    loan payments /    \<= 20%     20-35%       \> 35%
                        income                                      

  **Surplus/Deficit**   income - expenses  Positive    Zero         Negative

  **Food Cost Ratio**   food / income      \<= 20%     20-30%       \> 30%
  --------------------- ------------------ ----------- ------------ -----------

**7.3 Emergency Fund Calculations**

  ------------------------ ----------------------------------------------
  **Calculation**          **Formula**

  **Monthly expenses       Total Monthly Expenses (current month)
  estimate**               

  **Emergency fund         SUM of current_value WHERE investment_type =
  available**              \"Emergency Fund\"

  **Months covered**       Emergency Fund DIVIDED BY Monthly Expenses

  **6-month target**       Monthly Expenses MULTIPLIED BY 6

  **Status**               IF months \>= 6: \"Fully Funded\" \| IF months
                           \>= 3: \"Half Way\" \| ELSE: \"Keep Building\"
  ------------------------ ----------------------------------------------

  -----------------------------------------------------------------------
  **SECTION 8 --- DESIGN SYSTEM & UI GUIDELINES**

  -----------------------------------------------------------------------

**8. Design System**

**8.1 Color Palette**

  ------------------ ------------- ------------------ --------------------
  **Color Name**     **Hex Code**  **Used For**       **Notes**

  **Navy Blue**      #1B2A4A       Primary            Main brand color
                                   backgrounds,       
                                   headers            

  **Deep Blue**      #1A5276       Secondary headers  Section banners

  **Teal Green**     #0E6655       Positive           Accent color
                                   indicators,        
                                   savings            

  **Emerald Green**  #1E8449       Income, healthy    Success states
                                   status labels      

  **Alert Red**      #C0392B       Overspending,      Error / danger
                                   debt, warnings     states

  **Deep Orange**    #CA6F1E       Housing category,  Warning states
                                   moderate warnings  

  **Royal Purple**   #6C3483       Analytics,         Insight screens
                                   personal care      

  **Gold**           #B7950B       Entertainment,     Amber alerts
                                   near-limit         
                                   warnings           

  **Cyan Teal**      #117A65       Savings &          Portfolio screens
                                   investments        
                                   category           
  ------------------ ------------- ------------------ --------------------

**8.2 Typography**

-   Font family: Inter (Google Fonts) --- clean, modern, readable on
    small screens

-   Display (dashboard cards): 24-32px, bold

-   Body: 14-16px, regular

-   Labels / captions: 12px

-   All monetary amounts: monospace font (e.g. JetBrains Mono or Roboto
    Mono) for alignment

**8.3 Currency Formatting Rules**

These rules are NON-NEGOTIABLE. Apply them everywhere:

-   Format: Ksh 1,500 (prefix \"Ksh\", space, comma-separated thousands)

-   Decimals: Only show when necessary. Percentages show one decimal:
    47.3%

-   Negative values: shown in red with a minus sign (Ksh -2,500)

-   Zero values: show as Ksh 0, never blank

-   Date format: DD/MM/YYYY (Kenyan standard)

-   Day of week: three-letter abbreviation: Mon, Tue, Wed, Thu, Fri,
    Sat, Sun

**8.4 Budget Status Color Coding**

-   Green (On Track): spending is below 90% of the monthly budget

-   Yellow / Amber (Near Limit): spending is between 90% and 100% of
    budget

-   Red (Over Budget): spending has exceeded the monthly budget

Status labels must include emoji: ✅ On Track \| ⚡ Near Limit \| ⚠ Over
Budget

**8.5 Design Inspiration**

The app should look and feel like Revolut, Monzo, or M-Shwari --- clean,
modern, dark navy/teal with white text on key cards. It must NOT look
like a government form, a basic utility app, or a plain spreadsheet.

  -----------------------------------------------------------------------
  **SECTION 9 --- PWA CONFIGURATION**

  -----------------------------------------------------------------------

**9. Progressive Web App Setup**

This is what makes the web app installable on Android/iOS and behave
like a native app. The setup is done in Next.js.

**9.1 Required Packages**

> npm install next-pwa
>
> npm install -D \@types/next-pwa

**9.2 next.config.js**

> const withPWA = require(\'next-pwa\')({ dest: \'public\' });
>
> module.exports = withPWA({
>
> reactStrictMode: true,
>
> });

**9.3 manifest.json (in /public)**

> {
>
> \"name\": \"Kenya Finance\",
>
> \"short_name\": \"KeshoKwako\",
>
> \"description\": \"Your personal finance manager for Kenya\",
>
> \"start_url\": \"/dashboard\",
>
> \"display\": \"standalone\",
>
> \"background_color\": \"#1B2A4A\",
>
> \"theme_color\": \"#1B2A4A\",
>
> \"icons\": \[
>
> { \"src\": \"/icons/icon-192.png\", \"sizes\": \"192x192\", \"type\":
> \"image/png\" },
>
> { \"src\": \"/icons/icon-512.png\", \"sizes\": \"512x512\", \"type\":
> \"image/png\" }
>
> \]
>
> }

**9.4 Offline Support**

next-pwa automatically caches all static assets. For dynamic data,
implement a service worker strategy that:

-   Caches the last-loaded dashboard data for offline viewing

-   Queues expense entries made offline and syncs when connectivity is
    restored

-   Shows a clear \"You are offline --- data may be stale\" banner when
    offline

  -----------------------------------------------------------------------
  **SECTION 10 --- ENVIRONMENT SETUP & DEPLOYMENT**

  -----------------------------------------------------------------------

**10. Setup & Deployment Guide**

**10.1 Local Development --- Django Backend**

9.  Clone the repo and enter the backend folder: cd backend

10. Create and activate a virtual environment: python -m venv venv &&
    source venv/bin/activate

11. Install dependencies: pip install -r requirements.txt

12. Set up environment variables (see 10.3 below)

13. Run migrations: python manage.py migrate

14. Create a superuser: python manage.py createsuperuser

15. Start dev server: python manage.py runserver

Django will be running at: http://localhost:8000

**10.2 Local Development --- Next.js Frontend**

16. Enter the frontend folder: cd frontend

17. Install dependencies: npm install

18. Set up environment variables (see 10.3 below)

19. Start dev server: npm run dev

Next.js will be running at: http://localhost:3000

**10.3 Environment Variables**

Backend (.env in /backend):

> SECRET_KEY=your-django-secret-key
>
> DEBUG=True
>
> DATABASE_URL=postgresql://user:password@localhost:5432/kenyafinance
>
> ALLOWED_HOSTS=localhost,127.0.0.1
>
> CORS_ALLOWED_ORIGINS=http://localhost:3000

Frontend (.env.local in /frontend):

> NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

**10.4 Deployment**

Frontend (Vercel):

-   Connect the /frontend folder of the repo to Vercel

-   Set NEXT_PUBLIC_API_URL to the live Django URL in Vercel environment
    variables

-   Every push to main auto-deploys

Backend (Railway):

-   Connect the /backend folder to Railway

-   Add a PostgreSQL plugin in Railway dashboard

-   Set all environment variables in the Railway dashboard

-   Railway auto-runs: python manage.py migrate on each deploy

**10.5 Required Django Packages (requirements.txt)**

> django\>=4.2
>
> djangorestframework
>
> djangorestframework-simplejwt
>
> django-cors-headers
>
> django-environ
>
> psycopg2-binary
>
> gunicorn
>
> whitenoise

  -----------------------------------------------------------------------
  **SECTION 11 --- RECOMMENDED BUILD ORDER**

  -----------------------------------------------------------------------

**11. Step-by-Step Build Order**

Build in this order. Each phase produces something working that can be
tested before moving on.

> *CRITICAL RULE: The eight expense categories, their subcategory lists,
> all currency formatting (Ksh only), and the financial ratio benchmarks
> are non-negotiable. Do not change or simplify them.*

**Phase 1 --- Backend Foundation (Week 1)**

20. Set up Django project structure with all apps

21. Create all database models (Users, Income, Expenses, Savings,
    Budgets)

22. Set up PostgreSQL connection and run migrations

23. Implement JWT authentication (register, login, refresh, me)

24. Write basic CRUD endpoints for Income and Expenses

25. Test all endpoints with Postman or DRF browsable API

**Phase 2 --- Calculations & Dashboard API (Week 2)**

26. Implement the dashboard summary calculations

27. Implement financial ratio calculations (savings rate, DTI, housing
    ratio, etc.)

28. Implement budget vs actual calculations

29. Implement emergency fund calculations

30. Build the /dashboard/, /insights/, and /expenses/summary/ endpoints

31. Write unit tests for all calculation logic

**Phase 3 --- Next.js Foundation (Week 3)**

32. Set up Next.js with App Router, TypeScript, and Tailwind CSS

33. Configure next-pwa and manifest.json

34. Build authentication screens (Login, Register, Forgot Password)

35. Implement JWT storage, API client (Axios), and auth middleware

36. Build protected route wrapper

37. Test PWA install on Android device

**Phase 4 --- Core Screens (Weeks 4-5)**

38. Build the Dashboard screen (summary cards, health indicators,
    charts)

39. Build the Add Transaction screen (category selector + form)

40. Build all 8 Expense category screens

41. Build the Income Tracker screen

42. Build the Savings & Investments screen

**Phase 5 --- Budget & Insights (Week 6)**

43. Build the Monthly Budget Planner screen

44. Build the Financial Insights screen

45. Build the Category Settings screen

46. Build the Profile / Account screen

**Phase 6 --- Polish & Launch (Week 7)**

47. Add charts (Recharts: pie chart, bar chart, line chart)

48. Add filtering and search to all list screens

49. Implement offline support and sync queue

50. Add push notifications for budget alerts

51. Performance testing and bug fixes

52. Deploy to Vercel (frontend) + Railway (backend)

53. Test full PWA install flow on Android and iOS

  -----------------------------------------------------------------------
  **SECTION 12 --- EXPENSE CATEGORIES & SUBCATEGORIES**

  -----------------------------------------------------------------------

**12. Complete Category Reference**

These are fixed. Do not change, reorder, or remove any category or
subcategory. The user chose these deliberately to match their real
spending patterns.

**Category 1 --- Food**

Subcategories: Groceries, Dining Out, Snacks, Meal Prep, Fast Food,
Coffee, Extra 1 (custom), Extra 2 (custom)

**Category 2 --- Transport**

Subcategories: Matatu, Fuel, Uber / Bolt, Parking, Car Maintenance,
Motorcycle Transport (boda boda), Travel (long distance / flights /
buses)

**Category 3 --- Housing**

Subcategories: Rent, Electricity (Kenya Power), Water, Internet (home
broadband), Repairs & Maintenance, Furniture & Home Items, Cleaning
Supplies

**Category 4 --- Personal Care**

Subcategories: Haircuts, Gym Membership, Toiletries, Skincare, Barber,
Clothing & Shoes, Laundry

**Category 5 --- Entertainment**

Subcategories: Netflix, Spotify, Outings (restaurants / bars /
hangouts), Vacations & Holidays, Gaming, Movies & Cinema, Events &
Concerts

**Category 6 --- Insurance**

Subcategories: NHIF / SHA (National Health Insurance), Medical Insurance
(private), Car Insurance, Life Insurance

**Category 7 --- Loans & Debt**

Subcategories: HELB (Higher Education Loans Board), Fuliza (M-Pesa
overdraft), M-Shwari, Bank Loan, Credit Card, Mobile Loan (KCB M-Pesa /
Tala / Branch), Extra Loan 1 (custom), Extra Loan 2 (custom)

**Category 8 --- Additional**

Subcategories: Airtime / Data Bundles, Family Support (money sent to
relatives), Donations & Church / Tithe, Education (fees / books /
tuition), Business Expenses, Medical Emergencies, Miscellaneous

**Payment Methods (All Categories)**

Cash, M-Pesa, Debit Card, Credit Card, Bank Transfer

**Income Sources**

Salary, Freelance Income, Side Hustles, Trading Income, Business Income,
Dividends, Online Work

**Investment Types (Savings)**

SACCO, MMF (Money Market Fund), Chama, CHUMZ, Emergency Fund, Stocks
(NSE or international), Treasury Bills (91-day / 182-day / 364-day),
Treasury Bonds, Crypto

**Default Monthly Budget Values**

  --------------------------- --------------------- ---------------------
  **Category**                **Default Budget      **Priority**
                              (Ksh)**               

  Food                        Ksh 15,000            Essential

  Transport                   Ksh 8,000             Essential

  Housing                     Ksh 25,000            Essential

  Personal Care               Ksh 5,000             Important

  Entertainment               Ksh 4,000             Optional

  Insurance                   Ksh 3,000             Essential

  Loans & Debt                Ksh 10,000            Essential

  Savings & Investments       Ksh 10,000            Essential

  Additional                  Ksh 5,000             Variable

  **TOTAL**                   **Ksh 85,000**        ---
  --------------------------- --------------------- ---------------------

  -----------------------------------------------------------------------
  **SECTION 13 --- PHASE 2 FEATURES (AFTER MVP)**

  -----------------------------------------------------------------------

**13. Future Features**

These features are desirable but NOT required for Version 1.0. Build
them after the core app is live and stable.

**13.1 Must-Have (Phase 2, Soon After Launch)**

-   Recurring Expenses Tracker --- mark expenses as recurring (monthly /
    weekly / annual), show reminders when due

-   Monthly Savings Goal --- dedicated goal setting with visual progress
    bar

-   Debt Payoff Tracker --- for each debt: total balance, monthly
    payment, months remaining, total interest

-   Monthly Financial Score --- 0 to 100 score based on budget
    adherence, savings rate, debt ratio, surplus/deficit

-   Top Spending Categories --- ranked list of categories by spend this
    month vs last month

**13.2 Nice-to-Have (Phase 3, When Time Allows)**

-   Export to PDF --- monthly financial report as downloadable PDF

-   Export to Excel --- download all data as a spreadsheet

-   Shared Household View --- combined financial dashboard for both
    users

-   M-Pesa SMS Parsing --- read M-Pesa transaction SMS messages and
    auto-suggest expense entries (Android only, requires SMS permission)

-   Dark Mode --- full dark mode UI option

-   Biometric Lock --- fingerprint or face ID to open the app

-   Spending Analytics by Day of Week --- identify weekend overspending
    patterns

-   Year-in-Review --- annual summary of income, expenses, and savings
    growth

  -----------------------------------------------------------------------
  **SECTION 14 --- CRITICAL RULES FOR THE DEVELOPER**

  -----------------------------------------------------------------------

**14. Non-Negotiable Requirements**

> *These rules cannot be changed. They are core to the purpose and
> identity of this app.*

  --- --------------------------- ----------------------------------------
      **Rule**                    **Why**

      **Currency must ALWAYS be   This is a Kenya-only app. No \$ or £
      Ksh**                       symbols ever.

      **8 expense categories ---  The user deliberately structured their
      fixed, no changes**         financial life around these categories.
                                  Changing them breaks the app\'s purpose.

      **All subcategory lists --- These are real Kenyan products and
      fixed**                     services the user actually uses.

      **Financial ratio           20% savings, 30% housing, 20% DTI, 80%
      benchmarks --- fixed**      expense ratio --- these are the targets.
                                  Do not change them.

      **All calculations happen   The frontend only displays pre-computed
      in the backend**            values from the API. Never calculate
                                  ratios or summaries in JavaScript/React.

      **No \"miscellaneous\"      Each category is cleanly separated.
      catch-all between           Category 8 (Additional) handles true
      categories**                miscellaneous. Do not create a universal
                                  misc bucket.

      **Android-first, PWA        This is a PWA, not a native app. Do not
      approach**                  introduce React Native or Flutter unless
                                  explicitly discussed.
  --- --------------------------- ----------------------------------------

**End of Developer Documentation**

Kenya Personal Finance App · Version 1.0 · May 2026

*This document is the single source of truth. All features described
here are required for v1.0.*
