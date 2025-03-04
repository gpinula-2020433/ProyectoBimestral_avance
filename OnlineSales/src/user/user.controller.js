//Gestionar funciones de usuario

import { checkPassword, encrypt } from '../../utils/encrypt.js'
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

        if(req.user.uid != id){
            return res.send(
                {
                    success: false,
                    message: `${req.user.name} | No puedes actualizar un perfil que no sea tuyo`
                }
            )
        }
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

//Para el admin por defecto
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
            let passwordAdmin = process.env.DEFAULTPASSWORD_ADMIN
            let usernameAdmin = process.env.DEFAULTADMINUSER
            let adminUser = new User(
                {
                    name: 'DefaultAdmin',
                    surname: 'Admin',
                    username: usernameAdmin,
                    email: 'admin@gmail.com',
                    password: passwordAdmin,
                    phone: '54411221',
                    NIT: '4541241542132',
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

export const updatePassword = async(req, res)=>{
    try {
        const {id} = req.params
        let { oldPassword, newPassword } = req.body

        const user = await User.findById(id)

        if(req.user.uid != id){
            return res.send(
                {
                    success: false,
                    message: `${req.user.name} | No puedes actualizar un perfil que no sea tuyo`
                }
            )
        }

        if(!user){
            return res.status(404).send(
                {
                    success: false,
                    message: 'No se encontro al user'
                }
            )
        }
        
        if(! await checkPassword(user.password, oldPassword)){
            return res.send(
                {
                    success: false,
                    message: 'Password Incorrect'
                }
            )
        }

        newPassword = await encrypt(newPassword)

        await User.findByIdAndUpdate(
            id,
            {password: newPassword},
            {new: true}
        )
        return res.send(
            {
                success: true,
                message: 'Password updated'
            }
        )
    } catch (err) {
        console.error(
            {
                success: false,
                message: 'General error',
                err 
            }
        )
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