const { response } = require('express');
const ObjectId = require('mongoose').Types.ObjectId
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PRODUCT = require('../Models/productModel');
const CATEGORY = require('../Models/categoryModel');
const BLOGS = require('../Models/blogModel')
const HEADER = require('../Models/headerModels')
const BRAND = require('../Models/brandModels')
const VOUCHER = require('../Models/voucher')
const TESTIMONIAL = require('../Models/testimonialModels')
const ORDER = require('../Models/orderModels')
const USERS = require('../Models/userModel')
const ADMIN = require('../Models/adminLoginModels')


const addProduct = async (req, res) => {
  try {
    console.log(req.body, "bodyyyyyyyyyyy");
    
    const imageUrls = req.files.map(file => file.path);
    const admin = new PRODUCT({
      brandName: req.body.brandName,
      images: imageUrls,
      productName: req.body.productName,
      subTitle: req.body.subTitle,
      starRating: req.body.starRating,
      rate: req.body.rate,
      quantity: req.body.quantity,
      description: req.body.description,
      category: req.body.category,
      categoryId: req.body.categoryId,
      subCategory: req.body.subCategory,
      subCategoryId: req.body.subCategoryId,
      discount: req.body.discount || 0,
      date: req.body.date || Date.now(),
    });

    await admin.save();
    res.status(200).json({ message: "Product Saved Successfully", data: admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getProduct = async (req, res) => {
  try {
    const product = await PRODUCT.find();
    res.json(product)
  } catch (error) {
    res.status(500).send(error)
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productID = req.params.id;
    console.log(productID, "nnnnnnnnnnnnnnn");

    const product = await PRODUCT.findByIdAndDelete(productID);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: product
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "ppppppppppppppppppppppppppppp");
    

    // Get existing product
    let product = await PRODUCT.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // If new images uploaded via Cloudinary/multer
    let imageUrls = product.images; // keep old images by default
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path); // Cloudinary gives file.path as URL
    }

    // Update fields
    const updatedProduct = await PRODUCT.findByIdAndUpdate(
      id,
      {
        $set: {
          brandName: req.body.brandName || product.brandName,
          productName: req.body.productName || product.productName,
          subTitle: req.body.subTitle || product.subTitle,
          starRating: req.body.starRating || product.starRating,
          rate: req.body.rate || product.rate,
          quantity: req.body.quantity || product.quantity,
          discription: req.body.discription || product.discription,
          category: req.body.category || product.category,
          categoryId: req.body.categoryId || product.categoryId,
          discount: req.body.discount !== undefined ? req.body.discount : product.discount,
          images: imageUrls // update if new images uploaded
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const updateBlogs = async (req, res) => {
  try {
    const id = req.params.id
    let blogs = await BLOGS.findById(id)

    if (!blogs) {
      return res.status(404).json({ error: "Blog not found" });
    }

    let imageUrls = blogs.image; // keep old images by default
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path); // Cloudinary gives file.path as URL
    }

    const updateBlog = await BLOGS.findByIdAndUpdate(id,
      {
        $set: {
          head: req.body.head || blogs.head,
          tittle: req.body.tittle || blogs.tittle,
          category: req.body.category || blogs.category,
          image: imageUrls
        }
      },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      message: "blog updated successfully",
      data: updateBlog
    });

  } catch (error) {
    res.status(500).json({ error: error })
  }
}



const addCategory = async (req, res) => {
  console.log(req.body, "categoryyyyy");

  const imageUrls = req.files.map(file => file.path);
  try {
    const cate = new CATEGORY({
      category: req.body.category,
      image: imageUrls,
    })
    await cate.save();
    res.status(200).json({ message: "category added successfully", data: cate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getcategory = async (req, res) => {
  try {
    const product = await CATEGORY.find();
    res.json(product)
  } catch (error) {
    res.status(500).send(error)
  }
}


const deleteCategory = async (req, res) => {
  try {

    const categoryId = req.params.id

    const category = await CATEGORY.findByIdAndDelete(categoryId)

    if (!category) {
      res.status(400).json({ error: "Product not found" })
    }

    res.status(200).json({
      message: "Product deleted successfully",
      data: category
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // If new images uploaded (optional)
    let imageUrls;
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }

    // Build update object
    let updateData = {};
    if (req.body.category) updateData.category = req.body.category;
    if (imageUrls) updateData.image = imageUrls;
    if (req.body.subCategories) {
      updateData.subCategories = JSON.parse(req.body.subCategories);
      // send as stringified array in form-data
    }

    const updatedCategory = await CATEGORY.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






// Add subcategory to an existing category
const addSubCategory = async (req, res) => {
  try {
    
    const { categoryId, subCategories } = req.body;

    if (!categoryId || !subCategories) {
      return res.status(400).json({ error: "categoryId and subCategories are required" });
    }

    // Find category by ID
    const category = await CATEGORY.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Add subcategories (skip duplicates)
    category.subCategories = [
      ...category.subCategories,
      ...subCategories.filter(
        (sub) => !category.subCategories.some((c) => c.name === sub.name)
      ),
    ];

    await category.save();

    res.status(200).json({
      message: "Subcategories added successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getBlogs = async (req, res) => {
  try {
    const blog = await BLOGS.find()
    res.status(200).json(blog)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}


const addBlogs = async (req, res) => {
  const imageUrls = req.files.map(file => file.path);
  try {
    const blog = new BLOGS({
      head: req.body.head,
      tittle: req.body.tittle,
      category: req.body.category,
      image: imageUrls
    })
    await blog.save();
    res.status(200).json({ message: "blog adding succsessfully", data: blog })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

const deleteBlog = async (req, res) => {
  try {
    const id = req.body.blogId
    const blogs = await BLOGS.findByIdAndDelete(id)
    if (!blogs) {
      res.status(400).json({ message: "Blog not found!!" })
    }
    res.status(200).json({ message: "Blog deleted successfully", data: blogs })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}


const addHeader = async (req, res) => {

  const imageUrls = req.files.map(file => file.path);

  console.log(imageUrls, "hahahahahaaa");

  try {
    const head = new HEADER({
      webImage: imageUrls,
      productId: req.body.productId,
    })
    await head.save();
    res.status(200).json({ message: "Header image added successfully", data: head });
  } catch (error) {
    res.status(500).json({ message: "header data added error", error: error })
  }
}

const deleteHeader = async (req, res) => {
  try {
    const id = req.body.id

    const header = await HEADER.findByIdAndDelete(id)

    if (!header) {
      res.status(400).json({ message: "header not found!!" })
    }

    res.status(200).json({ message: "header deleted successfully", data: header })

  } catch (error) {
    res.status(500).json({ error: error })
  }
}


const addBrand = async (req, res) => {
  const imageUrls = req.files.map(file => file.path);
  try {
    const brand = new BRAND({
      image: imageUrls,
      tittle: req.body.tittle,
    })
    await brand.save()
    res.status(200).json({ message: "brand upload successfully", data: brand });
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

const deleteBrand = async (req, res)=>{
  try {
    const id = req.body.brandId
    const brand = await BRAND.findByIdAndDelete(id)
    if(!brand){
      res.status(400).json({message:"brand not found"})
    }
    res.status(200).json({message:"Brand deleted succesfully", data: brand})
  } catch (error) {
    res.status(500).json({message: error})
  }
}


const addVoucher = async (req, res) => {
  console.log(req.body, "yyyyyyyyyyyyyyyyyyyyyyyy");
  try {
    const { code, discountType, discountValue, minAmount, expiryDate } = req.body;

    const existingVoucher = await VOUCHER.findOne({ code });
    if (existingVoucher) {
      return res.status(400).json({ error: "Voucher code already exists" });
    }

    const voucher = new VOUCHER({
      code,
      discountType,
      discountValue,
      minAmount,
      expiryDate
    });

    await voucher.save();

    res.status(201).json({ message: "Voucher created successfully", data: voucher });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const addTestimonials = async (req, res) => {
  try {

    const {name, message, starRating} = req.body;
    const imageUrls = req.files.map(file => file.path);

    const data = new TESTIMONIAL({
      name,
      image: imageUrls,
      message,
      starRating,
    })
    await data.save();
    res.status(200).json({message: "Testimaonial added successfully", data: data});
    
  } catch (error) {
    res.status(500).json({error: error})
  }
}



const updateTestimonials = async (req, res) => {
  try {
    const { id } = req.params;

    let testimonial = await TESTIMONIAL.findById(id);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }
    let imageUrls = testimonial.image; 
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path);
    }
    const updatedTestimonial = await TESTIMONIAL.findByIdAndUpdate(
      id,
      {
        $set: {
          name: req.body.name || testimonial.name,
          message: req.body.message || testimonial.message,
          starRating: req.body.starRating || testimonial.starRating,
          image: imageUrls,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Testimonial updated successfully",
      data: updatedTestimonial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const id = req.body.testimonialId;

    const testimonial = await TESTIMONIAL.findByIdAndDelete(id);  
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    } 
    res.status(200).json({ message: "Testimonial deleted successfully", data: testimonial });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

const getHeader = async (req, res) => {
  try {
    const header = await HEADER.find();
    res.status(200).json({ message: "Header fetched successfully", data: header });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getOrders = async (req, res) => {
  try {
    const order = await ORDER.find().sort({ createdAt: -1 }); 
    res.status(200).json({
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    if (!orderId || !orderStatus) {
      return res.status(400).json({ message: "Order ID and orderStatus are required" });
    }

    // Update order and automatically refresh updatedAt
    const updatedOrder = await ORDER.findByIdAndUpdate(
      orderId,
      {
        orderStatus,
        updatedAt: new Date(), // <-- ensures timestamp refresh
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
};

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await TESTIMONIAL.find();
    res.status(200).json({ message: "Testimonials fetched successfully", data: testimonials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const user = await USERS.find();
    res.status(200).json({ message: "Testimonials fetched successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const id = req.body.id; 
    const user = await USERS.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } 
    res.status(200).json({ message: "User deleted successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};


const getDashboardCounts = async (req, res) => {
  try {
    const [productCount, categoryCount, userCount, orderCount] = await Promise.all([
      PRODUCT.countDocuments(),
      CATEGORY.countDocuments(),
      USERS.countDocuments(),
      ORDER.countDocuments(),
    ]);

    res.status(200).json({
      message: "Dashboard counts fetched successfully",
      data: {
        products: productCount,
        categories: categoryCount,
        users: userCount,
        orders: orderCount,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard counts",
      error: error.message,
    });
  }
};


const createAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminExists = await ADMIN.findOne({ username });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await ADMIN.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;


    const admin = await ADMIN.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const JWT_SECRET = process.env.JWT_SECRET
    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSalesByDate = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date required" });
    }

    // Convert incoming ISO strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Extend end date to include the full day
    end.setHours(23, 59, 59, 999);

    const sales = await ORDER.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Sales fetched by date",
      data: sales,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};




module.exports = {
  addProduct,
  addCategory,
  addBlogs,
  addHeader,
  addSubCategory,
  deleteProduct,
  updateProduct,
  deleteCategory,
  updateCategory,
  deleteHeader,
  deleteBlog,
  updateBlogs,
  addBrand,
  deleteBrand,
  addVoucher,
  addTestimonials,
  updateTestimonials,
  deleteTestimonial,
  getProduct,
  getcategory,
  getHeader,
  getBlogs,
  getOrders,
  updateOrderStatus,
  getTestimonials,
  getUsers,
  deleteUser,
  getDashboardCounts,
  createAdmin,
  loginAdmin,
  getSalesByDate,
}