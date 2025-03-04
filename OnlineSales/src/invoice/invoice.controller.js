import Factura from '../invoice/invoice.model.js'
import Cart from '../cart/cart.model.js'
import Product from '../product/product.model.js'
import mongoose from 'mongoose'
import User from '../user/user.model.js'  // Importamos el modelo de usuario

export const processPurchase = async (req, res) => {
    try {
        const userId = req.user.uid  // El ID del usuario autenticado
        const { NIT } = req.body  // NIT recibido desde el cuerpo de la solicitud

        // Obtener el nombre del usuario a partir de su uid
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'User not found'
                }
            )
        }

        const name = user.name  // El nombre del usuario obtenido desde la base de datos

        // Verificar si el carrito existe
        let cart = await Cart.findOne({ user: userId })

        if (!cart) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'No cart found for this user'
                }
            )
        }

        // Crear una nueva factura
        const invoiceItems = []
        let totalPrice = 0

        // Procesar los productos del carrito
        for (let item of cart.items) {
            const product = await Product.findById(item.product)
            
            // Crear la línea de factura para este producto
            invoiceItems.push(
                {
                    product: item.product,
                    quantity: item.quantity,
                    price: product.price.toString()  // Convertimos Decimal128 a string
                }
            )

            totalPrice += parseFloat(product.price.toString()) * item.quantity

            // Actualizar el soldCount de cada producto
            product.soldCount += item.quantity
            await product.save()
        }

        // Crear la factura
        const factura = new Factura(
            {
                user: userId,
                NIT,  // NIT recibido del cuerpo de la solicitud
                name,  // Nombre obtenido de la base de datos
                items: invoiceItems,
                totalPrice: mongoose.Types.Decimal128.fromString(totalPrice.toFixed(2))
            }
        )

        await factura.save()

        // Limpiar el carrito del usuario después de la compra
        cart.items = []
        cart.totalPrice = mongoose.Types.Decimal128.fromString('0.00')
        await cart.save()

        // Convertir el totalPrice a String antes de enviar la respuesta
        factura.totalPrice = factura.totalPrice.toString()

        // Responder con la factura generada
        return res.send(
            {
                success: true,
                message: 'Purchase completed successfully',
                invoice: factura
            }
        )

    } catch (err) {
        console.error(err)
        return res.status(500).send(
            {
                success: false,
                message: 'Error processing the purchase',
                err
            }
        )
    }
}
