const User = require("../models/usersModel");
const { use } = require("../routes/userRoute");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Sharp = require("sharp");
const path = require("path");
const Orders = require('../models/ordersModel');
const Refundreqests = require("../models/refundReqModel")
const moment = require("moment")


// --------Admin-login-------
const login = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message);
    }
}

//--Admin-Login-verification-----
const verifyLogin = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL.trim();
        const adminPass = process.env.ADMIN_PASSWORD.trim();

        if (req.body.email === adminEmail && req.body.password === adminPass) {
            req.session.admin = true

            res.redirect('/admin/dashboard')
        } else {
            res.render('login', { message: "Invalid email or password" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect(`/admin`);
    } catch (error) {
        console.log(error.message);
    }
}

// --------Products------
const products = async (req, res) => {
    try {
        const products = await Products.find({}).populate('category');
        res.render('products', { products: products ,currentPath:"/admin/products"});
    } catch (error) {
        console.log(error.message);
    }
}

// --------Users-------
const users = async (req, res) => {
    try {

        const userData = await User.find({})

        res.render('users', { user: userData,currentPath:"/admin/users"});

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
        console.log(req.body);
        // Resize the uploaded images using sharp
        const resizedImages = await Promise.all(req.files.map(async (file) => {
            const imagePath = path.join(__dirname, '..', 'public', 'assets', 'productImages', 'uploadImages', file.filename);
            const resizedImagePath = path.join(__dirname, '..', 'public', 'assets', 'productImages', 'croppedImages', file.filename);

            await Sharp(imagePath)
                .resize({ width: 600, height: 600 })
                .toFile(resizedImagePath);

            return file.filename;
        }));

        const category = await Category.findOne({ categoryName: req.body.category });

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
            category: category._id,
            productImages: resizedImages,
        });

        const productData = await product.save()
        console.log(productData);

        if (productData) {
            res.redirect('/admin/products')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}

//----Render-categry-page----
const category = async (req, res) => {
    try {
        const categoryName = await Category.find({})
        res.render('category', { category: categoryName ,currentPath:"/admin/category"})
    } catch (error) {
        console.log(error.message);
    }
}

// ------Insert-Category-----
const insertCategory = async (req, res) => {
    try {

        const { categoryName } = req.body;
        const categoryCheck = await Category.findOne({ categoryName: categoryName });
        if (categoryCheck) {
            const categoryName = await Category.find({})
            return res.render('category', { message: 'Category exist', category: categoryName });
        }

        const category = new Category({
            categoryName: req.body.categoryName
        })
        await category.save();
        const categorys = await Category.find({})
        return res.render('category', { message: 'Category added', category: categorys });

    } catch (error) {
        console.log(error.message);
    }
}

// ------Edit-Category--------
const editCategory = async (req, res) => {
    try {
        const editCatName = req.body.editedCategoryName;
        const categoryId = req.body.categoryId;
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

// ---------Edit-Products------------
const editProduct = async (req, res) => {
    try {

        const productId = req.params.productId;
        const product = await Products.findOne({ _id: productId });
        const categoryName = await Category.find({});

        res.render('editProduct', { product: product, category: categoryName, currentPath:"/admin/editCategory"});
    } catch (error) {
        console.log(error.message);
    }
}

// -------Insert edited product-------
const inserEditedProduct = async (req, res) => {
    try {
        const productId = req.body.productId;
        const files = req.files;

        // Extract the image file names from req.files
        const image1 = files['image1'] ? files['image1'][0].filename : null;
        const image2 = files['image2'] ? files['image2'][0].filename : null;
        const image3 = files['image3'] ? files['image3'][0].filename : null;
        const image4 = files['image4'] ? files['image4'][0].filename : null;

        // Create an object with the fields to update
        const updateFields = {
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
        };

        // Add image fields to the updateFields object if they are provided
        if (image1) updateFields['productImages.0'] = image1;
        if (image2) updateFields['productImages.1'] = image2;
        if (image3) updateFields['productImages.2'] = image3;
        if (image4) updateFields['productImages.3'] = image4;

        // Use the updateFields object to update the product
        const product = await Products.findByIdAndUpdate(productId, updateFields, { new: true });

        console.log(product);

        if (product) {
            res.json({ status: "success" })
        }

        return res.status(404).json({ status: 'error' });

    } catch (error) {
        console.error(error.message);
    }
};



// --------Show-products-------
const showProduct = async (req, res) => {
    try {
        console.log("show");
        const productId = req.body.productId;
        const product = await Products.findByIdAndUpdate(productId, { isShow: 0 }, { new: true });

        if (product.isShow == 1) {
            return res.status(404).json({ status: 'error' });
        }
        res.json({ product: product.isShow });

    } catch (error) {
        console.log(error.message);
    }
};


// --------Hide-products-------
const hideProduct = async (req, res) => {
    try {
        console.log("hide");
        const productId = req.body.productId;
        const product = await Products.findByIdAndUpdate(productId, { isShow: 1 }, { new: true });

        if (product.isShow != 1) {
            return res.status(404).json({ status: 'error' });
        }
        res.json({ product: product.isShow });

    } catch (error) {
        console.log(error.message);
    }
};

const userOrders = async (req, res) => {
    try {
        const orders = await Orders.find({}).sort({ createdAt: -1 });
        const refundRequests = await Refundreqests.find({})
        res.render('orders', { orders: orders, refundRequests: refundRequests ,currentPath:"/admin/orders"});
    } catch (error) {
        console.log(error.message);
    }

}
const changeStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId
        const productId = req.body.productId;
        const status = req.body.status;
        const statusChanged = await Orders.findOneAndUpdate(
            {
                _id: orderId,
                'orderedProducts.productId': productId,
            },
            {
                $set: {
                    'orderedProducts.$.status': status,
                    status: status,
                },
            },
            { new: true }
        );

        if (statusChanged) {
            res.json({ success: true, message: 'Order status changed.' });
        } else {
            res.json({ success: false, message: 'Something went wrong.' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const requestAction = async (req, res) => {
    try {
        console.log(req.body);
        const productId = req.body.productId;
        const orderId = req.body.orderId;
        const deleteRequest = await Refundreqests.findOneAndDelete({
            orderId: orderId,
            productId: productId
        });

        if (req.action === "decline") {
            await Orders.findOneAndUpdate(
                {
                    _id: orderId,
                    'orderedProducts.productId': productId,
                },
                {
                    $set: {
                        'orderedProducts.$.status': "Delivered",
                        status: "Delivered",
                    },
                },
                { new: true }
            );
            return
        }

        let requestAmount = parseFloat(req.body.requestAmount);

        const order = await Orders.findById(orderId);
        if (order.couponOff) {
             var minPurcahaseAmount = order.couponMinPurchase
             var couponOff = order.couponOff
             var discoutAmount = requestAmount - (requestAmount / couponOff)
        }


        await Orders.findOneAndUpdate(
            {
                _id: orderId,
                'orderedProducts.productId': productId,
            },
            {
                $set: {
                    'orderedProducts.$.status': "Refunded",
                    status: "Redunded",
                },
            },
            { new: true }
        );

        const newTransactionHistory = {
            type: "Order refund",
            amount: discoutAmount ? discoutAmount : requestAmount,
            direction: 'Recieved',
            transactionDate: Date.now()
        };

        await User.findOneAndUpdate(
            { _id: req.body.userId },
            {
                $push: {
                    'wallet.transactionHistory': newTransactionHistory
                },
                $inc: { 'wallet.balance': newTransactionHistory.amount}
            },
            { upsert: true }
        );

        if (deleteRequest) {
            res.json({ success: true })
        }
        res.json({ success: false })

    } catch (error) {
        console.log(error.message);
    }
}

const salesReport = async (req, res) => {
    try {
        res.render('salesReports');
    } catch (error) {
        console.log(error.message);
    }
}


const salesReportDataFetch = async (req, res) => {
    try {
        const start = moment(req.body.start, 'YYYY-MM-DD').startOf('day');
        const end = moment(req.body.end, 'YYYY-MM-DD').endOf('day');

        const orders = await Orders.find({
            $and: [
                { createdAt: { $gte: start.toDate(), $lte: end.toDate() } }
            ]
        });

          res.json(orders);
    
    } catch (error) {
        console.log(error.message);
    }

}




module.exports = {
    login,
    verifyLogin,
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
    editProduct,
    inserEditedProduct,
    hideProduct,
    showProduct,
    changeStatus,
    requestAction,
    userOrders,
    salesReport,
    salesReportDataFetch,
    logout

}