# 🥗 NutriFlow

### Nutrition Tracking Made Simple

**NutriFlow** is a full-stack nutrition tracking web application designed to help users log meals, monitor daily nutrition, set personal goals, and better understand their eating habits through a clean and responsive interface.

The application combines a **React + TypeScript frontend** with a **Java Spring Boot backend**, REST API communication, and a MySQL-ready architecture for future persistent data storage and authentication.

> 🚧 **Status:** Beta — Active Development

---

## 🛠️ Technologies & Tools

### Frontend

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="45" height="45" alt="React" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="45" height="45" alt="TypeScript" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" width="45" height="45" alt="Vite" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/bootstrap/bootstrap-original.svg" width="45" height="45" alt="Bootstrap" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" width="45" height="45" alt="HTML5" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" width="45" height="45" alt="CSS3" />
</p>

**React • TypeScript • Vite • React Router • Bootstrap • HTML5 • CSS3**

### Backend

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" width="45" height="45" alt="Java" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg" width="45" height="45" alt="Spring Boot" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/maven/maven-original.svg" width="45" height="45" alt="Maven" />
</p>

**Java 21 • Spring Boot • Spring Web MVC • Spring Data JPA • Maven • REST API**

### Database & Development Tools

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" width="45" height="45" alt="MySQL" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" width="45" height="45" alt="Docker" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" width="45" height="45" alt="Git" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" width="45" height="45" alt="GitHub" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg" width="45" height="45" alt="VS Code" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/intellij/intellij-original.svg" width="45" height="45" alt="IntelliJ IDEA" />
</p>

**MySQL • Docker • Git • GitHub • Visual Studio Code • IntelliJ IDEA**

---

## ✨ Features

### 📊 Nutrition Dashboard

The dashboard gives users a quick overview of their daily nutrition.

Users can view:

- Daily calorie intake
- Remaining calories
- Protein intake
- Carbohydrate intake
- Fat intake
- Progress toward nutrition goals
- Recently logged meals

Nutrition totals are calculated from meals returned by the Spring Boot backend.

---

### 🍽️ Meal Logging

Users can manually add meals and enter nutritional information including:

- Meal name
- Calories
- Protein
- Carbohydrates
- Fat

Meals are submitted from the React frontend to the Spring Boot REST API.

Each stored meal receives:

- A unique ID
- A creation timestamp

Users can also remove meals from their nutrition history.

---

### 🎯 Nutrition Goals

Users can create personalized daily nutrition targets.

| Nutrient | Default Goal |
| --- | ---: |
| Calories | 2,000 kcal |
| Protein | 120 g |
| Carbohydrates | 250 g |
| Fat | 65 g |

The dashboard automatically compares logged nutrition with the user's daily goals.

---

### 📖 Meal History

NutriFlow includes a dedicated history page where users can review logged meals.

Users can:

- View logged meals
- Search meals by name
- Sort by newest
- Sort by oldest
- Sort by highest calories
- Sort by lowest calories
- View total calories
- View total protein
- View total carbohydrates
- View total fat
- Delete meals

---

### 👤 Health Profile

Users can maintain personal profile information such as:

- Full name
- Email
- Biography
- Age
- Gender
- Height
- Weight
- Activity level
- Profile picture

NutriFlow also calculates useful health estimates.

#### BMI

**Body Mass Index** is calculated using the user's height and weight.

#### BMR

**Basal Metabolic Rate** estimates how much energy the body uses while at rest.

NutriFlow uses the **Mifflin-St Jeor equation** for this estimate.

#### TDEE

**Total Daily Energy Expenditure** estimates daily calorie needs using the user's BMR and activity level.

> Health calculations are provided for educational and informational purposes only and should not replace professional medical advice.

---

### 🌙 Light & Dark Mode

NutriFlow includes a global theme system.

Users can switch between:

- ☀️ Light mode
- 🌙 Dark mode

The selected theme is stored locally so the application can remember the user's preference.

---

### ⚙️ Settings

The settings page allows users to manage application preferences and stored data.

Current options include:

- Enable or disable nutrition tips
- Save application preferences
- Manage nutrition goals
- Clear meal history
- Manage application data

---

## 🏗️ Application Architecture

NutriFlow separates the frontend, backend, and data layer into independent parts.

```text
                    ┌────────────────────┐
                    │      NutriFlow     │
                    └─────────┬──────────┘
                              │
               ┌──────────────┴──────────────┐
               │                             │
               ▼                             ▼
     ┌───────────────────┐        ┌───────────────────┐
     │ React + TypeScript│        │    Spring Boot    │
     │     Frontend      │        │      Backend      │
     └─────────┬─────────┘        └─────────┬─────────┘
               │                             │
               │          REST API           │
               └────────────────────────────►│
                                             │
                                             ▼
                                   ┌───────────────────┐
                                   │    Data Layer     │
                                   └─────────┬─────────┘
                                             │
                                             ▼
                                   ┌───────────────────┐
                                   │       MySQL       │
                                   └───────────────────┘
```

### Frontend Responsibilities

The React frontend handles:

- User interface
- Navigation
- Forms
- Nutrition calculations
- Nutrition goals
- Health profile information
- Theme preferences
- API requests

### Backend Responsibilities

The Spring Boot backend handles:

- REST API endpoints
- Meal creation
- Meal retrieval
- Meal deletion
- Unique meal IDs
- Server-side timestamps
- Application logic
- Future database persistence

### Database

MySQL and Spring Data JPA are included in the backend configuration.

> **Current status:** meal records are temporarily stored in backend memory while persistent MySQL storage is being developed. Restarting the backend currently clears stored meal records.

---

## 🔌 REST API

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

The backend automatically assigns:

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

## 🚀 Getting Started

### Prerequisites

Make sure the following tools are installed:

- Java JDK 21
- Node.js
- npm
- Git
- Docker Desktop

The backend includes the Maven Wrapper, so Maven does not need to be installed separately.

---

### 1. Clone the Repository

```bash
git clone https://github.com/sengleapheng65-lab/NutriFlow-web-app.git
```

Move into the project directory:

```bash
cd NutriFlow-web-app
```

---

### 2. Start MySQL

Start the local development database:

```bash
docker compose up -d
```

Current configuration:

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

### 3. Start the Spring Boot Backend

Open a terminal:

```bash
cd backend
```

#### macOS / Linux

```bash
./mvnw spring-boot:run
```

#### Windows

```bash
mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

Meal API:

```text
http://localhost:8080/api/meals
```

---

### 4. Start the React Frontend

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

The frontend normally runs on:

```text
http://localhost:5173
```

---

## 🔄 Application Flow

```text
                   User
                    │
                    ▼
          React + TypeScript
                    │
              Add / View Meal
                    │
                    ▼
               REST API
                    │
                    ▼
              Spring Boot
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   Meal Storage          Nutrition Data
        │                       │
        └───────────┬───────────┘
                    ▼
           Dashboard / History
```

---

## 🧠 Skills Demonstrated

### Frontend Development

- React component architecture
- TypeScript
- React Hooks
- State management
- Client-side routing
- Responsive web design
- Form validation
- Local Storage
- Theme management
- Asynchronous API requests

### Backend Development

- Java
- Object-oriented programming
- Spring Boot
- Spring Web MVC
- REST controllers
- RESTful API design
- JSON serialization
- HTTP GET, POST, and DELETE requests
- Cross-Origin Resource Sharing
- Maven

### Database & Tools

- Spring Data JPA
- MySQL
- Docker Compose
- Git
- GitHub
- Frontend/backend integration

---

## 🗺️ Roadmap

### Backend & Database

- [ ] Connect meal storage to MySQL
- [ ] Create persistent JPA meal entities
- [ ] Add repository and service layers
- [ ] Associate meals with individual users
- [ ] Add update/edit meal API support

### Authentication

- [ ] Connect registration to Spring Boot
- [ ] Connect login to Spring Boot
- [ ] Add secure user accounts
- [ ] Add password hashing
- [ ] Add protected routes
- [ ] Add session or token-based authentication

### Nutrition Features

- [ ] Add meal categories
- [ ] Add barcode scanning
- [ ] Integrate a nutrition database API
- [ ] Automatically retrieve food nutrition information
- [ ] Add advanced nutrition charts
- [ ] Add weekly nutrition reports
- [ ] Add monthly nutrition reports
- [ ] Add weight tracking
- [ ] Add personalized nutrition recommendations

### Testing & Deployment

- [ ] Add frontend tests
- [ ] Add backend tests
- [ ] Deploy the frontend
- [ ] Deploy the backend
- [ ] Deploy the production database

---

## ⚠️ Current Limitations

NutriFlow is currently a **beta educational and portfolio project**.

The current version has several limitations:

- Login is not yet connected to backend authentication.
- Registration does not yet create backend user accounts.
- Social login buttons are currently interface elements only.
- Meal records are temporarily stored in backend memory.
- Restarting the backend clears existing meal records.
- MySQL and JPA are configured, but persistent meal storage is still being developed.
- Barcode scanning is not yet implemented.

---

## 🔐 Health & Privacy Disclaimer

NutriFlow is an educational software project and **not a medical application**.

Nutrition values and calculations such as BMI, BMR, and TDEE are intended for educational and informational purposes only.

They should not be considered professional medical advice, diagnosis, or treatment.

---

## 👨‍💻 Developer

### Leapheng Seng

Computer Science Student  
Full-Stack Software Development

<p>
  <a href="https://github.com/sengleapheng65-lab">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" width="35" height="35" alt="GitHub" />
  </a>
</p>

**GitHub:** [@sengleapheng65-lab](https://github.com/sengleapheng65-lab)

---

## 🤝 Contributing

Suggestions, improvements, and bug reports are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test the frontend and backend.
5. Commit your changes with a descriptive message.
6. Open a pull request.

---

## 📄 License

This project is currently intended for **educational and portfolio purposes**.

---

<div align="center">

# 🥗 NutriFlow

### Know what you eat. Feel better every day.

Built with **React • TypeScript • Java • Spring Boot • MySQL • Docker**

</div>
