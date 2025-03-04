import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import mongoose from 'mongoose'

export const addToCart = async (req, res) => {
    try {
        const userId = req.user.uid
        const { productId, quantity } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'Product not found'
                }
            )
        }

        if (product.stock < quantity) {
            return res.status(400).send(
                {
                    success: false,
                    message: `Only ${product.stock} units available`
                }
            )
        }

        const productPrice = mongoose.Types.Decimal128.fromString(product.price.toString())

        let cart = await Cart.findOne({ user: userId })

        if (!cart) {
            cart = new Cart(
                {
                    user: userId,
                    items: [{ product: productId, quantity: parseInt(quantity) }],
                    totalPrice: mongoose.Types.Decimal128.fromString((productPrice * quantity).toString())
                }
            )
        } else {
            const existingItem = cart.items.find(item => item.product.toString() === productId)

            if (existingItem) {
                existingItem.quantity += parseInt(quantity)
            } else {
                cart.items.push({ product: productId, quantity })
            }

            const updatedPrice = parseFloat(cart.totalPrice.toString()) + parseFloat((productPrice * quantity).toString())
            cart.totalPrice = mongoose.Types.Decimal128.fromString(updatedPrice.toFixed(2))
        }

        product.stock -= quantity
        await product.save()
        await cart.save()

        await cart.populate('items.product', 'name price')

        return res.send(
            {
                success: true,
                message: 'Product added to cart',
                cart: {
                    ...cart.toObject(),
                    totalPrice: cart.totalPrice.toString()
                }
            }
        )

    } catch (err) {
        console.error(err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}

export const getCart = async (req, res) => {
    try {
        const userId = req.user.uid

        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price')

        if (!cart) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'Cart not found'
                }
            )
        }

        const cartItems = cart.items.map(item => (
            {
                product: {
                    id: item.product._id,
                    name: item.product.name,
                    price: item.product.price.toString(),
                },
                quantity: item.quantity,
            }
        ))

        return res.send(
            {
                success: true,
                message: 'Cart retrieved successfully',
                cart: {
                    items: cartItems,
                    totalPrice: cart.totalPrice.toString()
                }
            }
        )

    } catch (err) {
        console.error(err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}

export const updateCart = async (req, res) => {
    try {
        const userId = req.user.uid
        const { productId, newQuantity } = req.body

        if (newQuantity < 1) {
            return res.status(400).send(
                {
                    success: false,
                    message: 'Quantity must be a positive integer'
                }
            )
        }

        let cart = await Cart.findOne({ user: userId }).populate('items.product')

        if (!cart) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'Cart not found'
                }
            )
        }

        const cartItem = cart.items.find(item => item.product._id.toString() === productId)

        if (!cartItem) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'Product not found in the cart'
                }
            )
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'Product not found'
                }
            )
        }

        if (newQuantity < cartItem.quantity) {
            product.stock += (cartItem.quantity - newQuantity)
        } else if (newQuantity > cartItem.quantity) {
            const quantityDifference = newQuantity - cartItem.quantity
            if (product.stock < quantityDifference) {
                return res.status(400).send(
                    {
                        success: false,
                        message: `Only ${product.stock} units available`
                    }
                )
            }
            product.stock -= quantityDifference
        }

        cartItem.quantity = newQuantity

        let totalPrice = 0
        cart.items.forEach(item => {
            totalPrice += parseFloat(item.product.price) * item.quantity
        })
        cart.totalPrice = mongoose.Types.Decimal128.fromString(totalPrice.toFixed(2))

        await product.save()
        await cart.save()

        return res.send(
            {
                success: true,
                message: 'Cart updated successfully',
                cart: {
                    ...cart.toObject(),
                    totalPrice: cart.totalPrice.toString()
                }
            }
        )

    } catch (err) {
        console.error(err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}
