
const Coupon = require('../models/couponModel');

// ----------------Coupon(Admin side)---------------
const renderCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.render('coupon',{coupons});
    } catch (error) {
        console.log(error.message);
    }
}

const couponDetails = async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.file);
        
        const coupon = new Coupon({
            couponId: req.body.couponId,
            diccountPercentage: req.body.discount,
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
module.exports = {
    renderCoupon,
    couponDetails
}