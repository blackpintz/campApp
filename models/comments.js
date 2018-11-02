var mongoose = require("mongoose");

// Set up how the comments will look like
var commentSchema = mongoose.Schema ({
    author: 
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String
        },
    text: String,
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Comment", commentSchema);

