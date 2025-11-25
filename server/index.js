// index.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173', // hoặc 3000, tuỳ FE
  credentials: true,               // nếu sau này dùng cookie
}));


const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const productRoutes = require('./routes/products');
const discounts = require('./routes/discounts');
const promotions = require('./routes/promotions');
const users = require('./routes/users'); 
const inventoryRoutes = require('./routes/inventory');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

connectDB();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/discounts', discounts);
app.use('/api/v1/promotions', promotions);
app.use('/api/v1/users', users);
app.use('/api/v1/inventory', inventoryRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));