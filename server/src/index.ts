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
import smsNotificationRoutes from './routes/smsNotificationRoutes';
import donationRoutes from './routes/donationRoutes';
import medicalRoutes from './routes/medicalRoutes';
import { ensureDemoRescueTeams } from './utils/rescueTeamSeeder';

dotenv.config(); // Root .env

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'https://flood-relief-coordination.vercel.app',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : [])
];

const checkCorsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  // Allow requests with no origin (mobile apps, curl, Postman)
  if (!origin) return callback(null, true);

  if (
    allowedOrigins.includes(origin) ||
    origin.endsWith('.vercel.app') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    return callback(null, true);
  }

  // Fallback allow for deployed client variations
  return callback(null, true);
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: checkCorsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: checkCorsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
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
app.use('/api/v1/notifications/sms', smsNotificationRoutes);
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
