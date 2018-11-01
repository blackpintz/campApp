var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")
    

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: String,
    isAdmin: {type: Boolean, default: false}
    
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);