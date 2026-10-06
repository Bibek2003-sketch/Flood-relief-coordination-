import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import incidentRoutes from './routes/incidentRoutes';
import reliefRequestRoutes from './routes/reliefRequestRoutes';
import rescueRoutes from './routes/rescueRoutes';
import shelterRoutes from './routes/shelterRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import emailRoutes from './routes/emailRoutes';
import adminRoutes from './routes/adminRoutes';
import volunteerRoutes from './routes/volunteerRoutes';
import ngoRoutes from './routes/ngoRoutes';
import notificationRoutes from './routes/notificationRoutes';
import donationRoutes from './routes/donationRoutes';
import medicalRoutes from './routes/medicalRoutes';
import { ensureDemoRescueTeams } from './utils/rescueTeamSeeder';

dotenv.config(); // Root .env

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io initialization
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.set('io', io);

// Routes
app.get('/', (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    name: 'FloodRelief Coordination Management System API',
    version: '1.0.0',
    status: 'online',
    health: '/api/v1/health',
    endpoints: '/api/v1'
  });
});
app.get('/api/v1/health', (_req: express.Request, res: express.Response) => res.status(200).json({ status: 'ok', message: 'Server is running' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/incidents', incidentRoutes);
app.use('/api/v1/requests', reliefRequestRoutes);
app.use('/api/v1/rescue', rescueRoutes);
app.use('/api/v1/shelters', shelterRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/emails', emailRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/volunteer', volunteerRoutes);
app.use('/api/v1/ngo', ngoRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/medical', medicalRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await ensureDemoRescueTeams();
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, httpServer };
