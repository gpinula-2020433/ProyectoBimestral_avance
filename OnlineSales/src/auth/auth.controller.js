//Gestionar lógica de autenticación
import User from '../user/user.model.js'
import { checkPassword, encrypt } from '../../utils/encrypt.js'
import { generateJwt } from '../../utils/jwt.js'

export const test = (req, res)=>{
    console.log('Test is running')
    res.send({message: 'Test is running'})
}

//Register
export const register = async(req, res)=>{
    try {
        //Capturar los datos
        let data = req.body
        //Crear el  objeto del modelo agregandole los datos capturados
        let user = new User(data)
        //Encriptar la password (2)
        user.password = await encrypt(user.password)
        //Asignar el rol por defecto
        //user.role = 'CLIENT'
        //Asignar profilePicture
        //user.profilePicture = req.file.filename ?? null //Nullish si es verdad lo de la izquierda, pone ese valor, sino pone el de la derecha
        //Guardar
        await user.save()
        //Responder al usuario
        return res.send({message: `Registered successfully, can be login with username: ${user.username}`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'General error with user registration', err})
    }
}

//Login
export const login = async(req, res)=>{
    try {
        //Capturar los datos (body)
        let {userLoggin, password} = req.body //userLogin para que sea un solo input de entrada, 
        //para logearse y así poder usar o el correo o el nombre de usuario

        //-----------------
        //Validar que el usuario exista
        //let user = await User.findOne({username})//{username}={username:username} 
        //Se desestructuraba porque solo se usaba el username especificamente
        //pero ahora verifica cualquiera de los 2 para logearse
        let user = await User.findOne(
            {
                $or: [ 
                    {email: userLoggin},
                    {username: userLoggin}
                ]
            }
        )

        //Verificar que la contraseña coincida
        if(user && await checkPassword(user.password, password)){
            //Generar el token
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            let token = await generateJwt(loggedUser)
            return res.send(
                {
                    message: `Welcome ${user.name}`,
                    loggedUser,
                    token
                }
            )
        }
        //Responder al usuario
        return res.status(400).send({message: 'Invalid password'})    
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'General error with login function', err})
    }
}