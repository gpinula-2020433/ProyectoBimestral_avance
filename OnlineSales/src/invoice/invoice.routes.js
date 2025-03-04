import { Router } from 'express';
import { 
    processPurchase
} from './invoice.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';

const api = Router();

api.post('/generateinvoice', validateJwt, processPurchase)


export default api