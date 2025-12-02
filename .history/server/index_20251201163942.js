const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const initializeSocket = require("./socket");

dotenv.config();

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const brandRoutes = require("./routes/brands");
const productRoutes = require("./routes/products");
const discountRoutes = require("./routes/discounts");
const promotionRoutes = require("./routes/promotions");
const userRoutes = require("./routes/users");
const inventoryRoutes = require("./routes/inventory");
const reviewRoutes = require("./routes/reviews");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const dashboardRoutes = require("./routes/dashboard");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

const app = express();

const server = http.createServer(app);

// Khởi tạo và gắn Socket.IO vào server
// Truyền object `io` vào middleware để các controller có thể sử dụng
const io = initializeSocket(server);
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/discounts", discountRoutes);
app.use("/api/v1/promotions", promotionRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
