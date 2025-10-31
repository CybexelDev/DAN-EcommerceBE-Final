const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    head:{
        type: String,
        required: true,
    },
    tittle:{
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
     image: {
        type: [String],
        required: false,
    },
});

module.exports = mongoose.model("Blog", blogSchema);