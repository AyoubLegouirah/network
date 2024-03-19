const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { SignUpErrors, SignInErrors } = require("../utils/errors.utils");

// Create token
const MaxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: MaxAge,
  });
};

// Authentification
module.exports.signUp = async (req, res) => {
  console.log(req.body);
  const { pseudo, email, password } = req.body;

  try {
    const user = await UserModel.create({ pseudo, email, password });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = SignUpErrors(err);
    res.status(200).send({ errors });
  }
};

// Login
module.exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await UserModel.login(email, password);
      const token = createToken(user._id);
    //   Pour afficher le cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: MaxAge
      });
      res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = SignInErrors(err);
        res.status(200).json({ errors });
    }
  };
  

// Logout
module.exports.logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
}

// Logout avec ChatGPT
// module.exports.logout = (req, res) => {
//     res.cookie("jwt", "", { maxAge: 1 });
//     res.status(200).json({ message: "Logout successful" });
// }



