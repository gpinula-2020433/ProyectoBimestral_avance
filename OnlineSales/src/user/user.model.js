//Modelo de usuario
 
import {Schema, model} from 'mongoose'
 
const userSchema = Schema(
    {
        name: {
            type: String,
            //Mongo validation (middleware / intermediario que valida el parametro antes guardar)
            required: [true, 'Name is required'],
            maxLength:[25, `Can't be overcame 25 characters`]
 
        },
        surname: {
            type: String,
            required: [true, 'Surname is required'],
            maxLength: [25, `can't be overcame 25 characters`]
        },
        username: {
            type: String,
            unique: [true, 'Username is alredy taken'],//No se puede duplicar el valor
            lowercase: true,
            maxLength: [15, `can't be overcame 25 characters`]
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            //vamos a ver que pasa si no es unico
            //Validacion personalizada:
            //macth: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g] //Regex para validar correo (momentaneo)
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minLength: [8, 'Password must be 8 characters'],
            maxLength: [100, `can't be overcame 16 characters`],
            //match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,16}$/gm]
        },
        /* profilePicture: {
            type: String
        }, */
        phone: {
            type: String,
            required: [true, 'Phone is required'],
            minLength: [8,`can't be overcame 16 characters`],
            maxLength: [13, 'Phone must be 13 numbers'],
            //macth: [/^\+[0-9]{1,3} [0-9]{3,5}-[0-9]{4}$/]
 
        },
        NIT:{
            type: String,
            required: [true, 'NIT is required'],
            minLength: [13, `Can't be overcame 13 characters`],
            maxLength: [13, 'NIT must be 13 numbers'],
            unique: [true, 'NIT already exists']
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            uppercase: true,
            enum: ['ADMIN', 'CLIENT']
        }
    },
    {
        versionKey: false, //Deshabilitar el __v(Versión del documento) que aparace por defecto en mongo db
        timestamps: true //Agrega propiedades de fecha (Fecha de creación y de ultima actualización)
    }
)

//Modificar el toJSON -> toObject para excluis datos en la respuesta
userSchema.methods.toJSON = function(){
    //Convertimos un documento de MongoDB a Objeto de JS
    const { __v, password, ...user } = this.toObject()
    return user
}


//Crear y exportar el modelo
export default model('User', userSchema)