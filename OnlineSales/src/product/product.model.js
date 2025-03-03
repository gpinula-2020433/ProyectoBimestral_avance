import { Schema, model } from "mongoose";

const productSchema = Schema(
    {
        name:{
            type: String,
            maxLength: [55, `Can't be overcome 55 characters`],
            required: [true, 'Name is required'],
            unique: true
        },
        brand:{
            type: String,
            maxLength: [45, `Can't be overcome 45 characters`],
            required: [true, 'Brand is required']
        },
        description:{
            type: String,
            maxLength: [100, `Can't be overcome 100 characters`],
            required: [true, 'Description is required']
        },
        price:{
            type: Number,
            required: [true, 'Price is required']
        },
        stock:{
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        soldCount:{//No es requerido
            type: Number,
            min: 0,
            default: 0
        },
        SKU: {
            type: String,
            required: [true, 'SKU is required'],
            minLength: [5, `Must have at least 5 characters`],
            maxLength: [15, `Can't be overcome 15 characters`],
            unique: true
        },
        status: {
            type: String,
            required: [true, 'Status is required'],
            uppercase: true,
            enum: ['AVAILABLE', 'NOTAVAILABLE'],
            default: 'AVAILABLE'
        },
        category:{
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required']
        }
    },
    {
        versionKey: false,
        timestamps: true
    }

)

export default model('Product', productSchema)