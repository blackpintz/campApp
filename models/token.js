var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")


var tokenSchema = new mongoose.Schema({
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    verificationToken: String,
    verificationExpires: Date
})    


module.exports = mongoose.model("Token", tokenSchema)