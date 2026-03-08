import express from 'express'
import mongoose from 'mongoose';
import cors from 'cors'
import 'dotenv/config';

import taskRoutes from './routes/tasks.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager';

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev) ─────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Health check + DB Status ──────────────────────────────────
app.get('/', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌';
  res.send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h1 style="color: #4f46e5;">Three-Tier App Backend</h1>
      <p style="font-size: 1.2rem;">Server is running on port ${PORT}</p>
      <div style="margin-top: 2rem; padding: 1rem; border-radius: 8px; background: #f3f4f6; display: inline-block;">
        <strong>MongoDB Status:</strong> 
        <span style="color: ${mongoose.connection.readyState === 1 ? '#10b981' : '#ef4444'};">
          ${dbStatus}
        </span>
      </div>
      <p style="margin-top: 1rem; color: #6b7280;">Check the console for more details</p>
    </div>
  `);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

app.use('/api/tasks', taskRoutes);

// ─── 404 ──────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ─── Database + Server Start ──────────────────────────────────
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB connected: ${MONGO_URI}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // We don't exit(1) here so the user can see the error in the browser if they want, 
    // but in a real app you might want to retry or exit.
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
};

startServer();

export default app;
