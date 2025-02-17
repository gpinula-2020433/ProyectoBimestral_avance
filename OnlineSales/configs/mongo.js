//Conexión a la BD
import mongoose  from "mongoose"

//Función de conexión
export const connect = async()=>{
    try{
        //Ciclo de vida Mongo
        mongoose.connection.on('error',()=>{
            console.log('MongoDB  / could not be connect to mongodb')
        })
        mongoose.connection.on('connecting',()=>{
            console.log('MongoDB / try connection')
        })
        mongoose.connection.on('connected',()=>{
            console.log('MongoDB / connected to mongodb')
        })
        mongoose.connection.once('open',()=>{
            console.log('MongoDB / connected to mongodb')
        })
        mongoose.connection.on('reconnected',()=>{
            console.log('MongoDB / reconnect to mongodb')
        })
        mongoose.connection.on('disconnected',()=>{
            console.log('MongoDB / disconnected')
        })

        await mongoose.connect(
            `${process.env.DB_SERVICE}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
            {
                maxPoolSize: 50,//maximo de conexiones 
                serverSelectionTimeoutMS: 5000//tiempo maximo de espera
            }
        )

    }catch(err){
        console.error('Database connection failed',err)
    }
}