//Validar campos en las rutas

import { body } from "express-validator";
import { validateErrors } from "./validate.errors.js";
import { existEmail, existUsername, notRequiredField, objectIdValid } from "../utils/db.validators.js";

//Arreglo de validaciones (por cada ruta)
//Revisa los campos que se envian en el body
export const registerValidator = [
    body('name', 'Name cannot be empty')
        .notEmpty(),
    body('surname', 'Surname cannot be empty')
        .notEmpty(),
    body('username', 'Username cannot be empty')
        .notEmpty()
        .toLowerCase(),
    body('email', 'Email cannot be empty')
        .notEmpty()
        .isEmail()
        .custom(existEmail),
    body('username')
        .notEmpty()
        .toLowerCase()
        .custom(existUsername),
    body('password', 'Password cannot be empty')
        .notEmpty()
        .isStrongPassword()
        .withMessage('Password must be strong')
        .isLength({min: 8})
        .withMessage('Password need min characters'),
    body('phone', 'Phone cannot be empty')
        .notEmpty()
        .isMobilePhone(),
    validateErrors
]

export const updateUserValidator = [
    body('username')
        .optional() //el paramatro puede o puede no llegar- Si no llega no pasa a las demas
        .notEmpty()
        .toLowerCase()
        .custom((username, { req }) => existUsername(username, req.user)),
    body('email')
        .optional()
        .notEmpty()
        .isEmail()
        .custom((email, {req}) => existEmail(email, req.user)),
    body('password')
        .optional()
        .notEmpty()
        .custom(notRequiredField),
    /* body('profilePicture')
        .optional()
        .notEmpty()
        .custom(notRequiredField), */
    body('role')
        .optional()
        .notEmpty()
        .custom(notRequiredField),
    //validateErrorsWithoutFiles //Despues lo vamos a modificar
]

/* export const saveAnimalValidator = [
    body('name', 'Name cannot be empty')
        .isLength({max:35})
        .notEmpty(),
    body('description', 'description cannot be empty')
        .optional()
        .notEmpty(),
    body('age', 'Age cannot be empty')
        .isLength({max: 10})
        .notEmpty(),
    body('type', 'Type cannot be empty')
        .notEmpty()
        .toUpperCase(),
    body('keeper', 'Keeper cannot be empty')
        .notEmpty()
        .custom(objectIdValid),
    validateErrorsWithoutFiles
] */