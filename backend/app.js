import express from 'express';
import cors from 'cors';
import verifyEmailRoutes from './routes/verifyEmailRoutes.js';
// ... other imports

const app = express();

app.use(cors());
app.use(express.json());

// Mount the email verification routes
app.use('/api', verifyEmailRoutes);

// ... other route configurations

export default app; 