const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model"); // Make sure the path is correct


const authUser = async (req, res, next) => {
  try {
    // 1. Check if token exists in cookies
    const token = req.cookies.token;
    if (!token) {
      return res.redirect("/login"); // Redirect if no token is found
    }

    // 2. Verify the token
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    
    // 3. Find the user from the decoded ID
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.redirect("/login"); // Redirect if user not found
    }

    // 4. Attach user info to the request object
    req.user = user;

    // 5. Proceed to the next middleware or route handler
    next();

  } catch (err) {
    console.log(err);
    return res.redirect("/login"); // Redirect if any error occurs
  }
};

module.exports = authUser;
