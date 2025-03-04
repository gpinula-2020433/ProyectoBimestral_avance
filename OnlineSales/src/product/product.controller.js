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
        //El campo category guarda el ID de la categoria, por la relacion
        const category = await Category.findById(data.category)
        if(!category){
            res.send(
                {
                    success: false,
                    message: 'La categoria no existe'
                }
            )
        }
        //Fijo lo activa porque ya hay un producto registrado de esa categoria
        if(category.status === 'INACTIVE'){
            category.status = 'ACTIVE'
            await category.save()
        }
        //Esto es lo que se revisa, si es que hay productos
        if(data.stock <= 0){
            data.status = 'NOTAVAILABLE'
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

        //Esto es lo que se revisa, si es que hay productos
        if(data.stock <= 0){
            data.status = 'NOTAVAILABLE'
        }

        if(data.stock > 0){
            data.status = 'AVAILABLE'
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

        const {category} = await Product.findById(id)
        if(!category){
            return res.send(
                {
                    success: false,
                    message: 'Product not found'
                }
            )
        }

        let deletedProduct = await Product.findByIdAndDelete(id)
        if(!deletedProduct) 
            return res.status(404).send(
                {
                    success: false,
                    message: 'Product not founded'
                }
            )
        let confirmCategoriaDesactived = ''
        
        //Encontrar dentro de Productos si hay otro con esa categoria
        const revisarCategoria = await Product.find({category})
        if(revisarCategoria.length === 0){
            const categoriaADesactivar = await Category.findById(category)
            if(categoriaADesactivar){
                categoriaADesactivar.status = 'INACTIVE'
                categoriaADesactivar.save()
                confirmCategoriaDesactived = ` | The category | ${categoriaADesactivar.name} | has been set to INACTIVE`
            }
        }
        return res.send(
            {
                success: true,
                message: 'Deleted succesfully!!!' + confirmCategoriaDesactived
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

// Buscar productos por nombre con filtro
export const searchProductsByName = async (req, res) => {
    const { name, orderByName } = req.query
    try {
        const filters = {}

        //Si se proporciona un nombre, buscar con coincidencia parcial (insensible a mayúsculas)
        //$regex para que busque algo parecido y options i para que no se sensible a mayuscula
        if (name) {
            filters.name = { $regex: name, $options: 'i' } 
        }
        let productosEncontrados = Product.find(filters)
            .limit(20)
            .populate('category', 'name -_id')

        //Ordenar por nombre (ascendente o descendente)
        if (orderByName) {
            const ordenados = (orderByName === 'asc' ? 1 : -1)
            //Hace que se ordene en base al nombre
            productosEncontrados = productosEncontrados.sort({ name: ordenados })
        }

        const products = await productosEncontrados
        if (products.length === 0) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'There are no products'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Products found:',
                total: products.length,
                products
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

// Obtener productos filtrados por categoría
export const getProductsByCategory = async (req, res) => {
    const { categoryId } = req.params
    const { orderByName } = req.query

    try {
        const filters = { category: categoryId }

        let productsQuery = Product.find(filters)
            .limit(20)
            .populate('category', 'name -_id')

        // Ordenar productos por nombre si se especifica
        if (orderByName) {
            const sortOrder = (orderByName === 'asc' ? 1 : -1)
            productsQuery = productsQuery.sort({ name: sortOrder })
        }

        const products = await productsQuery
        if (products.length === 0) {
            return res.status(404).send(
                {
                    success: false,
                    message: 'No products found for this category'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Products found for the category:',
                total: products.length,
                products
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
