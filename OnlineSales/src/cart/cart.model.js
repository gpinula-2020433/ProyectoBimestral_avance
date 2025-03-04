import { Schema, model } from "mongoose";

const cartSchema = Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
        items:[
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'Product is required']
                },
                quantity:{
                    type: Number,
                    required: [true, 'Quantity is required'],
                    min: 1
                }
            }
        ],
        totalPrice:{
            type: Schema.Types.Decimal128,
            default: 0.00
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)
export default model('Cart', cartSchema)