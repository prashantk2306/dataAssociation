const mongoose = require("mongoose")

async function connectDb(){
    await mongoose.connect("mongodb://0.0.0.0/dataAssociation")
    console.log("connected DB");
    
}
connectDb()
module.exports = mongoose.connection