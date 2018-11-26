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

var passwordValidator = function(password, cb){
        var regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        if(!password.match(regex)){
            return cb(null, false)
        }
        return cb(null, true);
    }

UserSchema.plugin(passportLocalMongoose, {
    usernameField: "email",
    errorMessages: {
        IncorrectPasswordError: "Password incorrect",
        IncorrectUsernameError: "There is no account registered with that email",
        UserExistsError: "A user with the given email is already registered"
    }
});
module.exports = mongoose.model("User", UserSchema);