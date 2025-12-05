var express = require('express');
var router = express.Router();
const { addUserData,
    getProduct,
    getcategory,
    getPopularProduct,
    getBlogs,
    getCategoryProduct,
    addToCart,
    getCart,
    addAddress,
    getAddresses,
    getRelatedProduct,
    getSearch,
    getFilter,
    removeFromCart,
    updateCartQuantity,
    applyVoucher,
    getTestimonials,
    getSingleProduct,
    getHeader,
    getBrand,
    getCartSummary,
    deleteAddress,
    createCheckoutSession,
    handlePaymentSuccess,
    getUserOrders,
    getCategoryPopularProduct,
    getProductsBySubCategory,
    getCategorylatestProduct,
    getCategoryHighToLowRateProduct,
    getCategoryLowToHighRateProduct
} = require('../Controllers/userController');
const auth = require('../Middleware/auth');

router.get('/getProduct', getProduct)
router.get('/getSingleProduct', getSingleProduct)
router.get('/getcategory', getcategory)
router.get('/getPopular', getPopularProduct)
router.get('/getBlogs', getBlogs);
router.get('/getCategoryProduct', getCategoryProduct)
router.post("/addCart",auth, addToCart);
router.get("/getCart", auth, getCart);
router.post("/addAddress",auth, addAddress);
router.get("/getAddresses",auth, getAddresses);
router.post("/deleteAddress",auth, deleteAddress);
router.get("/getRelatedProduct", getRelatedProduct);
router.get("/search", getSearch);
router.get("/filtering", getFilter);
router.delete("/removeCart",auth, removeFromCart);
router.put("/cartUpdateQty",auth, updateCartQuantity);
router.post('/applyVoucher',auth, applyVoucher);
router.get('/getTestimonials', getTestimonials);
router.get('/header', getHeader);
router.get('/getBrand', getBrand);
router.get("/summary/:userId",auth, getCartSummary);
router.post('/create-checkout-session',auth, createCheckoutSession)
router.post('/PaymentSuccess',auth, handlePaymentSuccess);
router.get('/getUserOrder/:userId',auth, getUserOrders);
router.get('/getCategoryPopularProduct', getCategoryPopularProduct);
router.get('/getSubcategory/:subCategoryId', getProductsBySubCategory);
router.get('/getCategoryLatestProduct',   getCategorylatestProduct);
router.get('/getCategoryHighToLowRateProduct',   getCategoryHighToLowRateProduct);
router.get('/getCategoryLowToHighRateProduct',   getCategoryLowToHighRateProduct);

module.exports = router;