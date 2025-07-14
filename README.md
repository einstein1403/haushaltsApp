# Household Tasks App

A web-based household task management system with point tracking, built with React, Node.js, and PostgreSQL.

## Features

- **User Management**: Register and login with secure authentication
- **Task Creation**: Create tasks with descriptions and point values
- **Task Assignment**: Assign tasks to household members
- **Point System**: Earn points for completing tasks
- **Leaderboard**: Track who has the most points
- **Statistics**: Weekly and monthly overview of performance
- **Score Reset**: Reset all user scores (admin function)

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for development)

### Run with Docker

1. Clone the repository
2. Run the application:
   ```bash
   docker-compose up --build
   ```
3. Access the app at `http://localhost:3000`

### Development Setup

1. Install dependencies:
   ```bash
   npm run install:all
   ```

2. Start PostgreSQL database (or use Docker):
   ```bash
   docker run --name postgres-db -e POSTGRES_DB=household_tasks -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
   ```

3. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Users
- `GET /api/users` - Get all users with points
- `POST /api/users/reset-scores` - Reset all user scores

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id/complete` - Mark task as completed

### Statistics
- `GET /api/stats/weekly` - Get weekly statistics
- `GET /api/stats/monthly` - Get monthly statistics

## Environment Variables

### Server (.env in /server)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/household_tasks
JWT_SECRET=your-super-secret-jwt-key
```

### Client (.env in /client)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Database Schema

### Users
- id, name, email, password_hash, points, created_at

### Tasks
- id, title, description, points, created_by, assigned_to, completed, completed_by, completed_at, created_at

### Point History
- id, user_id, task_id, points, earned_at

## Usage

1. **Register**: Create an account or login with existing credentials
2. **Create Tasks**: Use the "Create Task" page to add new household tasks
3. **Assign Tasks**: Tasks can be assigned to any registered user
4. **Complete Tasks**: Mark tasks as completed and award points to the person who did the work
5. **Track Progress**: View the dashboard for overall progress and leaderboard
6. **View Statistics**: Check weekly and monthly performance in the Statistics page
7. **Reset Scores**: Use the reset button on the dashboard to start fresh (admin only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the application
5. Submit a pull request

## License

This project is open source and available under the MIT License.