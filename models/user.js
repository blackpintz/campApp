var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")
    

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    displayname: String,
    firstName: String,
    lastName: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: String,
    Bio: String,
    isAdmin: {type: Boolean, default: false}
    
});


UserSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
    errorMessages: {
        IncorrectPasswordError: "Password incorrect",
        IncorrectUsernameError: "There is no account registered with that email",
        UserExistsError: "A user with the given email is already registered"
    }
});
module.exports = mongoose.model("User", UserSchema);