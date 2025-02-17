import { Router } from 'express';
import { 
    save,
    getAllC,
    getCategory,
    updateCategory,
    deleteCategory
} from './category.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';

const api = Router();

api.post('/', [validateJwt, isAdmin], save)
api.get('/', getAllC)
api.get('/:id', [validateJwt, isAdmin], getCategory)
api.put('/:id', [validateJwt, isAdmin] , updateCategory)
api.delete('/:id', [validateJwt, isAdmin] , deleteCategory)


export default api