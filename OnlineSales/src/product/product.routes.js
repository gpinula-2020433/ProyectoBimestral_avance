import { Router } from 'express';
import { 
    getAllP,
    getProduct,
    save,
    updateProduct,
    deleteProduct,
    outOfStockProducts,
    bestSellingProducts
} from './product.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';


const api = Router();


api.get('/fuerastock', outOfStockProducts)
api.get('/productosmasvendidos', bestSellingProducts)

api.get('/:id', [validateJwt, isAdmin], getProduct);
api.get('/', getAllP);
api.post('/', [validateJwt, isAdmin], save)
api.put('/:id', [validateJwt, isAdmin] , updateProduct);
api.delete('/:id', [validateJwt, isAdmin] , deleteProduct);


export default api