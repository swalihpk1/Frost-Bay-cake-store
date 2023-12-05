const User = require("../models/usersModel");
const { use } = require("../routes/userRoute");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");




// -------Dashboards------
const dashboard = async (req, res) => {
    try {

        res.render('dashboard');

    } catch (error) {
        console.log(error.message);
    }
}

// --------Products-------
const products = async (req, res) => {
    try {

        const products = await Products.find({})
        // console.log("Products"+products);
        res.render('products', { products: products });

    } catch (error) {
        console.log(error.message);
    }
}

// --------Users-------
const users = async (req, res) => {
    try {

        const userData = await User.find({})

        res.render('users', { user: userData });

    } catch (error) {
        console.log(error.message);
    }
};

// ------Block-User------
const blockUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        const blockedUser = await User.findByIdAndUpdate(userId, { isBlocked: 1 }, { new: true });

        if (blockedUser.isBlocked != 1) {
            return res.status(404).json({ status: 'error' });
        }
        res.json({ isBlocked: blockedUser.isBlocked });

    } catch (error) {
        console.log(error.message);
    }
};


// ------Unblock-User------
const UnBlockUser = async (req, res) => {
    try {

        const userId = req.body.userId;
        const UnBlockedUser = await User.findByIdAndUpdate(userId, { isBlocked: 0 }, { new: true });

        console.log(UnBlockedUser.isBlocked);
        if (UnBlockedUser.isBlocked != 0) {
            return res.status(404).json({ status: 'error' });
        }

        res.json({ isUnBlocked: UnBlockedUser.isBlocked });

    } catch (error) {
        console.log(error.message);
    }
};

// -------Render-Add-product-page------
const addProduct = async (req, res) => {
    try {

        const categoryName = await Category.find({})
        res.render('addProduct', { category: categoryName });

    } catch (error) {
        console.log(error.message);
    }
}

// -------Get-and-Store-all-products-in-DB-------
const insertProduct = async (req, res) => {
    try {

        const product = new Products({
            productName: req.body.productName,
            weights: req.body.weight.map(weightValue => ({ value: weightValue, selected: true })),
            length: req.body.length,
            base: req.body.base,
            height: req.body.height,
            incredients: req.body.incredients,
            description: req.body.description,
            price: parseFloat(req.body.price),
            totalQuantity: req.body.quantity,
            category: req.body.category,
            productImages: req.files.map(file => file.filename)
        });

        const productData = await product.save()
        console.log(productData);

        if (productData) {
            res.redirect('/admin/products')
        }


    } catch (error) {
        console.log(error.message);
    }
}

//----Render-categry-page----
const category = async (req, res) => {
    try {
        const categoryName = await Category.find({})
        res.render('category', { category: categoryName })
    } catch (error) {
        console.log(error.message);
    }
}

// ------Insert-Category-----
const insertCategory = async (req, res) => {
    try {
        //    console.log(req.body);
        const category = new Category({
            categoryName: req.body.categoryName
        })
        await category.save();

        res.redirect('/admin/category');

    } catch (error) {
        console.log(error.message);
    }
}

// ------Edit-Category--------
const editCategory = async (req, res) => {
    try {
        const editCatName = req.body.editedCategoryName;
        const categoryId = req.body.categoryId;
        console.log(editCatName);
        console.log(categoryId);
        await Category.findByIdAndUpdate(categoryId, { categoryName: editCatName }, { new: true });

        res.json({ status: "success" })

    } catch (error) {
        console.log(error.message);
    }
}

// ------List-Category------
const listCatogory = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findByIdAndUpdate(categoryId, { isListed: 0 }, { new: true });
        if (category.isListed == 1) {
            return res.status(404).json({ status: 'error' });
        }
        res.json({ category: category.isListed });

    } catch (error) {
        console.log(error.message);
    }
};

// ------Unlist-Category------
const UnListCatogory = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findByIdAndUpdate(categoryId, { isListed: 1 }, { new: true });

        if (category.isListed != 1) {
            return res.status(404).json({ status: 'error' });
        }
        res.json({ category: category.isListed });

    } catch (error) {
        console.log(error.message);
    }
};

// // -------Upload-Product-Image------- 
// const uploadProductImage = async (req,res)=>{
//     try {
//         console.log("vann");
//         const image = req.files;
//         console.log(image);
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// ---------Edit-Products------------
const editProduct = async (req, res) => {
    try {

        const productId = req.params.productId;
        const product = await Products.findOne({ _id: productId });
        const categoryName = await Category.find({});

        res.render('editProduct', { product: product, category: categoryName });
    } catch (error) {
        console.log(error.message);
    }
}

// -------Insert edited product-------
const inserEditedProduct = async (req, res) => {
    try {

        const productId = req.body.productId;
        const product = await Products.findByIdAndUpdate(productId,{
            productName: req.body.productName,
            weights: req.body.weight.map(weightValue => ({ value: weightValue, selected: true })),
            length: req.body.length,
            base: req.body.base,
            height: req.body.height,
            incredients: req.body.incredients,
            description: req.body.description,
            price: parseFloat(req.body.price),
            totalQuantity: req.body.quantity,
            category: req.body.category,
        })
        const editedProduct = await product.save()
        console.log(editedProduct);

        if(editedProduct){
            res.redirect('/admin/products')
        }


            await Products.findByIdAndUpdate()


    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    dashboard,
    products,
    users,
    blockUser,
    UnBlockUser,
    addProduct,
    insertProduct,
    category,
    insertCategory,
    editCategory,
    listCatogory,
    UnListCatogory,
    // uploadProductImage,
    editProduct,
    inserEditedProduct

}