import { Schema, model } from "mongoose";

const facturaSchema = Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
        NIT: {
            type: String,
            required: [true, 'NIT is required']
        },
        name: {
            type: String,
            required: [true, 'Name is required']
        },
        items: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Schema.Types.Decimal128,
                required: true
            }
        }],
        totalPrice: {
            type: Schema.Types.Decimal128,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['COMPLETED', 'CANCELLED'],
            default: 'COMPLETED'
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
);

export default model('Factura', facturaSchema);
