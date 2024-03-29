const User = require("../models/usersModel");
const Products = require("../models/productModel");
const Category = require("../models/categoryModel");
const Sharp = require("sharp");
const path = require("path");
const Orders = require('../models/ordersModel');
const Refundreqests = require("../models/refundReqModel")
const moment = require("moment");
const PDFDocument = require('pdfkit');
const Excel = require('exceljs');
const Offers = require("../models/offerModel");



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
       console.log('aayi');
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
        const products = await Products.find({}).populate('category').populate('offer')
        const offers = await Offers.find({ type: "Product" })
        res.render('products', { products: products, offers, currentPath: "/admin/products" });
    } catch (error) {
        console.log(error.message);
    }
}

// --------Users-------
const users = async (req, res) => {
    try {

        const userData = await User.find({})

        res.render('users', { user: userData, currentPath: "/admin/users" });

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
        const categoryName = await Category.find({}).populate('offer')
        const offers = await Offers.find({ type: "Category" })
        res.render('category', { category: categoryName, offers ,currentPath: "/admin/category" })
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
         return res.redirect('/admin/category')

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

        res.render('editProduct', { product: product, category: categoryName, currentPath: "/admin/editCategory" });
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
        res.render('orders', { orders: orders, refundRequests: refundRequests, currentPath: "/admin/orders" });
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
                $inc: { 'wallet.balance': newTransactionHistory.amount }
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

const generateSalesDocuments = async (req, res) => {
    try {
        const start = new Date(req.body.start);
        const end = new Date(req.body.end);
        const docType = req.body.docType;

        const orders = await Orders.find({
            createdAt: { $gte: start, $lte: end },
        });

        if (docType === 'pdf') {
            const doc = new PDFDocument({ size: [1000, 700] });

            doc.fontSize(9).text('Sales Report', { align: 'center' });
            doc.moveDown();

            // Header row
            doc.font('Helvetica-Bold').text('No', 50, doc.y);
            doc.text('Product Name', 120, doc.y);
            doc.text('User Name', 270, doc.y);
            doc.text('Email', 420, doc.y);
            doc.text('Quantity', 560, doc.y);
            doc.text('Total Amount', 670, doc.y);
            doc.text('Purchase Date', 770, doc.y);
            doc.text('Payment Method', 870, doc.y);
            doc.moveDown();

            orders.forEach((order, index) => {
                doc.text(index + 1, 50, doc.y);
                doc.text(order.orderedProducts[0].productDetails.name, 120, doc.y);
                doc.text(order.userName, 270, doc.y);
                doc.text(order.shipAddress[0].email, 420, doc.y);
                doc.text(order.orderedProducts[0].quantity, 560, doc.y);
                doc.text(`Rs: ${order.totalAmount}`, 670, doc.y);
                doc.text(order.purchaseDate, 770, doc.y);
                doc.text(order.paymentMethod, 870, doc.y);
                doc.moveDown();
            });

            doc.pipe(res);
            doc.end();
        } else if (docType === 'excel') {

            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

            // Populate the worksheet with headers
            worksheet.addRow([
                'No',
                'Product Name',
                'User Name',
                'Email',
                'Quantity',
                'Total Amount',
                'Purchase Date',
                'Payment Method'
            ]);

            // Populate the worksheet with data from orders
            orders.forEach((order, index) => {
                worksheet.addRow([
                    index + 1,
                    order.orderedProducts[0].productDetails.name,
                    order.userName,
                    order.shipAddress[0].email,
                    order.orderedProducts[0].quantity,
                    `Rs: ${order.totalAmount}`,
                    order.purchaseDate,
                    order.paymentMethod
                ]);
            });

            // Set content type and headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="SalesReport_${start.toISOString()}_${end.toISOString()}.xlsx`);

            // Write the workbook to the response stream
            await workbook.xlsx.write(res);

            // End the response
            res.end();
        }

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


const offers = async (req, res) => {
    try {
        const offers = await Offers.find({})
        res.render('offers', { offers, currentPath: "/admin/offers" })
    } catch (error) {
        console.log(error.message);
    }
}

const addOffer = async (req, res) => {
    try {
        console.log(req.body);
        const offer = new Offers({
            offerName: req.body.offerName,
            description: req.body.description,
            offPercentage: req.body.discount,
            type: req.body.offerType
        })
        const newOffer = await offer.save();

        if (newOffer) {
            res.json({ success: true }); 
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const productApplyOffer = async (req, res) => {
    try {
        const offerId = req.body.offerId;
        const productId = req.body.offerProductId;

        const applyOffer = await Products.findOneAndUpdate(
            { _id: productId },
            { offer: offerId },
            { new: true }
        );

        if (applyOffer) {
            res.json({ success:true});
        } else {
            res.json({ success:false });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ json: 'error' });
    }
};
const removeProductOffer = async (req, res) => {
    try {
        const { productId } = req.body;

        const removeOffer = await Products.findOneAndUpdate(
            { _id: productId },
            { $unset: { offer: "" } },
            { new: true } 
        );

        console.log(removeOffer);

        if (removeOffer) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
}

const deleteOffer = async (req, res) => {
    try {
        const { offerId } = req.body
        const deleteOffer = await Offers.findOneAndDelete({ _id: offerId })
        
        if (deleteOffer) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const categoryApplyOffer = async (req, res) => {
    try {
        console.log(req.body);
        const offerId = req.body.offerId;
        const categoryId = req.body.offerCategoryId;

        const applyOffer = await Category.findOneAndUpdate(
            { _id: categoryId },
            { offer: offerId },
            { new: true }
        );

        if (applyOffer) {
            res.json({ success:true});
        } else {
            res.json({ success:false });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ json: 'error' });
    }
};

const removeCategoryOffer = async (req, res) => {
    try {
        const { categoryId } = req.body;

        const removeOffer = await Category.findOneAndUpdate(
            { _id: categoryId },
            { $unset: { offer: "" } },
            { new: true } 
        );

        console.log(removeOffer);

        if (removeOffer) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
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
    generateSalesDocuments,
    offers,
    addOffer,
    productApplyOffer,
    removeProductOffer,
    deleteOffer,
    categoryApplyOffer,
    removeCategoryOffer,
    logout

}