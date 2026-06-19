const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const Razorpay = require("razorpay");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createAuthMiddleware = require("./middleware/auth");
const corsMiddleware = require("./middleware/cors");
const securityHeaders = require("./middleware/security");
const sanitizeInput = securityHeaders.sanitizeInput;
const {
  generalLimiter,
  authLimiter,
  contactLimiter,
  passwordResetLimiter,
} = require("./middleware/rateLimit");
const orderModel = require("./models/Order");
const createOrderRoutes = require("./routes/orderRoutes");
const createPaymentController = require("./controllers/paymentController");
const { submitContact } = require("./controllers/contactController");
const { sendPasswordResetEmail } = require("./services/emailService");
const { verifyCaptcha } = require("./utils/captcha");
const { generateResetToken, hashResetToken } = require("./utils/passwordReset");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(generalLimiter);

const paymentController = createPaymentController({ orderModel, razorpay });

app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleRazorpayWebhook
);

app.use(express.json({ limit: "10mb" }));
app.use(sanitizeInput);

const PORT = process.env.PORT || 8080;
const SALT_ROUNDS = 10;

const seedProducts = require("./seedProducts");
const { validateProductInput } = require("./utils/productValidation");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to database"))
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
  resetPasswordToken: String,
  resetPasswordExpires: Date,
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

const toProductDoc = ({ legacyNames, ...product }) => product;

const seedMenuIfEmpty = async () => {
  const count = await productModel.countDocuments();
  if (count === 0) {
    await productModel.insertMany(seedProducts.map(toProductDoc));
    console.log(`Seeded ${seedProducts.length} sample menu items`);
    return;
  }

  let synced = 0;
  for (const item of seedProducts) {
    const { legacyNames = [], ...productData } = item;
    const existing = await productModel.findOne({
      name: { $in: [productData.name, ...legacyNames] },
    });
    if (existing) {
      await productModel.updateOne(
        { _id: existing._id },
        {
          $set: {
            name: productData.name,
            description: productData.description,
            image: productData.image,
          },
        }
      );
      synced += 1;
    }
  }
  if (synced) console.log(`Synced ${synced} menu items from seed catalog`);
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
  razorpay,
  protectRoute,
  adminOnly,
  customerOnly,
});
app.use("/api/orders", orderRoutes);

app.post("/api/contact", contactLimiter, submitContact);

app.get("/", (req, res) => {
  res.send("HOMELY Meals API is running");
});

app.post("/signup", authLimiter, async (req, res) => {
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

app.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;

    if (!email || !password) {
      return res.send({ message: "Please enter email and password", alert: false });
    }

    const captchaResult = await verifyCaptcha(captchaToken);
    if (!captchaResult.valid) {
      return res.send({ message: captchaResult.message, alert: false });
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

app.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  const genericMessage =
    "If an account exists with that email, a password reset link has been sent.";

  try {
    const { email } = req.body;

    if (!email) {
      return res.send({ message: "Please enter your email address", alert: false });
    }

    const user = await userModel.findOne({ email });

    if (user) {
      const { token, hashedToken, expiresAt } = generateResetToken();
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = expiresAt;
      await user.save();

      await sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName,
        resetToken: token,
      });
    }

    res.send({ message: genericMessage, alert: true });
  } catch (err) {
    console.error("[AUTH] Forgot password error:", err.message);
    res.status(500).send({ message: "Unable to process request", alert: false });
  }
});

app.post("/reset-password", passwordResetLimiter, async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.send({ message: "Please enter all required fields", alert: false });
    }

    if (password !== confirmPassword) {
      return res.send({
        message: "Password and confirm password do not match",
        alert: false,
      });
    }

    const hashedToken = hashResetToken(token);
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.send({
        message: "Invalid or expired reset link. Please request a new one.",
        alert: false,
      });
    }

    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send({ message: "Password reset successfully. You can now log in.", alert: true });
  } catch (err) {
    console.error("[AUTH] Reset password error:", err.message);
    res.status(500).send({ message: "Password reset failed", alert: false });
  }
});

app.post("/change-password", authLimiter, protectRoute, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.send({ message: "Please enter all required fields", alert: false });
    }

    if (newPassword !== confirmPassword) {
      return res.send({
        message: "New password and confirm password do not match",
        alert: false,
      });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(401).send({ message: "User not found", alert: false });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.send({ message: "Current password is incorrect", alert: false });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return res.send({
        message: "New password must be different from your current password",
        alert: false,
      });
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send({ message: "Password changed successfully", alert: true });
  } catch (err) {
    console.error("[AUTH] Change password error:", err.message);
    res.status(500).send({ message: "Password change failed", alert: false });
  }
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

app.listen(PORT, () => console.log("Server is running at port: " + PORT));
