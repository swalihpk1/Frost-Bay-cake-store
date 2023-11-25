const User = require("../models/usersModel");
const { use } = require("../routes/userRoute");



// -------Dashboards------
const dashboard = async (req, res) => {
    try {

        res.render('dashboard');

    } catch (error) {
        console.log(error.message);
    }
}

// --------Products-------
const products = async (req,res)=>{
    try {

        res.render('products');

    } catch (error) {
        console.log(error.message);
    }
}

// --------Users-------
const users = async (req,res)=>{
    try {
      
        const userData = await User.find({})

        res.render('users',{user:userData});

    } catch (error) {
        console.log(error.message);
    }
}


// ------Block-User------
const blockUser = async (req, res) => {
    try {
      const userId = req.body.userId;
      const blockedUser = await User.findByIdAndUpdate(userId, { isBlocked: 1 }, { new: true });

      if (!blockedUser) {
        return res.status(404).json({ status: 'error'});
      }

      res.json({ status: 'success'});
  
    } catch (error) {
      console.log(error.message);
    }
  };



// ------Unblock-User------
const UnBlockUser = async (req, res) => {
    try {
      const userId = req.body.userId;
      const UnBlockedUser = await User.findByIdAndUpdate(userId, { isBlocked: 0 }, { new: true });

      if (!UnBlockedUser) {
        return res.status(404).json({ status: 'error'});
      }

      res.json({ status: 'success'});
  
    } catch (error) {
      console.log(error.message);
    }
  };


module.exports ={
    dashboard,
    products,
    users,
    blockUser,
    UnBlockUser

}