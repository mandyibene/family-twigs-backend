import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { detectLocale } from './middleware/detectLocale';
import authRoutes from './routes/auth';
import { ENV } from './config';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(cookieParser());
app.use(detectLocale); // Always after cookieParser

// Mount auth routes
app.use('/api/auth', authRoutes);

app.listen(ENV.PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${ENV.PORT}`);
});