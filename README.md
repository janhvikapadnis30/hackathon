# 🎓 Student Management System

A responsive web-based **Student Management System** designed for educational institutions to streamline administrative tasks, student record management, attendance tracking, fee monitoring, and examination results.

---

## 📌 Features

- **🔐 Multi-Role Authentication Interface:**
  - Login system supporting three user roles: **Admin**, **Faculty**, and **Student**.
  - Client-side validation ensuring all required credentials and roles are provided.
  - Interactive status feedback messages for users.

- **📊 Comprehensive Dashboard:**
  - **Student Records:** Manage student profiles, admissions, and general records.
  - **Attendance Tracking:** Monitor and record classroom attendance.
  - **Fee Management:** Track fee statuses, payment histories, and invoices.
  - **Examination Results:** View and publish semester grades and academic progress.

- **🎨 Modern UI & Responsive Layout:**
  - Card-based modular layout for intuitive dashboard navigation.
  - Styled with clean CSS transitions, hover states, and clear typography.

---

## 🛠️ Tech Stack

- **HTML5:** Semantic structure for dashboard and authentication components.
- **CSS3:** Responsive grid layouts, flexbox, and custom styling.
- **JavaScript (ES6):** Client-side form handling and validation logic.

---

## 📁 Project Structure

```
hackathon/
├── index.html       # Core HTML containing dashboard cards and login form
├── style.css        # Stylesheet for page layouts, cards, and form elements
├── script.js        # JavaScript handling form submission & validation
└── README.md        # Project documentation
```

---

## 🚀 Getting Started

No complex build steps or dependencies are required.

### 1. Clone the Repository
```bash
git clone https://github.com/janhvikapadnis30/hackathon.git
cd hackathon
```

### 2. Launch the Application
You can run the project using any of the following options:

- **Option A (Direct browser):** Open `index.html` directly in your web browser (Chrome, Edge, Firefox, Safari).
- **Option B (VS Code Live Server):** Right-click `index.html` in VS Code and select **"Open with Live Server"**.
- **Option C (Local Python HTTP Server):**
  ```bash
  # Python 3
  python -m http.server 8000
  ```
  Then open `http://localhost:8000` in your browser.

---

## 🧭 How to Use

1. **Authentication:**
   - Scroll to the login section.
   - Enter your username and password.
   - Select your designation from the **Login As** dropdown (**Admin**, **Faculty**, or **Student**).
   - Click **Login** to validate credentials.
2. **Dashboard Exploration:**
   - Use the **View Students**, **View Attendance**, **View Fees**, and **View Results** buttons to navigate the different modules.

---

## 🔮 Future Roadmap

- [ ] Connect to a backend server (Node.js / Express or Python / FastAPI)
- [ ] Database integration (MongoDB / PostgreSQL) for permanent record storage
- [ ] Role-based route protection and separate views for Admin, Faculty, and Student
- [ ] Export reports (attendance summaries and grade cards) as PDF
- [ ] Payment gateway integration for online fee payment

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
