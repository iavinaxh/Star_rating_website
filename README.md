# Store Rating & Review Platform

A full-stack web application that allows users to submit ratings and written review comments for registered stores. The platform supports a unified login system with three distinct user roles (System Administrator, Normal User, and Store Owner), enforcing different dashboard interfaces and permissions based on the logged-in role.

---

## 🚀 Key Features

### 1. Unified Authentication & Security
* **JWT-Based Session Tokens**: All API requests are authorized using signed JSON Web Tokens.
* **Secured Password Hashing**: Passwords are saved as one-way Bcrypt hashes in the database.
* **Forgot Password Flow**: Users can request an immediate password reset to a temporary access key directly from the login page.
* **Validation Guards**: Validation constraints are enforced on both the backend (DTO validator annotations) and frontend forms.
  * *Name*: 2 - 60 characters.
  * *Address*: 1 - 400 characters.
  * *Password*: 8 - 16 characters, containing at least one uppercase letter and one special character.
  * *Comment*: Maximum 500 characters (optional).

### 2. Normal User Dashboard
* **Dynamic Search & Sorting**: Search stores by name, filter by address location, and sort by name, address, or overall rating.
* **Inline Card Drawer Reviews**: Click **Rate & Review** directly on any store card. The card expands to show an interactive 1-5 star selector and comment box.
* **Anonymous Public Reviews**: Click **View Reviews** on a card to view feedback left by other customers. Reviewer names are automatically masked as `Anonymous Reviewer` to protect user privacy.
* **Security Settings**: Normal users can update their account password at any time.

### 3. Store Owner Dashboard
* **Average Ratings Metrics**: Displays the store's average rating calculated dynamically from customer submissions, alongside a large visualization rating card.
* **Customer Submissions Table**: Displays a detailed list of reviews containing the reviewer's full name, email, address, star rating, written comment, and submission date.
* **Review Sorting**: Sort reviewers by name, email, rating, or date.
* **Security Settings**: Owners can update their account password.

### 4. System Administrator Dashboard
* **Dashboard Widgets**: Displays system-wide counts:
  * Total registered users.
  * Total registered stores.
  * Total submitted ratings.
* **Admin Forms**: Register new System Admins, Normal Users, Store Owners, and Stores.
* **Owner-Store Linkage**: Administrators can assign registered store owners to new or existing stores.
* **Data Registers**: View complete system tables of all users (with filters by role and search) and all stores (showing Name, Email, Address, Overall Rating, and linked Owner).

---

## 🛠️ Technology Stack

* **Backend**: NestJS, TypeORM, JWT Passport Strategy, Class-Validator, class-transformer.
* **Database**: MySQL (with automatic fallback to `better-sqlite3` SQLite database file `database.sqlite` if no MySQL database is running).
* **Frontend**: React (Vite, TypeScript), Vanilla CSS (custom glassmorphic theme with glowing states, custom scrollbars, transitions, and slide-up page loaders).
* **Icons**: Lucide React.

---

## 📦 Database Seeding

When the backend starts for the first time on an empty database, it automatically seeds:
1. **Default Administrator Account**:
   * **Email**: `admin@storerating.com`
   * **Password**: `AdminPass123!`
2. **52 Initial Stores**: Seeds a rich collection of 52 major shopping, travel, delivery, apparel, and electronics stores so the platform is ready to use immediately.

---

## ⚙️ Local Setup Instructions

### Prerequisites
* [Node.js](https://nodejs.org) (v18 or higher recommended).

---

### Step 1: Configure Environment (.env)
Create a `.env` file in the `backend/` folder (we have configured `.gitignore` to prevent committing this file to GitHub). You can specify your MySQL credentials:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_DATABASE=store_rating_db
JWT_SECRET=super_secret_signing_key_123!
```
*Note: If no MySQL instance is active, the app automatically switches to SQLite (`database.sqlite` inside `/backend`) for a seamless run experience.*

---

### Step 2: Start the Backend Service
From the root directory, navigate to `backend/` and run:
```bash
cd backend
npm install
npm run start
```
This builds and starts the NestJS server on [http://localhost:3000](http://localhost:3000). The database migrations, table creation, and seeding will run automatically.

---

### Step 3: Start the Frontend Service
From the root directory, navigate to `frontend/` and run:
```bash
cd frontend
npm install
npm run dev
```
This starts the Vite React dev server on [http://localhost:5173](http://localhost:5173). Open the URL in your browser to access the website.
