# Habit & Task Tracker

A small full-stack web application for tracking daily habits/tasks with streaks. Users can register, log in, create habits, mark them as completed once per day, and view their current streak count.

## Tech Stack

**Backend**
- Django
- Django REST Framework
- SimpleJWT authentication
- PostgreSQL
- python-dotenv
- django-cors-headers

**Frontend**
- React with Vite
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS

## Main Features

- User registration and login with JWT authentication
- User-specific habit data
- Create, read, update, and delete habits
- Mark a habit as completed for the current day
- Prevent double-marking the same habit on the same date
- Display current streak count for each habit
- Simple frontend logout by clearing stored tokens
- UI updates state without full page reloads

## Database Relationship

The application uses the following relationship:

```text
User → Habits → Completions
```

- One user can have many habits.
- One habit can have many completion records.
- One habit can have only one completion per date.

The duplicate completion rule is enforced using a database-level unique constraint on:

```text
habit + completed_date
```

This prevents the same habit from being marked as completed more than once on the same day.

## Streak and Date Logic

Each completion is stored using a date-only field (`completed_date`), not a full datetime. The app calculates “today” using the Django backend timezone.

**Timezone assumption:**

```text
Asia/Colombo
```

The backend uses `timezone.localdate()` to decide the current date.

Streak calculation works by checking completion dates backwards from today or yesterday:

- If the habit is completed today, the streak is counted backwards starting from today.
- If the habit is not completed today, the streak is counted backwards from yesterday.
- The streak stops when a missing date is found.
- If a user misses a day, the previous streak is broken.
- When the user completes the habit again after a missed day, a new streak starts from 1.

Example:

```text
June 14 → completed
June 15 → completed
June 16 → missed
June 17 → completed

Current streak on June 17 = 1
```

Streak logic was tested using the Django Python shell by manually inserting completion records for previous dates and checking the API response.

## Authentication Assumptions

- The backend uses SimpleJWT.
- Login returns an access token and refresh token.
- The frontend stores tokens in `localStorage` for simplicity.
- The access token is sent with protected API requests using an Axios interceptor.
- Logout is handled on the frontend by removing tokens and clearing Redux state.
- Automatic refresh-token handling is left out of scope for this small assignment.
- In a production version, the refresh token should ideally be stored in an HttpOnly secure cookie instead of `localStorage`.

## Setup Instructions for a Clean Machine

### 1. Install Required Software

Install the following before running the project:

- Python 3.x
- Node.js LTS
- PostgreSQL
- pgAdmin 4 or another PostgreSQL database tool
- Git

pgAdmin 4 is optional, but recommended for creating the database and visually checking users, habits, and completions.

### 2. Clone the Project

```bash
git clone https://github.com/pulasthiBuddikaGit/habit-task--tracker.git
cd habit-task-tracker
```


## Backend Setup

### 3. Create PostgreSQL Database

Open pgAdmin 4 and create a new database:

```text
habit_tracker_db
```

Or run this SQL command in PostgreSQL:

```sql
CREATE DATABASE habit_tracker_db;
```

No seed data is required. The reviewer can register a new user from the app.

### 4. Configure Environment Variables

Go to the backend folder:

```bash
cd backend
```

Create a `.env` file using `.env.example` as a reference.

Example `.env`:

```env
SECRET_KEY=django-insecure-change-this-local-key
DEBUG=True

DB_NAME=habit_tracker_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Update `DB_PASSWORD` with your own PostgreSQL password.

### 5. Create and Activate Virtual Environment

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 6. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 7. Run Database Migrations

```bash
python manage.py migrate
```

This creates the required tables in PostgreSQL.

### 8. Start Backend Server

```bash
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000/
```

Optional: create an admin user to inspect data in Django Admin.

```bash
python manage.py createsuperuser
```

Then open:

```text
http://127.0.0.1:8000/admin/
```

## Frontend Setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173/
```

## How to Test the App

1. Open `http://localhost:5173/`
2. Register a new user
3. Login with that user
4. Add a habit such as “Read 20 mins”
5. Mark the habit as done
6. Confirm the streak becomes 1
7. Try marking it again on the same day; the app should show it is already done
8. Edit or delete the habit
9. Logout

## Main API Endpoints

```text
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/token/refresh/

GET    /api/habits/
POST   /api/habits/
GET    /api/habits/{id}/
PATCH  /api/habits/{id}/
DELETE /api/habits/{id}/
POST   /api/habits/{id}/complete/
```

Protected endpoints require:

```text
Authorization: Bearer <access_token>
```

## AI Usage

I used ChatGPT as a development assistant for planning, implementation guidance, debugging, and documentation.

How ChatGPT was used:

- Helped plan the backend and frontend architecture
- Helped design the User → Habits → Completions database relationship
- Helped explain and refine the streak/date logic
- Helped identify edge cases such as double-marking the same habit on the same date
- Helped structure Redux state, Axios setup, and frontend API calls
- Helped prepare this README

AI output I reviewed and corrected:

- I clarified that the app should use “Habit” as the main entity instead of “Task”.
- I confirmed that one habit can have many completions, but only one completion per date.
- I adjusted the authentication approach to keep logout simple on the frontend.
- I documented localStorage token storage as acceptable for this assignment but not ideal for production.

## Out of Scope

The following are intentionally left out to keep the project focused:

- Email verification
- Password reset
- Automatic access-token refresh
- Cloud database deployment
- Production-level refresh-token cookie handling
- Advanced charts or calendar views
