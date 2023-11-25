const validateForm = async (req, res, next) => {
    try {
      const { signupEmail, name, phone, signupPassword, confirmPassword } =  req.body;
        let regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let regexName = /\d/;
        let regexPassword = /^(?=.*\d)(?=.*[A-Z])[0-9a-zA-Z]{6,}$/;

        // Check if 'name' is present in req.body before trimming
        const trimmedName =name.trim();

        if (signupPassword !== confirmPassword) {
            return res.render('signup-&-login', { message: "Passwords not match", color: "danger" });
        }

        if (regexName.test(trimmedName)) {
            return res.render('signup-&-login', { message: "Name shouldn't contain digits", color: "danger" });
        }

        if (trimmedName.length < 4) {
            return res.render('signup-&-login', { message: "Minimum 4 characters in name", color: "danger" });
        }

        if (!regexEmail.test(signupEmail)) {
            return res.render('signup-&-login', { message: "Invalid email address", color: "danger" });
        }

        if (phone.length < 10) {
            return res.render('signup-&-login', { message: "Phone number should be 10 digits", color: "danger" });
        }

        if (!regexPassword.test(confirmPassword)) {
            return res.render('signup-&-login', { message: "Password must contain at least 6 characters, at least one uppercase, and one digit", color: "danger" });
        }

        next();
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    validateForm
};
