

const validateForm = async (req, res, next) => {
    try {
      const { signupEmail, name, phone,signupPassword,confirmPassword} = req.body;
      let regexEmail = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
      let regexName = /\d/;
      let regexPassword = /^(?=.*\d)(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;
      const trimmedName = name.trim(); // Trim the name

      if (signupPassword !== confirmPassword){
        return res.render('signup-&-login', { message: "Passwords not match", color: "danger" });
      }

      if (regexName.test(trimmedName)) {
        return res.render('signup-&-login', { message: "Name shouldn't contain digits", color: "danger" });
      }

      if (regexName.test(trimmedName)) {
        return res.render('signup-&-login', { message: "Name shouldn't contain digits", color: "danger" });
      }
  
      if (trimmedName.length <= 5) {
        return res.render('signup-&-login', { message: "Minimum 5 characters in name", color: "danger" });
      }
  
      if (!regexEmail.test(signupEmail)) {
        return res.render('signup-&-login', { message: "Invalid email address", color: "danger" });
      }
  
      if (phone.length != 10) {
        return res.render('signup-&-login', { message: "Phone number should be 10 digits", color: "danger" });
      }

      if (!regexPassword.test(confirmPassword)) {
        return res.render('signup-&-login', { message: "Password must contain at least 6 characters, atleast one uppercase, and one digit", color: "danger" });
      }

      next();
    } catch (error) {
      console.log(error);
    }
  };
module.exports={
    validateForm
}