import { Router } from 'express';
import { 
    getAllP,
    getProduct,
    save,
    updateProduct,
    deleteProduct,
    outOfStockProducts,
    bestSellingProducts,
    searchProductsByName,
    getProductsByCategory
} from './product.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';


const api = Router();


api.get('/fuerastock', [validateJwt], outOfStockProducts)
api.get('/productosmasvendidos',[validateJwt], bestSellingProducts)
api.get('/buscarproductbyname', [validateJwt],searchProductsByName)
api.get('/filterproductsbycategory/:categoryId', [validateJwt],getProductsByCategory)

api.get('/:id', [validateJwt], getProduct);
api.get('/',[validateJwt],  getAllP);
api.post('/', [validateJwt, isAdmin], save)
api.put('/:id', [validateJwt, isAdmin] , updateProduct);
api.delete('/:id', [validateJwt, isAdmin] , deleteProduct);


export default api