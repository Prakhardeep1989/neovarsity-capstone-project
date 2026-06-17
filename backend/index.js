const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const Stripe = require("stripe");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createAuthMiddleware = require("./middleware/auth");
const orderModel = require("./models/Order");
const createOrderRoutes = require("./routes/orderRoutes");
const createPaymentController = require("./controllers/paymentController");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());

const paymentController = createPaymentController({ orderModel, stripe });

app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;
const SALT_ROUNDS = 10;

const seedProducts = require("./seedProducts");
const { validateProductInput } = require("./utils/productValidation");

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
  role: {
    type: String,
    enum: ["CUSTOMER", "ADMIN"],
    default: "CUSTOMER",
  },
});

const userModel = mongoose.model("user", userSchema);
const { protectRoute, adminOnly, customerOnly } = createAuthMiddleware(userModel);

const schemaProduct = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ["AVAILABLE", "INACTIVE"],
      default: "AVAILABLE",
    },
    category: {
      type: String,
      enum: ["THALI", "COMBO_MEAL", "ADD_ON"],
      required: true,
    },
  },
  { timestamps: true }
);
const productModel = mongoose.model("product", schemaProduct);

const seedMenuIfEmpty = async () => {
  const count = await productModel.countDocuments();
  if (count === 0) {
    await productModel.insertMany(seedProducts);
    console.log(`Seeded ${seedProducts.length} sample menu items`);
  }
};

seedMenuIfEmpty().catch((err) => console.log("Seed error:", err));

const getOptionalUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await userModel.findById(decoded.id).select("-password");
  } catch {
    return null;
  }
};

const isAdminUser = (user) => user?.role === "ADMIN";

const orderRoutes = createOrderRoutes({
  orderModel,
  productModel,
  stripe,
  protectRoute,
  adminOnly,
  customerOnly,
});
app.use("/api/orders", orderRoutes);

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
      role: "CUSTOMER",
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

    const passwordMatch = await bcrypt.compare(password, result.password);

    if (!passwordMatch) {
      return res.send({ message: "Invalid password", alert: false });
    }

    const role = result.role || "CUSTOMER";
    const token = jwt.sign(
      { id: result._id, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const dataSend = {
      _id: result._id,
      firstName: result.firstName,
      lastName: result.lastName,
      email: result.email,
      image: result.image,
      role,
      isAdmin: role === "ADMIN",
      token,
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

app.post("/uploadProduct", protectRoute, adminOnly, async (req, res) => {
  res.status(410).send({
    message: "This endpoint is deprecated. Use POST /api/products/admin",
    alert: false,
  });
});

app.get("/product", async (req, res) => {
  const user = await getOptionalUser(req);
  const filter = isAdminUser(user) ? {} : { status: "AVAILABLE" };
  const data = await productModel.find(filter).sort({ createdAt: -1 });
  res.json(data);
});

app.get("/api/products", async (req, res) => {
  try {
    const user = await getOptionalUser(req);
    const filter = isAdminUser(user) ? {} : { status: "AVAILABLE" };
    const products = await productModel.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", alert: false });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const user = await getOptionalUser(req);
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found", alert: false });
    }

    if (!isAdminUser(user) && product.status !== "AVAILABLE") {
      return res.status(404).json({ message: "Product not found", alert: false });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product", alert: false });
  }
});

app.post("/api/products/admin", protectRoute, adminOnly, async (req, res) => {
  try {
    const { errors, data } = validateProductInput(req.body);

    if (errors.length) {
      return res.status(400).json({ message: errors.join(", "), alert: false });
    }

    const product = await productModel.create(data);
    res.status(201).json({
      message: "Product created successfully",
      alert: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create product", alert: false });
  }
});

app.put("/api/products/admin/:id", protectRoute, adminOnly, async (req, res) => {
  try {
    const { errors, data } = validateProductInput(req.body, { isUpdate: true });

    if (errors.length) {
      return res.status(400).json({ message: errors.join(", "), alert: false });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No valid fields to update", alert: false });
    }

    const product = await productModel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found", alert: false });
    }

    res.json({
      message: "Product updated successfully",
      alert: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", alert: false });
  }
});

app.delete("/api/products/admin/:id", protectRoute, adminOnly, async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found", alert: false });
    }

    res.json({ message: "Product deleted successfully", alert: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", alert: false });
  }
});

app.post("/save-order", async (req, res) => {
  res.status(410).send({
    message: "Deprecated. Orders are created via POST /api/orders/create-checkout-session",
    alert: false,
  });
});

app.get("/orders/:email", async (req, res) => {
  res.status(410).send({
    message: "Deprecated. Use GET /api/orders/my-orders",
    alert: false,
  });
});

app.post("/create-checkout-session", async (req, res) => {
  res.status(410).send({
    message: "Deprecated. Use POST /api/orders/create-checkout-session",
    alert: false,
  });
});

app.listen(PORT, () => console.log("Server is running at port: " + PORT));
