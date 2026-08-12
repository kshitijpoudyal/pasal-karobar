# Pasal Karobar

Version: MVP  
Status: Living Document

---

# Vision

Pasal Karobar is a tablet-first Progressive Web App (PWA) that helps small cash-based businesses in Nepal easily record daily income and expenses while providing meaningful business insights.

The application is intentionally simple, allowing business owners to record transactions in seconds without interrupting customer service.

The long-term vision is to become the operating system for small businesses in Nepal.

---

# Target Users

## Primary

- Solo Barber Shops (shop owner + optional staff with separate logins)

## Future

- Salons
- Grocery Stores
- Pharmacies
- Tailoring Shops
- Restaurants
- Retail Shops
- Small Service Businesses

---

# Product Principles

The application must always be:

- Fast
- Simple
- Tablet First
- Touch Friendly
- Minimal
- Offline Friendly
- Easy to Learn

The application is NOT:

- A full accounting system
- A POS system
- An ERP

---

# Primary Goal

The most common action should take less than 5 seconds.

Record Transaction → Save → Return to Dashboard

---

# Navigation

- Dashboard
- Activity
- Customers
- Settings
- Floating Action Button — Record Transaction

Navigation should remain minimal.

---

# Accounts and staff (MVP)

- **Shop owner** — creates an account via **Create account** on the login screen, owns the business, and can register staff in Settings.
- **Staff** — sign in with email and temporary password provided by the owner; no self-sign-up or shop creation.
- **Shared data** — all members of a shop see and edit the same transactions, customers, and settings.
- **Attribution** — each transaction records who logged it (`recorded_by_user_id`); Activity shows **Logged by {name}** when available.

Per-staff permissions (delete restrictions, feature visibility) are deferred to a later phase.

---

# MVP Features

## Dashboard

### Displays

- Revenue
- Expenses
- Profit
- Customers
- Average Sale

### Analytics

- Revenue Trends
- Top Services
- Peak Hours
- Forecast
- Business Insights

---

## Activity

Timeline of transactions

### Features

- Search
- Date Filters
- Type Filters
- View
- Edit
- Delete

---

## Settings

- Business
- Services
- Expense Categories
- Application Settings

---

## Record Transaction

Two tabs: **Income** | **Expense**

### Income

- Service
- Price
- Tip
- Payment Method

### Expense

- Category
- Amount
- Payment Method

---

# Payment Methods

- Cash
- eSewa
- Khalti
- FonePay
- Bank Transfer

---

# Business Types

## Initially

- Barber Shop

## Future

- Salon
- Retail
- Restaurant
- Pharmacy
- Other

---

# Future Features

- Customers
- Appointments
- Inventory
- Reports
- Employees
- Branches
- Subscriptions
- AI Insights
- Notifications

---

# Success Metrics

- Transaction entry under 5 seconds
- Minimal training required
- Daily active usage
- Reliable business reporting

---

# Out of Scope (MVP)

- Inventory
- Appointments
- Customer Management
- Tax Management
- Employee Payroll
- Multi-Branch
- Advanced Accounting
