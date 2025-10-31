var express = require('express');
var router = express.Router();
const { addUserData,
    getUsers,
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
    getCategoryPopularProduct
} = require('../Controllers/userController')

// router.post('/addUser', addUserData)
router.get('/getUser', getUsers)
router.get('/getProduct', getProduct)
router.get('/getSingleProduct', getSingleProduct)
router.get('/getcategory', getcategory)
router.get('/getPopular', getPopularProduct)
router.get('/getBlogs', getBlogs);
router.get('/getCategoryProduct', getCategoryProduct)
router.post("/addCart", addToCart);
router.get("/getCart", getCart);
router.post("/addAddress", addAddress);
router.get("/getAddresses", getAddresses);
router.post("/deleteAddress", deleteAddress);
router.get("/getRelatedProduct", getRelatedProduct);
router.get("/search", getSearch);
router.get("/filtering", getFilter);
router.delete("/removeCart", removeFromCart);
router.put("/cartUpdateQty", updateCartQuantity);
router.post('/applyVoucher', applyVoucher);
router.get('/getTestimonials', getTestimonials);
router.get('/header', getHeader);
router.get('/getBrand', getBrand);
router.get("/summary/:userId", getCartSummary);
router.post('/create-checkout-session', createCheckoutSession)
router.post('/PaymentSuccess', handlePaymentSuccess);
router.get('/getUserOrder/:userId', getUserOrders);
router.get('/getCategoryPopularProduct', getCategoryPopularProduct);


module.exports = router;