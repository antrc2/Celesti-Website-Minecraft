import express from 'express';
import accountRoutes from "./accountRoutes.js"

const router = express.Router();

// Sử dụng các route con (modular routes)
router.use('/accounts', accountRoutes);


export default router;
