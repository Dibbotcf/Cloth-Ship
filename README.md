# Cloth Ship E-Commerce & CMS

A premium e-commerce platform with a hidden, custom-built Content Management System (CMS) featuring product and order management. Built with Next.js 16 (App Router) and MySQL.

## Tech Stack
- **Frontend Framework:** Next.js 16 (React)
- **Database:** MySQL
- **Driver:** `mysql2`
- **Styling:** Vanilla CSS Modules

---

## 🚀 How to Run Locally

### 1. Requirements
- **Node.js** (v18+)
- **XAMPP**, or any local MySQL server (Laragon, WAMP).

### 2. Database Installation
1. Open XAMPP and start the **Apache** and **MySQL** services.
2. Open your terminal or `phpMyAdmin`.
3. Create a new database named `clothship`:
   ```sql
   CREATE DATABASE clothship;
   ```
4. Import the included `clothship.sql` file located in the root of the project into the new `clothship` database.

### 3. Environment Variables
1. Ensure your `.env` file exists in the root directory.
2. Update the credentials if your MySQL settings differ. In a standard XAMPP setup (with MySQL running on port 3306 or 3307), it should look like this:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=clothship
DB_PORT=3307 # Or 3306 depending on your XAMPP config
```

### 4. Running the Application
1. Install node dependencies:
```bash
npm install
```
2. Start the development server:
```bash
npm run dev
```
3. Open [http://localhost:3000](http://localhost:3000) in your browser to view the storefront.

---

## ⚙️ Accessing the CMS

The e-commerce site features a hidden Admin login for security.
To access the CMS dashboard:

1. Go to any page of the storefront.
2. Press **`Ctrl + L`** on your keyboard to instantly trigger the Admin Dashboard login portal.
3. Use the following credentials:
   - **Username:** `admin`
   - **Password:** `clothshipadmin`

From the Dashboard, you have complete CRUD (Create, Read, Update, Delete) powers over the **Products** list and the ability to process and manage pending **Orders**. Ensure your MySQL database is running so that real-time statistics render properly on the dashboard.
