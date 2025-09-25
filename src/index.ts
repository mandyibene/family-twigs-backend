import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { detectLocale } from './middleware/detectLocale';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import { ENV } from './config';
import helmet from 'helmet';

dotenv.config();

const app = express();

app.use(cors());
// When the app is deployed
// app.use(cors({
//   origin: 'https://frontend-url.com',
//   credentials: true, // Needed for cookies
// }));
app.use(express.json());

app.use(cookieParser());
app.use(detectLocale); // Always after cookieParser

app.use(helmet()); // Default protections
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        ...(process.env.NODE_ENV === 'development' ? [`http://localhost:${ENV.PORT}`] : []),
      ],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Mount routes
app.get('/', (req, res) => {
  res.send('Family Twigs API is running ✅');
});
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

if (ENV.NODE_ENV !== 'test') {
  startServer();
}

function startServer() {
  app.listen(ENV.PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${ENV.PORT}`);
  });
}

export default app; // Export required for Supertest