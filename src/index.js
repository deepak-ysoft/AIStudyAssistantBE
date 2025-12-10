import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import setupSocketIO from './socket/notification.js';

import authRoutes from './routes/authRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

connectDB();

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);
app.use('/ai', aiRoutes);
app.use('/subjects', subjectRoutes);
app.use('/quizzes', quizRoutes);
app.use('/reports', reportRoutes);

const httpServer = createServer(app);

const { io } = setupSocketIO(httpServer, CORS_ORIGIN);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for ${CORS_ORIGIN}`);
});

export default app;
