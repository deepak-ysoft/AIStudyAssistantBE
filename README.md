# AI Study Assistant

A full-stack web application for students to manage their studies with AI-powered features including note summarization, MCQ generation, study planning, and doubt solving.

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS + DaisyUI
- React Query for data fetching
- Axios for HTTP requests
- React Router for navigation
- Socket.io for real-time updates

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- Google Gemini API for AI features
- Socket.io for real-time notifications
- Multer for file uploads

## Project Structure

```
project-root/
├── FE/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/          # API service layer
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Page components
│   │   ├── router/       # Route configuration
│   │   ├── store/        # State management (optional)
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── BE/                    # Backend (Express + MongoDB)
    ├── src/
    │   ├── config/       # Database & API configs
    │   ├── controllers/  # Route controllers
    │   ├── middleware/   # Express middleware
    │   ├── models/       # MongoDB schemas
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic
    │   ├── socket/       # Socket.io setup
    │   ├── utils/        # Utility functions
    │   └── index.js      # Server entry point
    └── package.json
```

## Features

### Core Functionality
- User authentication (Signup/Login/Forgot Password)
- Subject management with color coding
- Notes creation and management (text/PDF upload)
- AI-powered note summarization
- Automatic MCQ generation from notes
- Flashcard creation and spaced repetition
- Quiz creation and attempt tracking
- AI doubt solver chatbot
- AI-powered study schedule generation
- Pomodoro timer with streak tracking
- Weekly & Monthly performance reports
- Dark/Light theme toggle
- Real-time notifications via Socket.io

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### Frontend Setup

```bash
cd FE
npm install
cp .env.example .env
# Update VITE_API_BASE_URL and VITE_SOCKET_URL in .env
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd BE
npm install
cp .env.example .env
# Update environment variables:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: A strong secret key
# - GEMINI_API_KEY: Your Google Gemini API key
npm run dev
```

The backend will be available at `http://localhost:5000`

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-study-assistant
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=http://localhost:5173
```

## API Routes

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/forgot-password` - Request password reset

### Notes
- `GET /notes` - Get all notes
- `POST /notes` - Create note
- `GET /notes/:id` - Get specific note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `POST /notes/:id/summarize` - Generate summary
- `POST /notes/upload` - Upload file

### Subjects
- `GET /subjects` - Get all subjects
- `POST /subjects` - Create subject
- `GET /subjects/:id` - Get specific subject
- `PUT /subjects/:id` - Update subject
- `DELETE /subjects/:id` - Delete subject

### AI
- `POST /ai/chat` - Chat with AI
- `POST /ai/mcqs` - Generate MCQs
- `POST /ai/study-plan` - Generate study plan
- `POST /ai/solve` - Solve doubts

### Quizzes
- `GET /quizzes` - Get all quizzes
- `POST /quizzes` - Create quiz
- `POST /quizzes/:id/start` - Start quiz
- `POST /quizzes/:id/submit` - Submit answers

### Reports
- `GET /reports/weekly` - Get weekly report
- `GET /reports/monthly` - Get monthly report
- `GET /reports/performance` - Get performance stats

## Development

### Frontend Development
- Uses React Router for page navigation
- React Query for server state management
- Context API for client state (Auth, Theme)
- Custom hooks for common logic
- API service layer for all backend calls

### Backend Development
- MVC architecture with services layer
- Middleware for authentication
- Proper error handling with response utilities
- Socket.io for real-time features
- Mongoose for data validation

## Database Schema

### User
- email (unique)
- password (hashed)
- name, grade, bio
- subjects reference
- study streak tracking

### Subject
- name, description, color
- references to notes, flashcards, quizzes
- total study hours

### Note
- title, content
- file support (PDF/text)
- AI-generated summary
- tags, view count

### Quiz
- title, questions with options
- attempts tracking
- score management

### Report
- user statistics
- performance metrics
- AI-generated insights
- recommendations

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Render/Railway)
- Set environment variables
- Deploy from git with `npm start` command

## Contributing
Follow the existing code structure and style. Create feature branches and submit PRs.

## License
MIT

## Support
For issues and feature requests, please create an issue in the repository.
"# AIStudyAssistantBE" 
