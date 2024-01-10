
const Coupon = require('../models/couponModel');
const { findOne } = require('../models/usersModel');

// ----------------Coupon(Admin side)---------------
const renderCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.render('coupon', { coupons, currentPath:"/admin/coupons"});
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async (req, res) => {
    try {

        const coupon = new Coupon({
            couponId: req.body.couponId,
            discountPercentage: req.body.discount,
            bgImage: req.file.filename,
            description: req.body.description,
            expiryDate: req.body.expiryDate,
            minPurcahaseAmount: req.body.minPurchaseAmount,
        })

        const newCoupon = await coupon.save();

        if (newCoupon) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editCoupon = async (req, res) => {
    try {

        console.log(req.body);
        console.log(req.file);
        const couponId = req.body.coupon_id;
        const editedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            {
                discountPercentage: req.body.discountPercentage,
                description: req.body.description,
                expiryDate: req.body.expiryDate,
                minPurcahaseAmount: req.body.minPurcahaseAmount,
            },
            { new: true }
        );

        if (req.file) {
            const editedImage = await Coupon.findByIdAndUpdate(
                couponId,
                { $set: { bgImage: req.file.filename } },
                { new: true }
            );
        }

        if (editedCoupon || editedImage) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

    } catch (error) {
        console.log(error.message);
    }

}

const activation = async (req, res) => {
    try {
        const { couponId, action } = req.body;

        if (action === 'show') {
          var activate = await Coupon.findByIdAndUpdate(couponId, { isActive: true }, { new: true });
        } else if (action === 'hide') {
            var  deactivate = await Coupon.findByIdAndUpdate(couponId, { isActive: false }, { new: true });
        } else {
            res.json({ success: false , message: "Something went wrong"});
        }

        if (activate || deactivate) {
            if (activate) {
                res.json({ success: true , message: "Coupon is activated" });
            }
            res.json({ success: true , message: "Coupon is deactivated" });
        } else {
            res.json({ success: false , message: "Something went wrong"});
        }
    } catch (error) {
        console.log(error.message);
    }
}

// ------------------------ Coupon( User-side )----------------------
const verifyCoupon = async (req, res) => {
    try {
        const couponCode = req.body.couponCode;

        const coupon = await Coupon.findOne({ couponId: couponCode });

        if (coupon) {
            res.json({ coupon, message : "Coupon is valid"});
        } else {
            res.json({ message : 'Coupon not found' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
    renderCoupon,
    addCoupon,
    editCoupon,
    activation,
    verifyCoupon
}