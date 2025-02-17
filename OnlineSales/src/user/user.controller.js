//Gestionar funciones de usuario

import { encrypt } from '../../utils/encrypt.js'
import User from './user.model.js'

//Listar todos
export const getAll = async(req,res)=>{
    try{
        //Configuraciones de paginación
        const { limit = 20, skip = 0} = req.query
        //Consultar
        const users = await User.find()
            .skip(skip)
            .limit(limit)

        if(users.length === 0){
            return res.status(404).send(
                {
                    success: false,
                    message: 'Users not found'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Users found',
                users
            }
        )
    }catch(e){
        console.error(e)
        return res.status(500).send({message: 'General error',e})
    }
}


//Obtener uno
export const get = async(req, res)=>{
    try {
        //obtener el id del Producto a mostrar
        let { id } = req.params
        let user = await User.findById(id)

        if(!user)
        return res.status(404).send(
            {
                success: false,
                message: 'User not found'
            }
            )
        return res.send(
            {
                success: true,
                message: 'User found: ', 
                user
            }
        )
    } catch (err) {
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error', 
                err
            }
        )
    }
}

//Actualizar datos genereales
export const update = async(req, res)=>{
    try{
        const { id } = req.params
 
        const data = req.body
 
        const update = await User.findByIdAndUpdate(
            id,
            data,
            {new: true}
        )
 
        if(!update) return res.status(404).send(
            {
                success: false,
                message: 'User not found'
            }
        )
        return res.send(
            {
                success: true,
                message: 'User updated',
                user: update
            }
        )
    }catch(err){
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}

//Para la categoria por defecto
export const addDefaultAdmin = async()=>{
    try {
        //Verificamos si no esta creada
        const adminExists = await User.findOne(
            {
                name:'DefaultAdmin'
            }
        )
        //Si no existe que la cree
        if(!adminExists){
            let adminUser = new User(
                {
                    name: 'DefaultAdmin',
                    surname: 'Admin',
                    username: 'admin1',
                    email: 'admin@gmail.com',
                    password: 'Admin123!',
                    phone: '54411221',
                    role: 'ADMIN'
                }
            )
            //La guardamos encriptada
            adminUser.password = await encrypt(adminUser.password)
            await adminUser.save()
        }
    } catch (err) {
        console.error('Error creating default admin', err)
    }
}

/* 
//Actualizar profilePicture
export const updateProfilePicture = async(req, res)=>{
    try {
        const {uid} = req.user
        const {filename} = req.file
        const user = await User.findByIdAndUpdate(
            uid,
            {
                profilePicture: filename
            },
            {
                new: true
            }
        )

        if(!user) 
        return res.status(404).send(
            {
                success: false,
                message: 'User not found - Not updated'
            }
        )
        return res.send(
            {
                success: true,
                message: 'User updated successfully',
                user
            }
        )
    }catch(err){
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
} */