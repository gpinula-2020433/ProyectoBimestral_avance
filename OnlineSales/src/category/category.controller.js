import Category from './category.model.js'
import Publication from '../publication/publication.model.js'

//Función para registrar un category
export const save = async(req, res) => {
    const data = req.body
    try {

        //Si da false es porque no existe y lo guarda directamente
        if(await Category.findOne({name: data.name})){
            return res.send(
                {
                    success: false,
                    message: `The category | ${data.name} | already exists`
                }
            )
        }
        const categoriaExistente = await Category.findOne(
            {description: data.description}
        )
        if(categoriaExistente){
            return res.send(
                {
                    success: false,
                    message: `The category | ${categoriaExistente.name} | already has that description`
                }
            )
        }
        
        const category = new Category(data)
        await category.save()
        return res.send(
            {
                success: true,
                message: `${category.name} saved successfully, . Status: ${category.status}`,
                category
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
export const getAllC = async(req, res)=>{
    const { limit, skip } = req.query
    try{
        const categorys = await Category.find()
            .skip(skip)
            .limit(limit)

        if(categorys.length === 0){
            return res.status(404).send(
                {
                    success: false,
                    message: 'Categorys not found'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Categorys found:',
                total: categorys.length + ' categories',
                categorys
            }
        )
 
    }catch(err){
        console.error(err)
        return res.status(500).send(
            {
                success: false,
                message: 'General error when adding category',
                err
            }
        )
    }
}


export const getCategory = async(req, res)=>{
    try {
        let {id} = req.params
        let category = await Category.findById(id)
        if(!category)
        return res.status(404).send(
            {
                success: false,
                message: 'Category not found'
            }
        )
        return res.send(
            {
                success: true,
                message: 'Category found',
                category
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

export const updateCategory = async(req, res)=>{
    try {
        const { id } = req.params
        const data = req.body
        
        //Si da false es porque no existe y lo actualiza directamente
        if(await Category.findOne({name: data.name})){
            return res.send(
                {
                    success: false,
                    message: `The category | ${data.name} | already exists`
                }
            )
        }
        const categoriaExistente = await Category.findOne(
            {description: data.description}
        )
        if(categoriaExistente){
            return res.send(
                {
                    success: false,
                    message: `The category | ${categoriaExistente.name} | already has that description`
                }
            )
        }

        const update = await Category.findByIdAndUpdate(
            id,
            data,
            {new: true}
        )

        if(!update) 
        return res.status(404).send(
            {
                success: false,
                message: 'Category not found'
            }
        )
        return res.send(
            {
                success:true,
                message: 'Category updated',
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

export const deleteCategory = async(req, res)=>{
    try {
        let {id} = req.params
        let category = await Category.findById(id)
        
        if(!category) 
        return res.status(404).send(
            {
                success: false,
                message: 'Category not founded'
            }
        )

        if(category.name === 'Default') 
        return res.status(400).send(
            {
                success: false,
                message: `Can't delete default category`,
            }
        )
        
        //En dado caso no es el default, que se elimine y pase las publicaciones al default
        let defaultCategory = await Category.findOne(
            {name: 'Default' }
        )

        // Reasignar publicaciones a la categoría "Default"
        await Publication.updateMany(
            { category: id }, 
            { category: defaultCategory._id }
        )

        // Ahora eliminamos la categoría
        await Category.findByIdAndDelete(id)

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

//Para la categoria por defecto
export const addDefaultCategory = async()=>{
    try {
        //Verificamos si no esta creada
        const categoryExists = await Category.findOne(
            {
                name:'Default'
            }
        )
        //Si no existe que la cree
        if(!categoryExists){
            let category = new Category(
                {
                    name: 'Default Category',
                    description: 'Default category for products',
                    status: true
                }
            )
            await category.save()
        }
    } catch (err) {
        console.error('Error creating default category', err)
    }
}