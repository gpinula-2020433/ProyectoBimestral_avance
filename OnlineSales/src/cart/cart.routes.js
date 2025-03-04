import { Router } from 'express';
import {
    addToCart,
    getCart,
    updateCart
}from './cart.controller.js'
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';

const api = Router()

api.post('/addtocart', validateJwt, addToCart)
api.get('/', validateJwt, getCart)
api.put('/updatecart', validateJwt, updateCart)

export default api