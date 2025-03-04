import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import mongoose from 'mongoose'

export const addToCart = async (req, res) => {
    try {
        const userId = req.user.uid // Asumimos que el usuario está autenticado
        const { productId, quantity } = req.body

        // Validar que el producto exista
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            })
        }

        // Verificar si hay stock suficiente
        if (product.stock < quantity) {
            return res.status(400).send({
                success: false,
                message: `Only ${product.stock} units available`
            })
        }

        // Convertir precio del producto a Decimal128
        const productPrice = mongoose.Types.Decimal128.fromString(product.price.toString())

        // Buscar si el usuario ya tiene un carrito
        let cart = await Cart.findOne({ user: userId })

        if (!cart) {
            // Si no tiene carrito, crear uno nuevo
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity }],
                totalPrice: mongoose.Types.Decimal128.fromString((productPrice * quantity).toString())
            })
        } else {
            // Verificar si el producto ya está en el carrito
            const existingItem = cart.items.find(item => item.product.toString() === productId)

            if (existingItem) {
                existingItem.quantity += quantity
            } else {
                cart.items.push({ product: productId, quantity })
            }

            // Convertir totalPrice a Decimal128 y actualizar
            const updatedPrice = parseFloat(cart.totalPrice.toString()) + parseFloat((productPrice * quantity).toString())
            cart.totalPrice = mongoose.Types.Decimal128.fromString(updatedPrice.toFixed(2))
        }

        // Restar el stock del producto
        product.stock -= quantity
        await product.save()
        await cart.save()

        return res.send({
            success: true,
            message: 'Product added to cart',
            cart: {
                ...cart.toObject(),
                totalPrice: cart.totalPrice.toString() // Convertir totalPrice a string para evitar problemas en la respuesta JSON
            }
        })

    } catch (err) {
        console.error(err)
        return res.status(500).send({
            success: false,
            message: 'General error',
            err
        })
    }
}
