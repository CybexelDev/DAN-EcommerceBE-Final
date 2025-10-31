const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
     image: {
        type: [String],
        required: true,
    },
    tittle:{
        type: String,
        required: false,
    }
});

module.exports = mongoose.model("brand", brandSchema);