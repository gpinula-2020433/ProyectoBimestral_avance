import { Router } from 'express';
import {
    addToCart
}from './cart.controller.js'
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';

const api = Router()

api.post('/addtocart', validateJwt, addToCart)



export default api