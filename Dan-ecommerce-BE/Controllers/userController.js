const { response } = require('express');
const ObjectId = require('mongoose').Types.ObjectId
const USER = require('../Models/userModel')
const PRODUCT = require('../Models/productModel');
const CATEGORY = require('../Models/categoryModel');
const BLOG = require('../Models/blogModel');
const VOUCHER = require('../Models/voucher')
const TESTIMONIAL = require('../Models/testimonialModels')
const HEADER = require('../Models/headerModels')
const BRAND = require('../Models/brandModels')
const mongoose = require("mongoose");
const PricingBase = require('twilio/lib/rest/PricingBase');
const stripe = require("stripe")(process.env.STRYPE_SECRET_KEY);
const Order = require('../Models/orderModels');
// const ObjectId = require('mongoose').Types.ObjectId

// const addUserData =async(req,res)=>{

//   try {
//     const user = new USER({
//       name: req.body.name,
//       email: req.body.email,
//       age: req.body.age,
//     });

//     await user.save();
//     res.send("User saved successfully!");
//   } catch (err) {
//     res.status(500).send(err);
//   }
// }

const getUsers = async (req, res) => {
  try {
    const users = await USER.find();
    res.json(users)
  } catch (error) {
    res.status(500).send(error)
  }
}

const getProduct = async (req, res) => {
  try {
    const product = await PRODUCT.find();
    res.json(product)
  } catch (error) {
    res.status(500).send(error)
  }
}

const getSingleProduct = async (req, res) => {
  try {
    const id = req.query.productId;   // ✅ use query instead of body
    console.log(req.query, "req.query in getSingleProduct >>>>>");

    const product = await PRODUCT.findById(id);
    res.json(product);
  } catch (error) {
    res.status(500).send(error);
  }
};



const getcategory = async (req, res) => {
  try {
    const product = await CATEGORY.find();
    res.json(product)
  } catch (error) {
    res.status(500).send(error)
  }
}

const getPopularProduct = async (req, res) => {
  try {
    const popular = await PRODUCT.aggregate([
      {
        $match: { starRating: { $gte: 3.9 } }
      },
      {
        $sort: { starRating: -1 }
      },
      {
        $project: {
          _id: 1,
          images: 1,
          productName: 1,
          rate: 1,
          category: 1,
          discount: 1,
        }
      },
      {
        $limit: 3
      }
    ]);



    res.status(200).json({
      message: "Popular products fetched successfully",
      data: popular
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBlogs = async (req, res) => {
  try {
    const blog = await BLOG.find()
    res.status(200).json(blog)
  } catch (error) {
    res.status(500).json({ error: error })
  }
}

const getCategoryProduct = async (req, res) => {
  console.log(req.query.id);
  try {
    const id = req.query.id
    const product = await PRODUCT.find({ categoryId: id })
    res.status(200).json({ message: "category product fetch successfully", data: product })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}


const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const product = await PRODUCT.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const user = await USER.findById(userId);
    const existingItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({ productId, quantity: quantity || 1 });
    }
    await user.save();

    res.json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// const removeFromCart = async (req, res) => {
//   try {
//     const {productId, userId  } = req.body;
//  console.log(req.body, "777777777777777");
 
//     const updatedUser = await USER.findByIdAndUpdate(
//       userId,
//       {
//         $pull: { cart: { productId: productId } }
//       },
//       { new: true }
//     ).populate("cart.productId");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       message: "Item removed from cart successfully",
//       cart: updatedUser.cart
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const removeFromCart = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    console.log(req.body, "remove cart req.body >>>>>>");

    const updatedUser = await USER.findByIdAndUpdate(
      userId,
      {
        $pull: { cart: { _id: new mongoose.Types.ObjectId(productId) } }
      },
      { new: true }
    ).populate("cart.productId");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Item removed from cart successfully",
      cart: updatedUser.cart
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: error.message });
  }
};


const updateCartQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    console.log(req.body, "update cart quantity req.body >>>>>>");

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const updatedUser = await USER.findOneAndUpdate(
      { _id: userId, "cart._id": productId },
      { $set: { "cart.$.quantity": quantity } },  // update only matched item
      { new: true }
    ).populate("cart.productId");

    if (!updatedUser) {
      return res.status(404).json({ message: "User or product not found in cart" });
    }

    res.status(200).json({
      message: "Cart quantity updated successfully",
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// const updateCartQuantity = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;

//     console.log(req.body, "update cart quantity req.body >>>>>>");

//     if (quantity < 1) {
//       return res.status(400).json({ message: "Quantity must be at least 1" });
//     }

//     // Convert string IDs to ObjectId if they're strings
//     const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
//       ? new mongoose.Types.ObjectId(userId) 
//       : userId;
    
//     const productObjectId = mongoose.Types.ObjectId.isValid(productId)
//       ? new mongoose.Types.ObjectId(productId)
//       : productId;

//     // First, check if user exists and has the product in cart
//     const user = await USER.findById(userObjectId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check if product exists in cart
//     const cartItem = user.cart.find(item => 
//       item.productId.toString() === productObjectId.toString()
//     );
    
//     if (!cartItem) {
//       return res.status(404).json({ message: "Product not found in cart" });
//     }

//     // Update using array position with explicit casting
//     const updatedUser = await USER.findOneAndUpdate(
//       { 
//         _id: userObjectId, 
//         "cart.productId": productObjectId 
//       },
//       { $set: { "cart.$.quantity": quantity } },
//       { new: true }
//     ).populate("cart.productId");

//     if (!updatedUser) {
//       return res.status(404).json({ message: "Failed to update cart quantity" });
//     }

//     res.status(200).json({
//       message: "Cart quantity updated successfully",
//       cart: updatedUser.cart
//     });
//   } catch (error) {
//     console.error("Update cart error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };





// Get user cart
const getCart = async (req, res) => {
  try {
    const userId = req.query.userId;

    const user = await USER.findById(userId)
      .populate({
        path: "cart.productId",
        select: "productName rate images brandName discount", // select needed fields
      })
      .lean({ virtuals: true }); // <-- Important: enables virtuals on populate

    // Now each product in user.cart will have "discountedRate"
    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const addAddress = async (req, res) => {
  try {
    const { userId, address } = req.body;

    if (!userId || !address) {
      return res.status(400).json({ error: "userId and address are required" });
    }

    const user = await USER.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses.push(address);
    await user.save();

    res.status(200).json({ message: "Address added successfully", addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await USER.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ error: "userId and addressId are required" });
    }

    const user = await USER.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getRelatedProduct = async (req, res) => {
  console.log(req.params, "tttttttttttttt");

  try {
    // const categoryId = req.body.categoryId
    const categoryId = req.query.id;
    const data = await PRODUCT.find({ categoryId: categoryId })
    res.status(200).json({ message: "Related product fetched Successfully", data: data })
  } catch (error) {
    res.status(500).json({ error: error })
  }
}


const getSearch = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    const datas = await PRODUCT.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { brandName: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });

    res.status(200).json({ results: datas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFilter = async (req, res) => {
  try {
    const filterData = req.body.sortBy
    if (filterData == 'popularity') {
      const fiter = await PRODUCT.aggregate([
        {
          $match: { starRating: { $gte: 3.9 } }
        },
        {
          $sort: { starRating: -1 }
        },
        {
          $project: {
            _id: 1,
            images: 1,
            productName: 1,
            rate: 1,
            category: 1,
            starRating: 1
          }
        },

      ])
      res.status(200).json({
        message: "popularity products fetched successfully",
        data: fiter
      });

    }else if(filterData == 'latest'){
      const fiter = await PRODUCT.find().sort({date: -1})

         res.status(200).json({
        message: "latest products fetched successfully",
        data: fiter
      });
    }else if(filterData == 'priceLowToHigh'){
        const fiter = await PRODUCT.find().sort({rate: 1})

         res.status(200).json({
        message: "Low To High rate products fetched successfully",
        data: fiter
      });
    }else if(filterData == 'priceHighToLow'){
        const fiter = await PRODUCT.find().sort({rate: -1})

         res.status(200).json({
        message: "High to Low  rate products fetched successfully",
        data: fiter
      });
    }else{
      res.status(400).json({message:"your senting emty data"})
    }

  } catch (error) {
    res.status(500)
  }
}


const applyVoucher = async (req, res) => {
  try {
    const { code, cartTotal } = req.body; // cart total comes from frontend

    const voucher = await VOUCHER.findOne({ code, isActive: true });
    if (!voucher) {
      return res.status(400).json({ error: "Invalid voucher code" });
    }

    if (voucher.expiryDate < Date.now()) {
      return res.status(400).json({ error: "Voucher expired" });
    }

    if (cartTotal < voucher.minAmount) {
      return res.status(400).json({ error: `Minimum cart value should be ${voucher.minAmount}` });
    }

    let discountAmount = 0;
    if (voucher.discountType === "percentage") {
      discountAmount = (cartTotal * voucher.discountValue) / 100;
    } else {
      discountAmount = voucher.discountValue;
    }

    const finalAmount = Math.max(0, cartTotal - discountAmount);

    res.status(200).json({
      message: "Voucher applied successfully",
      discount: discountAmount,
      finalAmount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
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


const getHeader = async (req, res) => {
  try {
    const header = await HEADER.find();
    res.status(200).json({ message: "Header fetched successfully", data: header });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getBrand = async (req, res) => {
  try {
    const brand = await BRAND.find();
    res.status(200).json({ message: "brand fetched successfully", data: brand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCartSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Populate product details
    const user = await USER.findById(userId).populate("cart.productId");

    if (!user || user.cart.length === 0) {
      return res.status(404).json({ message: "Cart is empty or user not found" });
    }

    let totalPrice = 0;
    let totalDiscountedPrice = 0;

    user.cart.forEach((item) => {
      const product = item.productId;
      if (!product) return;

      const quantity = item.quantity || 1;
      const rate = product.rate || 0;
      const discountedRate = product.discountedRate || rate;

      // ✅ Total actual price (without discount)
      totalPrice += rate * quantity;

      // ✅ Total discounted price using virtual field
      totalDiscountedPrice += discountedRate * quantity;
    });

    const totalSavings = totalPrice - totalDiscountedPrice;

    res.status(200).json({
      message: "Cart summary fetched successfully",
      totalItems: user.cart.length,
      totalPrice,
      totalDiscountedPrice,
      totalSavings,
      cart: user.cart.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.productName,
        rate: item.productId.rate,
        discountedRate: item.productId.discountedRate,
        quantity: item.quantity,
        totalDiscountValue: (item.productId.rate - item.productId.discountedRate) * item.quantity, // 🧮 per product saving
      })),
    });
  } catch (error) {
    console.error("Error fetching cart summary:", error);
    res.status(500).json({ error: error.message });
  }
};



const createCheckoutSession = async (req, res) => {
  try {
    const { userId, products } = req.body;

    const initialItems = products.map((item) => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: item.productName,
        },
        unit_amount: Math.round(item.discountedRate * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: initialItems,
      mode: "payment",
      success_url: `http://localhost:5173/checkout-success?session_id={CHECKOUT_SESSION_ID}&userId=${userId}`,
      cancel_url: "http://localhost:5173/cart",
      metadata: {
        userId,
        products: JSON.stringify(products),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message });
  }
};



const handlePaymentSuccess = async (req, res) => {
  console.log("handlePaymentSuccess called >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

  console.log("Order model type6666666:", typeof Order);

  try {
    const { sessionId, userId } = req.body;

    // ✅ 1. Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("meta dattaaaaaaa:", session.metadata?.products);

    // ✅ 2. Check if payment was successful
    if (session.payment_status === "paid") {
      // ✅ 3. Get products from metadata (you stored them when creating the session)

      const products = session.metadata?.products
        ? JSON.parse(session.metadata.products)
        : [];

      // ✅ 4. Create a new Order
      const order = new Order({
        userId,
        products: products.map((p) => ({
          productId: p.productId,
          name: p.productName,
          price: p.discountedRate,
          quantity: p.quantity,
        })),
        totalAmount: session.amount_total / 100,
        paymentStatus: "paid",
        orderStatus : "pending",
        paymentIntentId: session.payment_intent,
      });

      await order.save();

      console.log("✅ Order saved successfully:", order);

      return res.status(200).json({
        success: true,
        message: "Order created successfully",
        order,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not completed yet",
      });
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(userId, "userId in getUserOrders >>>>>");
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const orders = await Order.aggregate([
     
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },

      {
        $lookup: {
          from: "products", 
          localField: "products.productId",
          foreignField: "_id",
          as: "productImages",
        },
      },

      {
        $addFields: {
          products: {
            $map: {
              input: "$products",
              as: "p",
              in: {
                $mergeObjects: [
                  "$$p",
                  {
                    image: {
                      $arrayElemAt: [
                        {
                          $getField: {
                            field: "images",
                            input: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$productImages",
                                    as: "pi",
                                    cond: { $eq: ["$$pi._id", "$$p.productId"] },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },

      { $project: { productImages: 0 } },

      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};




const getCategoryPopularProduct = async (req, res) => {
  try {
    const { categoryId } = req.body; // 👈 read from body

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const popular = await PRODUCT.aggregate([
      {
        $match: {
          categoryId: new mongoose.Types.ObjectId(categoryId), // match categoryId
          starRating: { $gte: 3.9 }, // only popular
        },
      },
      {
        $sort: { starRating: -1 },
      },
      {
        $project: {
          _id: 1,
          images: 1,
          productName: 1,
          rate: 1,
          category: 1,
          discount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Popular products fetched successfully",
      data: popular,
    });
  } catch (error) {
    console.error("Error fetching category popular products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};





module.exports = {
  getProduct,
  getcategory,
  getSingleProduct,
  getPopularProduct,
  getBlogs,
  getCategoryProduct,
  getUsers,
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
  getHeader,
  getBrand,
  getCartSummary,
  deleteAddress,
  createCheckoutSession,
  handlePaymentSuccess,
  getUserOrders,
  getCategoryPopularProduct
}