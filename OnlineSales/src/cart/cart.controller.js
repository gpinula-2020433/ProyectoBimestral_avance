import Cart from './cart.model.js'
import Product from '../product/product.model.js'
import mongoose from 'mongoose'


export const addToCart = async (req, res) => {
    try {
        const userId = req.user.uid; // Asumimos que el usuario está autenticado
        const { productId, quantity } = req.body;

        // Validar que el producto exista
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            });
        }

        // Verificar si hay stock suficiente
        if (product.stock < quantity) {
            return res.status(400).send({
                success: false,
                message: `Only ${product.stock} units available`
            });
        }

        // Convertir precio del producto a Decimal128
        const productPrice = mongoose.Types.Decimal128.fromString(product.price.toString());

        // Buscar si el usuario ya tiene un carrito
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Si no tiene carrito, crear uno nuevo
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity: parseInt(quantity) }],
                totalPrice: mongoose.Types.Decimal128.fromString((productPrice * quantity).toString())
            });
        } else {
            // Verificar si el producto ya está en el carrito
            const existingItem = cart.items.find(item => item.product.toString() === productId);

            if (existingItem) {
                existingItem.quantity = existingItem.quantity + parseInt(quantity);
            } else {
                cart.items.push({ product: productId, quantity });
            }

            // Convertir totalPrice a Decimal128 y actualizar
            const updatedPrice = parseFloat(cart.totalPrice.toString()) + parseFloat((productPrice * quantity).toString());
            cart.totalPrice = mongoose.Types.Decimal128.fromString(updatedPrice.toFixed(2));
        }

        // Restar el stock del producto
        product.stock -= quantity;
        await product.save();
        await cart.save();

        // Usar populate para agregar los datos del producto al carrito
        await cart.populate('items.product', 'name price'); // Esto carga los campos 'name' y 'price' del producto

        return res.send({
            success: true,
            message: 'Product added to cart',
            cart: {
                ...cart.toObject(),
                totalPrice: cart.totalPrice.toString() // Convertir totalPrice a string para evitar problemas en la respuesta JSON
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({
            success: false,
            message: 'General error',
            err
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user.uid // Asumimos que el usuario está autenticado

        // Buscar el carrito del usuario
        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price') // Solo traer los campos necesarios

        // Verificar si el carrito existe
        if (!cart) {
            return res.status(404).send({
                success: false,
                message: 'Cart not found'
            })
        }

        // Mapear los productos en el carrito para obtener solo la información necesaria
        const cartItems = cart.items.map(item => ({
            product: {
                id: item.product._id,
                name: item.product.name, // Nombre del producto
                price: item.product.price.toString(), // Precio del producto
            },
            quantity: item.quantity, // Cantidad en el carrito
        }))

        return res.send({
            success: true,
            message: 'Cart retrieved successfully',
            cart: {
                items: cartItems,
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

//Revisar
export const updateCart = async (req, res) => {
    try {
        const userId = req.user.uid // Asumimos que el usuario está autenticado
        const { productId, newQuantity } = req.body

        // Validar que la nueva cantidad sea un número positivo
        if (newQuantity < 1) {
            return res.status(400).send({
                success: false,
                message: 'Quantity must be a positive integer'
            })
        }

        // Buscar el carrito del usuario
        let cart = await Cart.findOne({ user: userId }).populate('items.product')

        // Verificar si el carrito existe
        if (!cart) {
            return res.status(404).send({
                success: false,
                message: 'Cart not found'
            })
        }

        // Buscar el producto en el carrito
        const cartItem = cart.items.find(item => item.product._id.toString() === productId)

        // Verificar si el producto está en el carrito
        if (!cartItem) {
            return res.status(404).send({
                success: false,
                message: 'Product not found in the cart'
            })
        }

        // Obtener el producto completo de la base de datos para verificar stock
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).send({
                success: false,
                message: 'Product not found'
            })
        }

        // Si la nueva cantidad es menor que la anterior, devolver al stock las unidades eliminadas
        if (newQuantity < cartItem.quantity) {
            product.stock += (cartItem.quantity - newQuantity)
        }
        // Si la nueva cantidad es mayor que la anterior, restar las unidades adicionales del stock
        else if (newQuantity > cartItem.quantity) {
            const quantityDifference = newQuantity - cartItem.quantity
            // Verificar si hay suficiente stock
            if (product.stock < quantityDifference) {
                return res.status(400).send({
                    success: false,
                    message: `Only ${product.stock} units available`
                })
            }
            product.stock -= quantityDifference
        }

        // Actualizar la cantidad en el carrito
        cartItem.quantity = newQuantity

        // Recalcular el precio total del carrito
        let totalPrice = 0
        cart.items.forEach(item => {
            totalPrice += parseFloat(item.product.price) * item.quantity
        })
        cart.totalPrice = mongoose.Types.Decimal128.fromString(totalPrice.toFixed(2))

        // Guardar los cambios en el carrito y el producto
        await product.save()
        await cart.save()

        return res.send({
            success: true,
            message: 'Cart updated successfully',
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
