var express = require('express');
const { addProduct, addCategory, addBlogs, addHeader, addSubCategory, deleteProduct, updateProduct, deleteCategory, updateCategory, deleteHeader, deleteBlog, updateBlogs, addBrand, deleteBrand, addVoucher, addTestimonials, updateTestimonials, deleteTestimonial, getProduct, getcategory, getHeader, getBlogs, getOrders, updateOrderStatus, getTestimonials, getUsers, deleteUser, getDashboardCounts, createAdmin, loginAdmin, getSalesByDate } = require('../Controllers/adminController');
const upload = require('../Middleware/upload');
const adminAuth = require('../Middleware/adminAuth');
var router = express.Router();


router.post('/addProduct',adminAuth, upload.array('images', 5), addProduct)
router.get('/getProduct',adminAuth, getProduct)
router.post('/addCategory',adminAuth, upload.array('image', 1),  addCategory)
router.get('/getcategory',adminAuth, getcategory)
router.get('/blogs',adminAuth,getBlogs)
router.post('/addBlog',adminAuth, upload.array('image', 1),  addBlogs)
router.get('/header',adminAuth, getHeader);
router.post('/addHeader',adminAuth, upload.array('image', 1),  addHeader)
router.post('/addSubCategory',adminAuth,  addSubCategory)
router.delete('/deleteProduct/:id',adminAuth, deleteProduct);
router.put("/product/:id", upload.array("images", 5), updateProduct);
router.delete('/deleteCategory/:id',adminAuth, deleteCategory)
router.put("/updateCategory/:id",adminAuth, upload.array("image", 1), updateCategory);
router.delete('/deleteHeader',adminAuth, deleteHeader);
router.delete('/deleteBlog',adminAuth, deleteBlog);
router.put("/updateblog/:id",adminAuth, upload.array("image", 1), updateBlogs);
router.post('/addBrand',adminAuth, upload.array('image', 1),  addBrand)
router.delete('/deleteBrand',adminAuth, deleteBrand)
router.post('/addVoucher',adminAuth, addVoucher)
router.post('/addTestimonial',adminAuth, upload.array('image', 1),  addTestimonials)
router.put("/updateTestimonial/:id",adminAuth, upload.array("image", 1), updateTestimonials);
router.delete('/deleteTestimonial',adminAuth, deleteTestimonial);
router.get('/getOrders',adminAuth, getOrders)
router.put("/updateStatus",adminAuth, updateOrderStatus);
router.get('/getTestimonials',adminAuth, getTestimonials);
router.get('/getUsers',adminAuth, getUsers);
router.delete('/deleteUser',adminAuth, deleteUser);
router.get('/dashboardCount',adminAuth, getDashboardCounts);
router.post("/createAdmin",adminAuth, createAdmin);
router.get("/sales", adminAuth, getSalesByDate);
router.post("/login", loginAdmin);


module.exports = router;