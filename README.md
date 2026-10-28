# 🥗 NutriFlow

### Simple Nutrition Tracking for Healthier Habits

**NutriFlow** is a full-stack nutrition tracking web application designed to help users understand what they eat, monitor daily nutrition, set personal goals, and build healthier habits through a clean and responsive interface.

The project combines a modern **React + TypeScript frontend** with a **Java Spring Boot backend**, REST API communication, and a MySQL-ready architecture for persistent nutrition and user data.

---

## 💻 Technologies & Tools

\<p align="center">
&#x20; \<img src="[https://skillicons.dev/icons?i=react,typescript,vite,bootstrap,html,css,java,spring,maven,mysql,docker,git,github,vscode,idea](https://skillicons.dev/icons?i=react,typescript,vite,bootstrap,html,css,java,spring,maven,mysql,docker,git,github,vscode,idea)" />
\</p>

### Frontend

\<p>
&#x20; \<img src="[https://skillicons.dev/icons?i=react,typescript,vite,bootstrap,html,css](https://skillicons.dev/icons?i=react,typescript,vite,bootstrap,html,css)" />
\</p>

- React
- TypeScript
- Vite
- React Router
- Bootstrap
- Bootstrap Icons
- HTML5
- CSS3

### Backend

\<p>
&#x20; \<img src="[https://skillicons.dev/icons?i=java,spring,maven](https://skillicons.dev/icons?i=java,spring,maven)" />
\</p>

- Java 21
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Maven
- REST API

### Database & Development Tools

\<p>
&#x20; \<img src="[https://skillicons.dev/icons?i=mysql,docker,git,github,vscode,idea](https://skillicons.dev/icons?i=mysql,docker,git,github,vscode,idea)" />
\</p>

- MySQL 8
- Docker
- Git
- GitHub
- Visual Studio Code
- IntelliJ IDEA

---

## 📌 Project Status

> **Beta — Active Development**

NutriFlow is currently a class and portfolio project under active development.

The core nutrition tracking features are functional, while additional features such as persistent database storage, backend authentication, barcode scanning, and advanced nutrition analytics are planned for future development.

---

## ✨ Features

### 🏠 Responsive Landing Page

NutriFlow includes a modern landing page that introduces the application and its nutrition-tracking goals.

The interface includes:

- Responsive desktop and mobile navigation
- Hero section
- Feature overview
- About section
- Login and registration links
- Mobile navigation menu
- Light and dark themes

---

### 📊 Nutrition Dashboard

The dashboard provides users with a quick overview of their daily nutrition.

Users can view:

- Daily calorie intake
- Remaining calories
- Protein intake
- Carbohydrate intake
- Fat intake
- Daily nutrition progress
- Recently logged meals

Nutrition totals are automatically calculated from meals returned by the Spring Boot backend.

---

### 🍽️ Meal Logging

Users can manually add meals and record important nutrition information.

Each meal includes:

- Meal name
- Calories
- Protein
- Carbohydrates
- Fat

After a meal is submitted, it is sent to the backend through the NutriFlow REST API and becomes available on the dashboard and meal history pages.

---

### 🎯 Personal Nutrition Goals

Users can create personalized daily nutrition goals for:

- Calories
- Protein
- Carbohydrates
- Fat

Saved goals are automatically used by the dashboard when calculating daily nutrition progress.

Users can also reset their goals to NutriFlow's default values.

---

### 📖 Meal History

NutriFlow includes a dedicated history page where users can review previously logged meals.

Users can:

- View all logged meals
- Search meals by name
- Sort meals by newest
- Sort meals by oldest
- Sort meals by highest calories
- Sort meals by lowest calories
- View total calories
- View total protein
- View total carbohydrates
- View total fat
- Delete individual meals

---

### 👤 Health Profile

Users can create a personal health profile containing information such as:

- Full name
- Email
- Biography
- Age
- Gender
- Height
- Weight
- Activity level
- Profile picture

NutriFlow uses profile information to calculate useful health estimates.

#### BMI

NutriFlow calculates **Body Mass Index (BMI)** using the user's height and weight.

#### BMR

NutriFlow estimates **Basal Metabolic Rate (BMR)** using the Mifflin-St Jeor equation.

#### TDEE

NutriFlow estimates **Total Daily Energy Expenditure (TDEE)** using BMR and activity level.

> These calculations are intended for educational and informational purposes only and should not replace professional medical or nutritional advice.

---

### ⚙️ Settings

The settings page allows users to manage application preferences and stored data.

Current options include:

- Enable or disable nutrition tips
- Save application preferences
- Clear meal history
- Manage NutriFlow application data

---

### 🌙 Light & Dark Mode

NutriFlow includes a global theme system.

Users can switch between:

- ☀️ Light mode
- 🌙 Dark mode

The selected theme is stored locally so the application remembers the user's preference.

If no theme has been selected, NutriFlow can use the user's operating system color preference.

---

## 🏗️ Application Architecture

NutriFlow follows a full-stack architecture that separates the user interface, backend services, API communication, and data storage.

```text
                         NUTRIFLOW
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
      React + TypeScript              Spring Boot
           Frontend                    Backend
              │                             │
              │         REST API            │
              └────────────────────────────►│
                                            │
                                            ▼
                                      Data Layer
                                            │
                                            ▼
                                          MySQL
```

### Frontend

The React frontend is responsible for:

- User interface
- Navigation
- Forms
- Nutrition calculations
- Health profile information
- Nutrition goals
- Theme preferences
- Communicating with the backend API

### Backend

The Spring Boot backend is responsible for:

- REST API endpoints
- Meal creation
- Meal retrieval
- Meal deletion
- Server-side timestamps
- Business logic
- Preparing the application for database persistence

### Database

MySQL is configured as the development database.

The project also includes Docker Compose configuration for running MySQL locally.

> **Current development note:** meal records are currently stored in backend memory while MySQL persistence is still being integrated. Restarting the backend will clear the current meal records.

---

## 🔌 REST API

The current backend exposes REST endpoints for managing meals.

### Get All Meals

```http
GET /api/meals
```

Returns all currently stored meals.

---

### Add a Meal

```http
POST /api/meals
```

Example request:

```json
{
  "name": "Chicken Rice Bowl",
  "calories": 650,
  "protein": 45,
  "carbs": 70,
  "fat": 18
}
```

The backend automatically generates:

- A unique meal ID
- A creation timestamp

---

### Delete a Meal

```http
DELETE /api/meals/{id}
```

Deletes the meal matching the provided ID.

---

## 📁 Project Structure

```text
NutriFlow-web-app/
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AddMeal.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── History.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── services/
│   │   │   └── mealApi.ts
│   │   │
│   │   ├── styles/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/nutriflow/backend/
│   │       │       ├── BackendApplication.java
│   │       │       ├── controller/
│   │       │       │   └── MealController.java
│   │       │       └── model/
│   │       │           └── Meal.java
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── mvnw
│   └── pom.xml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Before running NutriFlow, make sure you have:

- Java JDK 21
- Node.js
- npm
- Git
- Docker Desktop or another Docker environment

The backend includes the Maven Wrapper, so Maven does not need to be installed separately.

---

## 1. Clone the Repository

```bash
git clone https://github.com/sengleapheng65-lab/NutriFlow-web-app.git
```

Enter the project directory:

```bash
cd NutriFlow-web-app
```

---

## 2. Start MySQL

The project includes Docker Compose configuration for local MySQL development.

Run:

```bash
docker compose up -d
```

The current development configuration uses:

```text
Database: nutriflow
Host: localhost
Port: 3307
```

To stop the database:

```bash
docker compose down
```

---

## 3. Start the Spring Boot Backend

Open another terminal and enter:

```bash
cd backend
```

### macOS / Linux

```bash
./mvnw spring-boot:run
```

### Windows

```bash
mvnw.cmd spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

The meal API is available at:

```text
http://localhost:8080/api/meals
```

---

## 4. Start the React Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔄 How NutriFlow Works

## Logging a Meal

```text
User
 │
 ▼
Add Meal Page
 │
 │ Nutrition Information
 ▼
React Frontend
 │
 │ POST /api/meals
 ▼
Spring Boot REST API
 │
 ▼
Meal Created
 │
 │ ID + Timestamp
 ▼
Dashboard / History
```

---

## Dashboard Nutrition Calculation

```text
Spring Boot
    │
    │ GET /api/meals
    ▼
React Dashboard
    │
    ├── Calories
    ├── Protein
    ├── Carbohydrates
    └── Fat
         │
         ▼
 Compare With Daily Goals
         │
         ▼
 Nutrition Progress
```

---

## 🎯 Default Daily Goals

When users have not created custom nutrition goals, NutriFlow uses the following default values:

| Nutrient      | Default Goal |
| ------------- | -----------: |
| Calories      |   2,000 kcal |
| Protein       |        120 g |
| Carbohydrates |        250 g |
| Fat           |         65 g |

Users can customize these values from the **Goals** page.

---

## 🧠 Concepts Demonstrated

NutriFlow demonstrates several important frontend, backend, and full-stack development concepts:

### Frontend Development

- React component architecture
- TypeScript interfaces and types
- React hooks
- React state management
- Client-side routing
- Responsive web design
- Form validation
- Local storage
- Theme management
- Async API communication

### Backend Development

- Java object-oriented programming
- Spring Boot
- REST controllers
- RESTful API design
- HTTP GET, POST, and DELETE requests
- JSON serialization
- Cross-Origin Resource Sharing
- Maven dependency management
- Spring Data JPA configuration

### Database & Development

- MySQL configuration
- Docker Compose
- Frontend/backend separation
- API integration
- Git version control
- GitHub collaboration

---

# 🗺️ Development Roadmap

NutriFlow is still growing.

Planned improvements include:

- [ ] Connect meal storage to MySQL
- [ ] Create persistent JPA meal entities
- [ ] Create repository and service layers
- [ ] Connect registration to the backend
- [ ] Connect login to backend authentication
- [ ] Add secure user accounts
- [ ] Add password hashing
- [ ] Associate meals with individual users
- [ ] Add barcode scanning
- [ ] Integrate a nutrition database API
- [ ] Automatically retrieve food nutrition information
- [x] Add meal editing
- [x] Add meal categories
- [x] Add nutrition charts
- [ ] Add weekly progress reports
- [ ] Add monthly progress reports
- [ ] Add weight tracking
- [ ] Add personalized nutrition recommendations
- [ ] Add frontend testing
- [ ] Add backend testing
- [ ] Deploy the frontend
- [ ] Deploy the backend

---

## ⚠️ Current Development Limitations

NutriFlow is currently a **beta educational project**.

At this stage:

- Login does not yet authenticate through the Spring Boot backend.
- Registration does not yet create backend user accounts.
- Social login buttons are currently interface elements only.
- Meal records are stored temporarily in backend memory.
- Restarting the backend clears meal records.
- MySQL and JPA are configured but meal persistence is still being integrated.
- Barcode scanning is planned but not yet implemented.

These features are part of NutriFlow's ongoing development roadmap.

---

## 🔐 Privacy & Health Disclaimer

NutriFlow is an educational software project and is **not a medical application**.

Nutrition totals, BMI, BMR, TDEE, and other calculated values are provided for informational and educational purposes only.

They should not be considered medical advice, diagnosis, or treatment.

Do not store sensitive medical information in the application while it is under development.

---

## 👨‍💻 Developer

**Leapheng Seng**

Computer Science Student
Full-Stack Software Development

GitHub: [@sengleapheng65-lab](https://github.com/sengleapheng65-lab)

---

## 🤝 Contributing

NutriFlow is currently under active development.

Suggestions, improvements, and bug reports are welcome.

To contribute:

1. Fork or clone the repository.
2. Create a new branch.
3. Make your changes.
4. Test the frontend and backend.
5. Commit your changes with a descriptive message.
6. Submit a pull request.

---

## 📄 License

This project is currently intended for **educational and portfolio purposes**.

---

\<div align="center">

### 🥗 NutriFlow

**Know what you eat. Feel better every day.**

Built with React, TypeScript, Java, Spring Boot, MySQL, and Docker.

\</div>

