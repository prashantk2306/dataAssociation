const jwt = require("jsonwebtoken")
const userModel = require(`../models/user.model`)

const isLoggedIn = async (req,res,next)=>{
    const token = req.cookies.token;
    if(token){
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        // console.log(decoded)
        
        const user = await userModel.findById(decoded.id)
        if(user){
            return res.redirect("/profile")
        }
    }
    next()
}

module.exports = isLoggedIn