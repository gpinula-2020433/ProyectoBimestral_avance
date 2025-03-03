import { Schema, model } from "mongoose";

const categorySchema = Schema(
    {
        name: {
            type: String,
            maxLength: [50, `Can't be overcome 50 characters`],
            required: [true, 'Name is required']
        },
        description: {
            type: String,
            maxLength: [70, `Can't be overcome 70 characters`],
            required: [true, 'Description is required']
        },
        status: {
            type: String,
            required: [true, 'Status is required'],
            uppercase: true,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'INACTIVE'
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)
export default model('Category', categorySchema)