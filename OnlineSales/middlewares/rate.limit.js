//Middleware de limitación de solicitudes
import rateLimit from "express-rate-limit";

export const limiter = rateLimit(
    {  
        /*
            el primer numero es para la cantidad de minutos
            los otros 2 son para pasar los segundos a minutos
        */ 
        windowMs: 15 *60 * 1000, //Rango de tiempo
        max: 100, //Cantidad de peticiones permitidas en el rango de tiempo
        message: {
            message: 'Your bloqued, wait 15 minutes'
        }
    }
)