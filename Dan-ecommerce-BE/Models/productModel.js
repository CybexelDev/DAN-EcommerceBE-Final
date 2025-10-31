const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    brandName: String,
    images: [String],
    productName: String,
    subTitle: String,
    starRating: Number,
    rate: Number,
    quantity: Number,
    description: String,
    category: { type: String, required: true },
    categoryId: {type: String, required: true},
    subCategory: { type: String, required: false },
    subCategoryId: {type: String, required: false},
    discount: { type: Number, default: 0, min: 0, max: 100 },
    date: { type: Date, default: Date.now }

})

// Virtual field: calculates discounted price
productSchema.virtual("discountedRate").get(function () {
  if (!this.discount || this.discount === 0) return this.rate;
  return this.rate - (this.rate * this.discount / 100);
});

// Ensure virtuals are included in JSON responses
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });


module.exports = mongoose.model('Product', productSchema);