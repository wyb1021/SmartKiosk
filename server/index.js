import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

import menuRoutes from './routes/menu.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/menus', menuRoutes);
app.use('/images', express.static('public/images'));
app.use('/api/menu', menuRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 4000, () =>
      console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4000}`)
    );
  })
  .catch(err => console.error('DB connection error', err));