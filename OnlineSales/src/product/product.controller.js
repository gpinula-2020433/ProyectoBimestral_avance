import Product from './product.model.js'
import Category from '../category/category.model.js'

//Función para registrar un product
export const save = async(req, res) => {
    const data = req.body
    try {
        const productoExistente = await Product.findOne(
            {
                description: data.description
            }
        )
        if(await Product.findOne({name: data.name})){
            return res.send(
                {
                    success: false,
                    message: `The product ${data.name} already exists`
                }
            )
        }
        if(productoExistente){
            return res.send(
                {
                    success: false,
                    message: `The product | ${productoExistente.name} | already has that description`
                }
            )
        }
        //El campo category guarda el ID de la categorya, por la relacion
        const category = await Category.findById(data.category)
        if(!category){
            res.send(
                {
                    success: false,
                    message: 'La categoria no existe'
                }
            )
        }
        if(category.status === 'INACTIVE'){
            category.status = 'ACTIVE'
            await category.save()
        }

        const product = new Product(data)
        await product.save()
        return res.send(
            {
                success: true,
                message: `${product.name} saved successfully`,
                product
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

//Obtener todos
export const getAllP = async(req, res)=>{
    const { limit, skip } = req.query
    try{
        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .populate('category','name description -_id')

        if(products.length === 0){
            return res.status(404).send(
                {
                    success: false,
                    message: 'Products not found'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Products found:',
                total: products.length + ' products',
                products
            }
        )
 
    }catch(err){
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


export const getProduct = async(req, res)=>{
    try {
        let {id} = req.params
        let product = await Product.findById(id)
        if(!product)
        return res.status(404).send(
            {
                success: false,
                message: 'Product not found'
            }
        )
        return res.send(
            {
                success: true,
                message: 'Product found',
                product
            }
        )
    } catch (err) {
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}


export const updateProduct = async(req, res)=>{
    try {
        const { id } = req.params
        const data = req.body

        const productoExistente = await Product.findOne(
            {
                description: data.description
            }
        )
        if(await Product.findOne({name: data.name})){
            return res.send(
                {
                    success: false,
                    message: `The product ${data.name} already exists`
                }
            )
        }
        if(productoExistente){
            return res.send(
                {
                    success: false,
                    message: `The product | ${productoExistente.name} | already has that description`
                }
            )
        }

        const update = await Product.findByIdAndUpdate(
            id,
            data,
            {new: true}
        )

        if(!update) 
        return res.status(404).send(
            {
                success: false,
                message: 'Product not found'
            }
        )
        return res.send(
            {
                success:true,
                message: 'Product updated',
                user: update
            }
        )
    } catch (err) {
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}

export const deleteProduct = async(req, res)=>{
    try {
        let {id} = req.params
        let product = await Product.findByIdAndDelete(id)
        if(!product) 
            return res.status(404).send(
                {
                    success: false,
                    message: 'Product not founded'
                }
            )
        return res.send(
            {
                success: true,
                message: 'Deleted succesfully!!!'
            }
        )
    } catch (err) {
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}

//Productos fuera de stock
export const outOfStockProducts = async(req, res)=>{
    try {
        const products = await Product.find({stock:0})
            .populate('category', 'name -_id')
        //Verificamos si lo regreso vacio
        if(products.length ===0){
            return res.send(
                {
                    success:false,
                    message: 'No out of stock products found'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Out of Stock products found',
                total: products.length + ' products',
                products
            }
        )
    } catch (err) {
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}

//Productos mas vendidos
export const bestSellingProducts = async(req, res)=>{
    try {
        const products = await Product.find().sort({soldCount: -1})
            .populate('category', 'name -_id')
        if(products.length===0){
            return res.send(
                {
                    success: false,
                    message: 'Productos not found'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Best selling products found',
                total: products.length + ' products',
                products
            }
        )
    } catch (err) {
        console.error('General error', err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error',
                err
            }
        )
    }
}