import { Router } from "express";
import { 
    getAll,
    get,
    update,

    updatePassword
    //updateProfilePicture
 } from "./user.controller.js";
import { isAdmin, validateJwt } from "../../middlewares/validate.jwt.js";
import { updateUserValidator } from "../../middlewares/validators.js";
/* import { 
    uploadProfilePicture
 } from "../../middlewares/multer.uploads.js" */

const api = Router()

//Rutas privadas (Solo puede acceder su está logeado)
api.get('/',  getAll)
api.get('/:id', [validateJwt], get) //El campo del token se llama authorization, se usa get
api.put('/updatepassword/:id', validateJwt, updatePassword)
api.put('/:id', 
    [
        validateJwt, 
        updateUserValidator
    ],
    update
)

/* 
api.put('/updateProfilePicture/:id',
    [
        validateJwt,
        uploadProfilePicture.single('profilePicture')
    ],
    updateProfilePicture
) */

export default api

