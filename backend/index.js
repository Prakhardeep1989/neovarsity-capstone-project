const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const Stripe = require("stripe");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;
const SALT_ROUNDS = 10;

const seedProducts = require("./seedProducts");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connect to Databse"))
  .catch((err) => console.log(err));

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  image: String,
});

const userModel = mongoose.model("user", userSchema);

const schemaProduct = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product", schemaProduct);

const seedMenuIfEmpty = async () => {
  const count = await productModel.countDocuments();
  if (count === 0) {
    await productModel.insertMany(seedProducts);
    console.log(`Seeded ${seedProducts.length} sample menu items`);
    return;
  }

  const missingImages = await productModel.find({
    $or: [{ image: { $exists: false } }, { image: null }, { image: "" }],
  });

  for (const product of missingImages) {
    const match =
      seedProducts.find((s) => s.name === product.name) ||
      seedProducts.find((s) => s.category === product.category);
    if (match) {
      await productModel.updateOne(
        { _id: product._id },
        { $set: { image: match.image, description: product.description || match.description } }
      );
    }
  }

  if (missingImages.length > 0) {
    console.log(`Updated images for ${missingImages.length} products`);
  }
};

seedMenuIfEmpty().catch((err) => console.log("Seed error:", err));

const orderSchema = mongoose.Schema({
  userEmail: String,
  userName: String,
  items: Array,
  totalQty: Number,
  totalPrice: Number,
  status: { type: String, default: "paid" },
  createdAt: { type: Date, default: Date.now },
});
const orderModel = mongoose.model("order", orderSchema);

const requireAdmin = (req, res, next) => {
  const adminEmail = req.headers["x-admin-email"];
  if (
    adminEmail &&
    adminEmail.toLowerCase().trim() ===
      process.env.ADMIN_EMAIL?.toLowerCase().trim()
  ) {
    next();
  } else {
    res.status(403).send({ message: "Unauthorized: admin access required", alert: false });
  }
};

app.get("/", (req, res) => {
  res.send("HOMELY Meals API is running");
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName, image } =
      req.body;

    if (!email || !password || !firstName) {
      return res.send({ message: "Please enter required fields", alert: false });
    }

    if (password !== confirmPassword) {
      return res.send({
        message: "Password and confirm password do not match",
        alert: false,
      });
    }

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.send({ message: "Email id is already register", alert: false });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      image,
    });

    res.send({ message: "Successfully sign up", alert: true });
  } catch (err) {
    res.status(500).send({ message: "Sign up failed", alert: false });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send({ message: "Please enter email and password", alert: false });
    }

    const result = await userModel.findOne({ email });
    if (!result) {
      return res.send({
        message: "Email is not available, please sign up",
        alert: false,
      });
    }

    const passwordMatch = result.password.startsWith("$2")
      ? await bcrypt.compare(password, result.password)
      : password === result.password;

    if (!passwordMatch) {
      return res.send({ message: "Invalid password", alert: false });
    }

    const dataSend = {
      _id: result._id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      image: result.image,
      isAdmin:
        result.email?.toLowerCase().trim() ===
        process.env.ADMIN_EMAIL?.toLowerCase().trim(),
    };

    res.send({
      message: "Login is successfully",
      alert: true,
      data: dataSend,
    });
  } catch (err) {
    res.status(500).send({ message: "Login failed", alert: false });
  }
});

app.post("/uploadProduct", requireAdmin, async (req, res) => {
  try {
    const data = await productModel(req.body);
    await data.save();
    res.send({ message: "Upload successfully", alert: true });
  } catch (err) {
    res.status(500).send({ message: "Upload failed", alert: false });
  }
});

app.get("/product", async (req, res) => {
  const data = await productModel.find({});
  res.json(data);
});

app.post("/save-order", async (req, res) => {
  try {
    const { userEmail, userName, items, totalQty, totalPrice } = req.body;

    if (!userEmail || !items || items.length === 0) {
      return res.status(400).send({ message: "Invalid order data", alert: false });
    }

    await orderModel.create({
      userEmail,
      userName,
      items,
      totalQty,
      totalPrice,
    });

    res.send({ message: "Order saved successfully", alert: true });
  } catch (err) {
    res.status(500).send({ message: "Failed to save order", alert: false });
  }
});

app.get("/orders/:email", async (req, res) => {
  try {
    const orders = await orderModel
      .find({ userEmail: req.params.email })
      .sort({ createdAt: -1 });
    res.send(orders);
  } catch (err) {
    res.status(500).send([]);
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      shipping_options: [{ shipping_rate: "shr_1NBY3pSIdZYVEHlOjpjx9hLn" }],

      line_items: req.body.map((item) => {
        return {
          price_data: {
            currency: "inr",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
          },
          quantity: item.qty,
        };
      }),
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await stripe.checkout.sessions.create(params);
    res.status(200).json(session.id);
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
  }
});

app.listen(PORT, () => console.log("Server is running at port: " + PORT));
