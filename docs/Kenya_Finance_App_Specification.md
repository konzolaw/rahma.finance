+-----------------------------------------------------------------------+
| 🇰🇪                                                                    |
|                                                                       |
| **KENYA PERSONAL FINANCE APP**                                        |
|                                                                       |
| Complete Product Requirements & Feature Specification                 |
|                                                                       |
| ─────────────────────────────────────                                 |
|                                                                       |
| Prepared for Developer Handoff                                        |
|                                                                       |
| Version 1.0 · May 2026                                                |
+=======================================================================+
+-----------------------------------------------------------------------+

+-----------------------------------+-----------------------------------+
| **Document Purpose**              | **Intended Audience**             |
|                                   |                                   |
| Full technical & functional       | The developer(s) who will design, |
| specification for a personal      | build, and deploy the application |
| finance mobile and web            | described in this document.       |
| application targeted at Kenyan    |                                   |
| users.                            |                                   |
+===================================+===================================+
+-----------------------------------+-----------------------------------+

  -----------------------------------------------------------------------
  **SECTION 1 --- PROJECT OVERVIEW & PURPOSE**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 1. What This App Is

This document is a complete specification for a personal finance
management application built specifically for people living in Kenya.
The app is designed to help two users --- the person who commissioned
this document and their developer --- track income, manage spending,
monitor savings and investments, and keep debt under control, all within
a single, beautifully designed app.

The app is inspired by and based on a fully functional Excel workbook
that was built prior to this document. Every feature, every category,
and every calculation described in this specification already exists and
works correctly in that Excel file. The job of the developer is to
replicate all of that functionality in a proper mobile and/or web
application, making it faster, more convenient, and accessible from
anywhere.

  -----------------------------------------------------------------------
  Think of this app as a premium, Kenya-specific version of apps like
  Mint or YNAB --- but built from scratch to match the spending habits,
  payment methods, financial institutions, and investment options that
  are specific to life in Kenya.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 1.1 The Problem Being Solved

Most Kenyans who earn a salary or run a business have no clear picture
of where their money goes every month. They earn, they spend, and by
month-end they are often left wondering what happened to their income.
There is no tool that is properly tailored to Kenyan financial realities
--- one that understands M-Pesa, Fuliza, SACCOs, Chamas, NHIF, HELB,
Treasury Bills, and the 47 counties of everyday Kenyan spending.

This app solves that problem by giving users a place to log every
shilling they earn and spend, automatically calculate where they stand
financially, compare actual spending against a monthly budget, and see
their savings and investments growing over time.

## 1.2 Who Will Use This App

The app is built for two users who will share it as a personal finance
tool. Both users should be able to:

-   Log in with their own accounts

-   Enter their own income and expenses

-   See shared financial summaries if they choose to

-   Have their data stored securely and privately

## 1.3 Core Philosophy

The design philosophy behind this app has three principles:

-   Minimum effort to enter data --- the user should open the app, tap a
    few things, and be done in under 30 seconds per transaction.

-   Maximum automation --- the app should calculate everything
    automatically. The user should never need to do mental arithmetic.

-   Beautiful, motivating design --- the app should feel like a premium
    financial product, not a spreadsheet. Looking at it should make the
    user feel in control of their money.

  -----------------------------------------------------------------------
  **SECTION 2 --- COMPLETE FEATURE LIST**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 2. Everything The App Must Do

Below is the full list of features the app needs. These are not optional
--- every single item listed here must be built. They are grouped by
module for clarity.

## 2.1 Dashboard (Financial Command Centre)

The Dashboard is the first screen the user sees after logging in. It is
the most important screen in the entire app. It should automatically
pull data from every other section and display a real-time financial
snapshot. No manual refresh should be needed.

### Summary Cards

The dashboard must display the following summary cards, each showing a
real-time calculated figure:

-   Total Monthly Income --- the sum of all income recorded this
    calendar month

-   Total Monthly Expenses --- the sum of all spending across every
    category this month

-   Remaining Balance --- income minus expenses for the current month

-   Savings Rate (%) --- what percentage of income was saved this month

-   Total Portfolio Value --- the current total value of all savings and
    investments

-   Total Debt Payments This Month --- total loan and debt repayments
    made this month

-   Monthly Savings Contributions --- how much was deposited into
    savings/investments this month

-   Housing Cost Ratio --- housing expenses as a percentage of income

### Budget vs Actual Table

A clear table on the dashboard showing, for every expense category:

-   The monthly budget set by the user

-   The actual amount spent so far this month

-   The difference (how much is left or how much is over)

-   The percentage of the budget used

-   A status indicator: OK, Near Limit, or Over Budget --- color coded
    green, yellow, and red respectively

### Financial Health Indicators

Six key financial ratio indicators displayed prominently on the
dashboard:

-   Monthly Surplus or Deficit --- positive means the user spent less
    than they earned

-   Savings Rate --- target is 20% or more

-   Debt-to-Income Ratio --- target is 20% or less

-   Housing Cost Ratio --- target is 30% or less

-   Food Cost Ratio --- target is 20% or less

-   Total Expenses vs Income Ratio --- target is 80% or less

Each indicator must show the actual figure AND a smart status message.
For example: if the debt ratio is 15%, show \"Healthy (under 20%)\". If
it is 40%, show a warning.

### Charts and Visualizations

The dashboard must include the following charts, all auto-calculated
from real user data:

-   Pie chart --- expense breakdown by category for the current month

-   Bar chart --- budget vs actual spending for every category side by
    side

-   Savings growth chart --- shows how total portfolio value has grown
    over time

-   Monthly cash flow chart --- income vs expenses plotted month by
    month

### Navigation

The dashboard must have clear, tappable navigation to every other
section of the app. Every section listed in this document must be
reachable in one or two taps from the dashboard.

## 2.2 Income Tracker

The Income Tracker is where the user records every source of money they
receive. Kenya has a diverse income landscape --- people earn from
formal employment, freelancing, side businesses, trading, dividends, and
digital work. The app must support all of these.

### Income Entry Fields

Every income entry must capture the following information:

-   Date --- when the money was received

-   Day of the week --- auto-calculated from the date

-   Income Source --- selected from a dropdown list (see categories
    below)

-   Description --- a free-text note about this specific income

-   Expected Amount (Ksh) --- what the user expected to receive

-   Actual Amount Received (Ksh) --- what they actually received

-   Difference --- auto-calculated: actual minus expected

-   Payment Method --- how the money arrived (M-Pesa, bank transfer,
    cash, etc.)

-   Notes --- any additional comments

### Income Source Categories (Dropdown)

The income source dropdown must include the following options:

-   Salary

-   Freelance Income

-   Side Hustles

-   Trading Income

-   Business Income

-   Dividends

-   Online Work

### Income Summary Calculations

The Income Tracker must automatically calculate and display:

-   Current month expected total

-   Current month actual total received

-   All-time total income recorded

-   Monthly income vs expected (surplus or shortfall)

## 2.3 Expense Tracking --- Eight Separate Categories

This is the most important section of the app. Expenses are tracked in
eight separate categories. Each category is its own dedicated section
within the app. A user should never need to choose which general bucket
to put an expense in --- the category is already defined by which
section they open. This keeps the data clean and accurate.

  -----------------------------------------------------------------------
  Each expense category is completely separate. Food expenses live in the
  Food section. Transport in Transport. There is no general
  \"miscellaneous\" catch-all for the main categories --- everything is
  organized from the start.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

### Fields Required for EVERY Expense Entry (All Categories)

Every single expense entry, in every category, must capture the
following fields:

-   Date --- when the money was spent

-   Day of the week --- auto-calculated from the date

-   Description --- what was bought or paid for

-   Subcategory --- a more specific label within the main category (from
    a dropdown)

-   Payment Method --- how it was paid (from a dropdown: Cash, M-Pesa,
    Debit Card, Credit Card, Bank Transfer)

-   Amount (Ksh) --- how much was spent

-   Running Total (Ksh) --- auto-calculated cumulative total for all
    entries so far

-   Notes --- optional extra detail

### Automatic Calculations Per Category

Every expense category section must automatically show:

-   Current month total --- sum of all entries in the current calendar
    month

-   All-time total --- sum of all entries ever recorded

-   Monthly budget for this category --- pulled from the user\'s budget
    settings

-   Remaining budget --- budget minus current month total

-   Percentage of budget used --- shown as a percentage

### Category 1 --- Food Expenses

Covers everything the user spends on eating and drinking.

**Subcategory dropdown options:**

-   Groceries

-   Dining Out

-   Snacks

-   Meal Prep

-   Fast Food

-   Coffee

-   Extra 1 (custom label)

-   Extra 2 (custom label)

### Category 2 --- Transport Expenses

Covers all costs related to getting around.

**Subcategory dropdown options:**

-   Matatu

-   Fuel

-   Uber / Bolt

-   Parking

-   Car Maintenance

-   Motorcycle Transport (boda boda)

-   Travel (long distance, flights, buses)

### Category 3 --- Housing Expenses

Covers all costs related to the user\'s home.

**Subcategory dropdown options:**

-   Rent

-   Electricity (Kenya Power)

-   Water

-   Internet (home broadband)

-   Repairs & Maintenance

-   Furniture & Home Items

-   Cleaning Supplies

### Category 4 --- Personal Care Expenses

Covers grooming, fitness, clothing, and personal hygiene.

**Subcategory dropdown options:**

-   Haircuts

-   Gym Membership

-   Toiletries

-   Skincare

-   Barber

-   Clothing & Shoes

-   Laundry

### Category 5 --- Entertainment Expenses

Covers leisure, subscriptions, events, and recreation.

**Subcategory dropdown options:**

-   Netflix

-   Spotify

-   Outings (restaurants, bars, hangouts)

-   Vacations & Holidays

-   Gaming

-   Movies & Cinema

-   Events & Concerts

### Category 6 --- Insurance Expenses

Covers all insurance premiums and statutory health contributions.

**Subcategory dropdown options:**

-   NHIF / SHA (National Health Insurance)

-   Medical Insurance (private)

-   Car Insurance

-   Life Insurance

### Category 7 --- Loans & Debt Expenses

Covers every loan repayment and debt obligation. This category is
critical --- it feeds into the Debt-to-Income ratio displayed on the
dashboard.

**Subcategory dropdown options:**

-   HELB (Higher Education Loans Board)

-   Fuliza (M-Pesa overdraft)

-   M-Shwari (M-Pesa savings & loan)

-   Bank Loan

-   Credit Card

-   Mobile Loan (KCB M-Pesa, Tala, Branch, etc.)

-   Extra Loan 1 (custom label)

-   Extra Loan 2 (custom label)

### Category 8 --- Additional Expenses

A catch-all for important expenses that do not fit neatly into the
categories above.

**Subcategory dropdown options:**

-   Airtime / Data Bundles

-   Family Support (money sent to relatives)

-   Donations & Church / Tithe

-   Education (fees, books, tuition)

-   Business Expenses (if self-employed)

-   Medical Emergencies

-   Miscellaneous

  -----------------------------------------------------------------------
  **SECTION 3 --- SAVINGS, BUDGET PLANNER & FINANCIAL INSIGHTS**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 3. Savings, Budget & Insights Modules

## 3.1 Savings & Investments Tracker

The Savings & Investments Tracker is where the user records money they
are setting aside for the future --- whether in a SACCO, a money market
fund, stocks, Treasury Bills, or crypto. This section must track not
just contributions but also current value and goal progress.

### Fields for Every Savings / Investment Entry

-   Date --- when the contribution was made

-   Investment Type --- selected from a dropdown (see list below)

-   Institution or Account Name --- free text (e.g. \"Stanbic SACCO\",
    \"CIC MMF\", \"Safaricom shares\")

-   Amount Contributed (Ksh) --- how much was deposited or invested

-   Current Value (Ksh) --- the current market or book value of that
    investment

-   Profit or Loss (Ksh) --- auto-calculated: current value minus
    contribution

-   Goal Target (Ksh) --- how much the user wants to reach with this
    investment

-   Goal Progress (%) --- auto-calculated: current value divided by goal
    target

-   Notes --- optional comments

### Investment Type Dropdown Options

-   SACCO (Savings and Credit Cooperative)

-   MMF (Money Market Fund)

-   Chama (investment group)

-   CHUMZ (youth savings platform)

-   Emergency Fund

-   Stocks (NSE or international)

-   Treasury Bills (91-day, 182-day, 364-day)

-   Treasury Bonds

-   Crypto (Bitcoin, etc.)

### Savings Summary Calculations

-   Total amount contributed across all time

-   Total current portfolio value

-   Total profit or loss across all investments

-   Total goal target across all investments

-   This month\'s contributions

-   Overall goal progress percentage

## 3.2 Monthly Budget Planner

The Monthly Budget Planner gives the user a bird\'s-eye view of their
entire financial month. It shows every expense category, the budget they
set, the actual amount spent, and how they compare. This screen should
update automatically --- the user never needs to manually type anything
into it.

### What the Budget Planner Must Show

For every expense category, the planner must show:

-   Category name

-   Monthly budget --- pulled from Category Settings (user-defined)

-   Actual spending --- pulled automatically from the relevant expense
    section

-   Difference --- budget minus actual

-   Percentage used --- actual divided by budget, displayed as a
    percentage

-   Status --- one of three states: On Track, Near Limit (above 90%), or
    Over Budget

In addition to the eight expense categories, the Budget Planner must
also show rows for:

-   Savings & Investments --- budgeted savings goal vs actual
    contributions this month

-   Monthly Income --- expected income vs actual income received

-   Net Monthly Cash Flow --- total income minus total expenses, shown
    at the bottom as a surplus or deficit

### Color Coding Rules

The status column must be color-coded automatically:

-   Green --- spending is below 90% of the budget

-   Yellow / Amber --- spending is between 90% and 100% of the budget

-   Red --- spending has exceeded the budget

## 3.3 Category Settings

Category Settings is where the user configures the monthly budget for
every spending category. This screen is the control panel --- whatever
the user sets here flows automatically into the Budget Planner and the
Dashboard.

### What the User Sets in Category Settings

For each of the nine categories (eight expenses + savings), the user
must be able to set:

-   Monthly Budget in Ksh --- how much they plan to spend in this
    category per month

-   Annual Budget --- auto-calculated (monthly budget x 12)

-   Priority --- Essential, Important, or Optional

-   Notes --- a personal reminder about this category

Category Settings must also have a field for:

-   Expected Monthly Income --- the amount the user expects to earn each
    month. This figure is used in every ratio calculation across the
    entire app.

Default budget values (which the user can change at any time):

  -----------------------------------------------------------------------
  **Category**           **Default Monthly Budget    **Priority**
                         (Ksh)**                     
  ---------------------- --------------------------- --------------------
  Food                   Ksh 15,000                  Essential

  Transport              Ksh 8,000                   Essential

  Housing                Ksh 25,000                  Essential

  Personal Care          Ksh 5,000                   Important

  Entertainment          Ksh 4,000                   Optional

  Insurance              Ksh 3,000                   Essential

  Loans & Debt           Ksh 10,000                  Essential

  Savings & Investments  Ksh 10,000                  Essential

  Additional             Ksh 5,000                   Variable
  -----------------------------------------------------------------------

## 3.4 Financial Insights & Trends

The Financial Insights section is where the app goes beyond just numbers
and actually teaches the user about their financial health. Everything
in this section is calculated automatically from the data the user has
entered. There is nothing to fill in here --- it is a read-only analysis
screen.

### Key Financial Ratios

The following six financial ratios must be calculated and displayed with
a benchmark, actual value, and a smart status message:

  -------------------------------------------------------------------------
  **Ratio**         **Formula**         **Healthy       **Example Status
                                        Benchmark**     Messages**
  ----------------- ------------------- --------------- -------------------
  Savings Rate      Monthly savings /   20% or more     \"Excellent\" /
                    Monthly income                      \"Fair\" / \"Needs
                                                        Work\"

  Expense Ratio     Total expenses /    80% or less     \"Good\" / \"Watch
                    Monthly income                      Out\" / \"Too
                                                        High\"

  Housing Cost      Housing expenses /  30% or less     \"Good\" /
  Ratio             Monthly income                      \"Monitor\" / \"Too
                                                        High\"

  Debt-to-Income    Loan payments /     20% or less     \"Healthy\" /
  Ratio             Monthly income                      \"Monitor\" /
                                                        \"Danger Zone\"

  Monthly           Income minus total  Positive        \"Surplus\" /
  Surplus/Deficit   expenses                            \"Deficit\"

  Food Cost Ratio   Food expenses /     20% or less     \"Good\" / \"OK\" /
                    Monthly income                      \"High\"
  -------------------------------------------------------------------------

### Spending Breakdown Table

A ranked table showing every expense category with:

-   Amount spent this month

-   Monthly budget for that category

-   Percentage of total expenses that category represents

-   How much of the budget has been used (percentage)

-   Ranking --- category ranked 1 to 8 from highest to lowest spending

### Emergency Fund Status Tracker

A dedicated panel that shows the user how healthy their emergency fund
is:

-   Estimated monthly expenses --- calculated from actual spending this
    month

-   Emergency fund available --- the current value of what is tagged as
    \"Emergency Fund\" in the Savings section

-   Months covered --- emergency fund divided by monthly expenses.
    Target is 6 months minimum.

-   Target amount --- monthly expenses multiplied by 6

-   Completion percentage --- how far along the user is toward their
    6-month emergency fund goal

-   Status message: Fully Funded, Half Way, or Keep Building

### Smart Money Tips for Kenya

A section at the bottom of Financial Insights that displays practical,
Kenya-specific financial education tips. These are static but should
look great. Topics to include:

-   The 50/30/20 rule --- 50% needs, 30% wants, 20% savings

-   How to build an emergency fund (recommended Kenyan institutions:
    Co-op Bank, NCBA Loop, Sanlam MMF)

-   How to reduce Fuliza dependency

-   How to start investing (Treasury Bills, MMF, SACCO)

-   The 30% rent rule

-   How to pay off debt strategically (avalanche method)

-   The importance of a monthly financial review

-   How to set short-term and long-term financial goals

  -----------------------------------------------------------------------
  **SECTION 4 --- TECHNICAL & UX REQUIREMENTS**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 4. Technical Requirements

## 4.1 Platform

The app should be built to work on at least one of the following
platforms. The developer should advise on the best approach based on
cost and timeline:

-   Mobile App --- Android first (Kenya has high Android penetration),
    iOS second

-   Web App --- a browser-based version that works on desktop and mobile
    browsers

-   Cross-platform --- ideally a single codebase that runs on both
    mobile and web (React Native, Flutter, or similar)

  -----------------------------------------------------------------------
  Priority: Android mobile app first, with a web companion dashboard.
  This reflects how most Kenyan users actually access digital services
  --- primarily through their smartphones.
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

## 4.2 Currency & Number Formatting

All monetary values throughout the entire app must be displayed in
Kenyan Shillings using the following format:

-   Format: Ksh 1,500 or Ksh 25,000 or Ksh 120,450

-   Thousands separator: comma

-   Decimal places: only show decimals where necessary (e.g. percentages
    show one decimal place: 47.3%)

-   Never show foreign currency symbols. This is a Kenyan app.

-   Negative values (deficits, losses) should be clearly indicated,
    either in red or with a minus sign or brackets

## 4.3 Data Entry --- Speed and Simplicity

The single most important UX requirement is that entering a transaction
must be fast. A user should be able to record an expense in under 20
seconds. To achieve this:

-   No category has to be manually typed --- everything uses dropdown
    selectors or tap-to-select chips

-   The date defaults to today\'s date automatically. The user only
    changes it if the transaction happened on a different day.

-   The day of the week is always auto-calculated from the date ---
    never manually entered

-   Payment methods are pre-defined dropdowns: Cash, M-Pesa, Debit Card,
    Credit Card, Bank Transfer

-   Subcategories are pre-defined per section --- the user selects from
    a list, never types

-   Notes are optional --- the user can skip them

-   After saving an entry, the form should reset and be ready for the
    next entry immediately

## 4.4 Data Storage & Architecture

The app needs a proper backend database, not just local storage. This is
because:

-   Two users need to access and share data

-   Data must persist if the user deletes the app or switches phones

-   Monthly trend data needs to accumulate over many months to generate
    useful trend charts

Recommended architecture:

-   Database: Firebase Firestore, Supabase, or a PostgreSQL database ---
    developer\'s choice

-   Authentication: Email/password login minimum. Google Sign-In is a
    bonus.

-   Data sync: All changes should sync in real-time or near-real-time
    between devices

-   Offline support: If the user is offline, they should still be able
    to enter transactions. These should sync when connectivity is
    restored.

## 4.5 User Accounts & Authentication

-   Each user has their own account with email and password

-   Both users can see each other\'s data if they are in a shared
    \"household\" or \"account group\" --- this is optional but
    desirable

-   Password reset via email must work

-   The app must not be accessible without logging in

-   Session should persist --- the user should not need to log in every
    time they open the app

## 4.6 Automation Rules

The following things must happen automatically --- the user should never
have to calculate or manually update any of these:

-   Day of week --- calculated from date

-   Running total per category --- updates as new entries are added

-   Current month totals --- auto-filtered by the current calendar month

-   Budget remaining --- calculated from budget minus actual spending

-   All percentages --- savings rate, expense ratio, housing ratio, debt
    ratio, food ratio, goal progress, budget used

-   Profit/loss in investments --- current value minus contribution

-   Dashboard figures --- all cards update automatically when new data
    is entered anywhere in the app

-   Emergency fund months covered --- auto-calculated

-   Financial health status labels --- auto-generated based on ratio
    thresholds

## 4.7 Filtering & Search

-   Every expense section must be filterable by month and year

-   Users should be able to search transactions by description keyword

-   Users should be able to filter by subcategory or payment method

-   Date range filtering should be available for advanced users

## 4.8 Notifications (Optional but Desirable)

-   Budget warning --- when spending in a category reaches 90% of the
    budget, push a notification

-   Over budget alert --- when spending exceeds the budget in any
    category

-   Monthly summary --- on the 1st of each month, send a brief summary
    of the previous month\'s performance

-   Savings goal milestone --- notify the user when they hit 25%, 50%,
    75%, and 100% of any savings goal

  -----------------------------------------------------------------------
  **SECTION 5 --- DESIGN & USER EXPERIENCE**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 5. Design Requirements

## 5.1 Overall Visual Philosophy

The app should look and feel like a premium financial product. Think of
the design language of apps like Revolut, Monzo, or M-Shwari --- clean,
modern, dark blues and teals with white text on key cards. It should not
look like a government form or a basic utility app.

The existing Excel workbook uses the following color palette and this
same palette should inspire the app design:

  -----------------------------------------------------------------------
  **Color Name**    **Hex Code**      **Used For**
  ----------------- ----------------- -----------------------------------
  Navy Blue         #1B2A4A           Primary backgrounds, headers,
                                      titles

  Deep Blue         #1A5276           Secondary headers, section banners

  Teal Green        #0E6655           Positive indicators, savings,
                                      totals

  Emerald Green     #1E8449           Income, healthy status labels

  Alert Red         #C0392B           Overspending, debt, warnings

  Deep Orange       #CA6F1E           Housing category, moderate warnings

  Royal Purple      #6C3483           Analytics, personal care category

  Gold              #B7950B           Entertainment, near-limit warnings

  Cyan Teal         #117A65           Savings & investments category
  -----------------------------------------------------------------------

## 5.2 Dashboard Design Specifics

-   Summary cards should be visually distinct boxes with bold numbers
    and a colored background matching the category color

-   The financial health indicators should use a traffic light system
    --- green dot, yellow dot, red dot next to each indicator

-   The budget vs actual table should use alternating row colors for
    readability

-   Charts should be interactive --- tapping a pie segment should show
    the category name and amount

-   The user\'s name and the current date should appear at the top of
    the dashboard as a personalized greeting

## 5.3 Expense Entry Screen Design

-   A clean form that can be completed with one hand on a phone

-   Large, tappable buttons for subcategories --- not a small dropdown
    text field

-   A number pad for the amount, not the standard keyboard

-   The running total should update visually as the user confirms a new
    entry, to give a satisfying sense of the tracker updating

-   Color-code the amount field: green if the category is under budget,
    red if over budget

## 5.4 Navigation Structure

Recommended navigation structure:

-   Bottom navigation bar on mobile with 4 or 5 tabs: Dashboard, Add
    Expense, Savings, Budget, More

-   The \"Add Expense\" button should be prominently placed --- this is
    the most-used function

-   From \"Add Expense\", the user first selects which category (Food,
    Transport, Housing, etc.) and then fills in the details

-   Settings, Category Budgets, and Financial Insights accessible from a
    \"More\" or hamburger menu

## 5.5 Data Display Conventions

-   All amounts displayed as Ksh X,XXX --- with the Ksh prefix always
    visible

-   Percentages shown to one decimal place: 47.3%, not 47%

-   Dates displayed in DD/MM/YYYY format (Kenyan standard)

-   Day of week shown as three-letter abbreviation: Mon, Tue, Wed, etc.

-   Zero amounts should display as Ksh 0, not blank

-   Status labels should be emoji-enhanced: ✅ On Track, ⚡ Near Limit,
    ⚠ Over Budget

  -----------------------------------------------------------------------
  **SECTION 6 --- DATA MODEL & STRUCTURE**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 6. Data Model

Below is the complete data model for every entity the app needs to
store. The developer should use this as the basis for designing the
database schema.

## 6.1 Users Table

  -----------------------------------------------------------------------------
  **Field**                 **Type**         **Notes**
  ------------------------- ---------------- ----------------------------------
  user_id                   UUID / Auto ID   Primary key

  email                     String           Login email address

  display_name              String           User\'s chosen name

  created_at                Timestamp        Account creation date

  expected_monthly_income   Number (Ksh)     Set in Category Settings

  partner_user_id           UUID (nullable)  If linked to another user\'s
                                             account
  -----------------------------------------------------------------------------

## 6.2 Category Budgets Table

  ------------------------------------------------------------------------
  **Field**            **Type**         **Notes**
  -------------------- ---------------- ----------------------------------
  budget_id            UUID             Primary key

  user_id              UUID             Foreign key to Users

  category_name        String           e.g. \"Food\", \"Transport\"

  monthly_budget_ksh   Number           User-defined monthly limit

  priority             String           Essential / Important / Optional /
                                        Variable

  notes                String           Optional user note

  updated_at           Timestamp        Last modified date
  ------------------------------------------------------------------------

## 6.3 Income Entries Table

  -----------------------------------------------------------------------
  **Field**           **Type**         **Notes**
  ------------------- ---------------- ----------------------------------
  income_id           UUID             Primary key

  user_id             UUID             Foreign key to Users

  date                Date             Date income was received

  day_of_week         String           Auto-calculated: Mon, Tue, etc.

  income_source       String           From dropdown list

  description         String           Free text

  expected_amount     Number           Ksh

  actual_amount       Number           Ksh

  payment_method      String           Cash, M-Pesa, Bank Transfer, etc.

  notes               String           Optional

  created_at          Timestamp        Record creation time
  -----------------------------------------------------------------------

## 6.4 Expense Entries Table

  -----------------------------------------------------------------------
  **Field**           **Type**         **Notes**
  ------------------- ---------------- ----------------------------------
  expense_id          UUID             Primary key

  user_id             UUID             Foreign key to Users

  category            String           Food, Transport, Housing, etc.

  date                Date             Date money was spent

  day_of_week         String           Auto-calculated

  description         String           What was bought

  subcategory         String           From the category\'s dropdown list

  payment_method      String           Cash, M-Pesa, Debit Card, etc.

  amount              Number           Ksh

  notes               String           Optional

  created_at          Timestamp        Record creation time
  -----------------------------------------------------------------------

## 6.5 Savings & Investment Entries Table

  ------------------------------------------------------------------------
  **Field**            **Type**         **Notes**
  -------------------- ---------------- ----------------------------------
  saving_id            UUID             Primary key

  user_id              UUID             Foreign key to Users

  date                 Date             Date of contribution or update

  investment_type      String           SACCO, MMF, Stocks, etc.

  institution          String           Free text institution name

  amount_contributed   Number           Ksh deposited this entry

  current_value        Number           Current market / book value

  goal_target          Number           Ksh target for this investment

  notes                String           Optional

  created_at           Timestamp        Record creation time
  ------------------------------------------------------------------------

  -----------------------------------------------------------------------
  **SECTION 7 --- ALL CALCULATED FORMULAS & LOGIC**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 7. Calculated Formulas Reference

Every formula the app needs to compute. These are the exact calculations
that the Excel workbook already performs and that the app must
replicate.

## 7.1 Dashboard Card Calculations

  -----------------------------------------------------------------------
  **Card**                    **Formula**
  --------------------------- -------------------------------------------
  Total Monthly Income        SUM of all income entries where date is in
                              current calendar month

  Total Monthly Expenses      SUM of all expense entries across all 8
                              categories where date is in current
                              calendar month

  Remaining Balance           Total Monthly Income MINUS Total Monthly
                              Expenses

  Savings Rate                Current month savings contributions DIVIDED
                              BY Total Monthly Income

  Total Portfolio Value       SUM of current_value field across all
                              savings & investment entries

  Debt Payments This Month    SUM of all Loans & Debt category entries in
                              current month

  Monthly Contributions       SUM of amount_contributed from savings
                              entries in current month

  Housing Cost Ratio          Housing category current month total
                              DIVIDED BY Total Monthly Income
  -----------------------------------------------------------------------

## 7.2 Financial Health Ratios

  --------------------------------------------------------------------------
  **Ratio**         **Formula**        **Green     **Yellow    **Red When**
                                       When**      When**      
  ----------------- ------------------ ----------- ----------- -------------
  Savings Rate      Monthly savings /  \>= 20%     10-19%      \< 10%
                    Monthly income                             

  Expense Ratio     Total expenses /   \< 80%      80-90%      \> 90%
                    Monthly income                             

  Housing Cost      Housing / Monthly  \<= 30%     30-40%      \> 40%
  Ratio             income                                     

  Debt-to-Income    Loan payments /    \<= 20%     20-35%      \> 35%
                    Monthly income                             

  Surplus/Deficit   Income minus       Positive    Zero        Negative
                    expenses                                   

  Food Cost Ratio   Food / Monthly     \<= 20%     20-30%      \> 30%
                    income                                     
  --------------------------------------------------------------------------

## 7.3 Per-Category Calculations

  -----------------------------------------------------------------------
  **Calculation**          **Formula**
  ------------------------ ----------------------------------------------
  Current Month Total      SUM of amount where category = \[X\] AND date
                           is in current calendar month

  All-Time Total           SUM of all amount entries for this category
                           ever

  Running Total            Cumulative sum of entries ordered by date
                           (entry 1 + entry 2 + \... + entry N)

  Budget Remaining         Monthly budget setting MINUS current month
                           total

  \% Budget Used           Current month total DIVIDED BY Monthly budget
                           setting

  Status                   IF % used \> 100% then Over Budget; IF % used
                           \> 90% then Near Limit; ELSE On Track
  -----------------------------------------------------------------------

## 7.4 Savings Calculations

  -----------------------------------------------------------------------
  **Calculation**          **Formula**
  ------------------------ ----------------------------------------------
  Profit / Loss per entry  current_value MINUS amount_contributed

  Goal Progress %          current_value DIVIDED BY goal_target

  Total Portfolio Value    SUM of all current_value entries

  Total Profit / Loss      SUM of all (current_value -
                           amount_contributed)

  This Month Contributions SUM of amount_contributed where date is in
                           current month

  Overall Goal Progress    Total Portfolio Value DIVIDED BY Total Goal
                           Target
  -----------------------------------------------------------------------

## 7.5 Emergency Fund Calculations

  -----------------------------------------------------------------------
  **Calculation**          **Formula**
  ------------------------ ----------------------------------------------
  Monthly expenses         Total Monthly Expenses (current month)
  estimate                 

  Emergency fund available SUM of current_value where investment_type =
                           \"Emergency Fund\"

  Months covered           Emergency Fund Available DIVIDED BY Monthly
                           Expenses Estimate

  6-month target           Monthly Expenses Estimate MULTIPLIED BY 6

  Completion %             Emergency Fund Available DIVIDED BY 6-Month
                           Target

  Status                   IF months \>= 6: Fully Funded; IF months \>=
                           3: Half Way; ELSE: Keep Building
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------
  **SECTION 8 --- ADDITIONAL FEATURES & NICE-TO-HAVES**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 8. Additional Features

## 8.1 Must-Have Additional Features

These are features beyond the core tracking that the app must include:

### Recurring Expenses Tracker

The user should be able to mark any expense as \"recurring\" with a
frequency (monthly, weekly, or annual). The app should then:

-   Remind the user when that expense is due

-   Show a list of all recurring expenses (subscriptions, rent, loan
    payments, NHIF, etc.)

-   Help the user plan for large annual payments like insurance renewals

### Monthly Savings Goal

A dedicated goal-setting feature where the user can set how much they
want to save each month and track whether they hit that goal. A visual
progress bar is ideal.

### Debt Payoff Tracker

For each debt (HELB, Fuliza, bank loan, etc.), the user should be able
to:

-   Set the total debt amount

-   Set the monthly repayment amount

-   See how many months remain until the debt is paid off

-   See the total interest they will pay

### Top Spending Categories

A ranked list showing which categories the user spent the most on this
month and last month, so they can identify patterns.

### Monthly Financial Score

A simple score from 0 to 100 that summarizes overall financial health
this month. It should be calculated based on:

-   Whether the user is within budget in all categories

-   Whether they hit their savings goal

-   Whether their debt ratio is healthy

-   Whether they have a monthly surplus

A score of 80+ is excellent. 60-79 is good. Below 60 needs attention.
Make this feel motivating, not punishing.

## 8.2 Nice-to-Have Features (Future Phases)

These are desirable but not required for the first version of the app:

-   Export to PDF --- generate a monthly financial report as a
    downloadable PDF

-   Export to Excel --- download all data as a spreadsheet (since this
    app was originally an Excel workbook)

-   Shared household view --- both users can see a combined financial
    dashboard

-   M-Pesa SMS parsing --- automatically read M-Pesa transaction SMS
    messages and offer to log them as expenses (requires SMS permission
    on Android)

-   Dark mode --- full dark mode UI option

-   Biometric lock --- fingerprint or face ID to open the app

-   Spending analytics by day of week --- shows if the user tends to
    overspend on weekends

-   Year-in-review --- an annual summary of income, expenses, and
    savings growth

  -----------------------------------------------------------------------
  **SECTION 9 --- COMPLETE SCREENS LIST**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 9. All Screens the App Needs

The following is a complete list of every screen the developer needs to
design and build:

## Authentication Screens

1.  Login Screen --- email and password

2.  Registration Screen --- create account

3.  Forgot Password Screen

## Main App Screens

4.  Dashboard (Home) --- financial command centre with all summary
    cards, charts, and health indicators

5.  Add Transaction Screen --- quick entry screen with category
    selector, amount, subcategory, payment method, date, and notes

6.  Income Tracker Screen --- list of all income entries with monthly
    summary

7.  Add Income Entry Screen

8.  Food Expenses Screen --- list of food entries with monthly summary

9.  Transport Expenses Screen

10. Housing Expenses Screen

11. Personal Care Expenses Screen

12. Entertainment Expenses Screen

13. Insurance Expenses Screen

14. Loans & Debt Expenses Screen

15. Additional Expenses Screen

16. Savings & Investments Screen --- list of all savings entries with
    portfolio summary

17. Add Savings Entry Screen

18. Monthly Budget Planner Screen --- auto-populated budget vs actual
    table

19. Financial Insights Screen --- ratios, breakdown, emergency fund,
    tips

20. Category Settings Screen --- budget limits for each category

21. Account / Profile Screen --- user details, partner linking, expected
    income

## Optional Additional Screens

22. Recurring Expenses Screen

23. Debt Payoff Tracker Screen

24. Monthly Financial Score Screen

25. Spending Trends Screen --- charts over multiple months

26. Export / Reports Screen

  -----------------------------------------------------------------------
  **SECTION 10 --- SUMMARY & DEVELOPER NOTES**
  -----------------------------------------------------------------------

  -----------------------------------------------------------------------

# 10. Summary for the Developer

## 10.1 What Has Already Been Built

Before this app is built, a fully working Excel workbook already exists
that does everything described in this document. The workbook contains:

-   14 interconnected sheets

-   4,254 working formulas with zero errors

-   All eight expense tracking sheets with dropdown menus

-   An income tracker

-   A savings and investments tracker

-   A monthly budget planner

-   A financial insights sheet with ratios and tips

-   A dashboard that pulls from every other sheet automatically

-   Category settings for budget configuration

The developer can use this Excel workbook as a live reference model. All
formulas, category names, subcategory lists, and calculated outputs in
this document match exactly what the workbook already does.

## 10.2 What Needs to Be Built

The developer needs to rebuild all of the above as a proper application
with:

-   A mobile-first interface (Android as the priority platform)

-   A real database that stores data securely and persistently

-   User authentication (two separate accounts, optionally linked)

-   A beautiful, intuitive UI that makes daily data entry fast and
    effortless

-   All calculations and formulas implemented as backend or frontend
    logic (not spreadsheet formulas)

-   Real-time updating dashboard that reflects all entered data

-   Charts and data visualizations

## 10.3 Key Things NOT to Change

The following elements must stay exactly as specified in this document
--- they are not open to interpretation:

-   The eight expense categories and their subcategory lists --- these
    are fixed

-   The currency must always be Kenyan Shillings (Ksh)

-   The financial ratio formulas --- especially the benchmarks (20%
    savings rate, 30% housing, 20% debt-to-income, 80% expense ratio)

-   The income source dropdown options

-   The investment type dropdown options

-   The payment method dropdown options: Cash, M-Pesa, Debit Card,
    Credit Card, Bank Transfer

## 10.4 The Spirit of This App

This app is not just a budgeting tool. It is a personal financial coach
for a Kenyan user. It should feel like it truly understands Kenyan life
--- it knows what Fuliza is, it knows what a Chama is, it knows that
people send money home to their family, that matatus are how most people
get around, that SACCO is a legitimate investment vehicle.

Every design decision should serve one goal: help the user feel
informed, in control, and financially motivated every time they open the
app. If the user opens it and feels overwhelmed or confused, the design
has failed. If they open it and feel like a financially savvy adult who
knows exactly where they stand, the app has succeeded.

**End of Product Requirements Document**

Kenya Personal Finance App · Version 1.0 · May 2026

Prepared for developer handoff. All features in this document are
non-negotiable for Version 1.0.
