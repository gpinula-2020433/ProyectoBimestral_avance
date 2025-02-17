//Validar los tokens
'use strict'

import jwt from 'jsonwebtoken'
import { findUser } from '../utils/db.validators.js'

export const validateJwt = async(req, res, next)=>{
    try {
        //Obetener la llave de acceso privada al token
        let secretKey = process.env.SECRET_KEY
        //Obtener el token de los headers (cabeceras)
        let { authorization } = req.headers
        //Verificamos que venga el token
        if(!authorization) return res.status(401).send({message: 'Unauthorized'})
            let user = jwt.verify(authorization, secretKey)
        //Validar que el usuario exista
        const validateUser = await findUser(user.uid)
        if(!validateUser) return res.status(404).send(
            {
                success: false,
                message: 'User not found - Unauthorized'
            }
        )

        //Inyectar en la solicitud un nuevo parámetro
        req.user = user
        //next() = todo salió bien por acá, que pase a la siguiente función
        next()
    } catch (err) {
        console.error(err)
        return res.status(401).send({message: 'Invalid credentials'})
    }
}

//Validación por roles (SIEMPRE tiene que ir después de validar el token)
export const isAdmin = async(req, res, next)=>{
    try {
        const {user} = req
        if(!user || user.role !== 'ADMIN') return res.status(403).send(
            {
                success: false,
                message: `You don't have access, you are not ADMIN | username: ${user.username}`
            }
        )
        next()
    } catch (err) {
        console.error(err)
        return res.status(403).send(
            {
                success: false,
                message: 'Error with authorization'
            }
        )
    }
}