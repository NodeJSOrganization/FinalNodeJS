# FinalNodeJS - E-Commerce Computer & Components Store

> **Dự án cuối kỳ môn Lập trình Web với Node.js**
## Thông Tin Dự Án

### Nhóm Thực Hiện
- **52200131** - Võ Thị Thanh Ngân
- **52200033** - Lê Công Tuấn
- **52200008** - Danh Nguyễn Nhựt An

### Tài Khoản Demo
- **Admin**: `thanhngan10604@gmail.com` / `123456`
- **Customer**: `loucity314@gmail.com` / `Lecongtuan1234.`

### Links
- 🔗 [GitHub Repository](https://github.com/NodeJSOrganization/FinalNodeJS)
- 📹 [Video Demo & Documentation](https://drive.google.com/drive/folders/1Sbxe89KP1c7bkeFkLoVkuOJFf7M2sLxu?usp=sharing)

---

## Giới Thiệu Dự Án

Đây là một **nền tảng thương mại điện tử (E-Commerce)** chuyên bán **máy tính và linh kiện máy tính**. Hệ thống cung cấp đầy đủ các tính năng cho cả **khách hàng** (customer) và **quản trị viên** (admin).

### Tính Năng Chính:
- **Quản lý sản phẩm** - Thêm, sửa, xóa sản phẩm  
- **Giỏ hàng & Thanh toán** - Quản lý giỏ hàng, tính năng checkout  
- **Quản lý đơn hàng** - Theo dõi trạng thái đơn hàng  
- **Hệ thống khách hàng** - Đăng ký, đăng nhập, quản lý tài khoản  
- **Xác thực OAuth** - Đăng nhập bằng Google  
- **Xây dựng thương hiệu (Brand) & Danh mục** - Phân loại sản phẩm  
- **Khuyến mãi & Chiết khấu** - Quản lý mã giảm giá, khuyến mãi  
- **Đánh giá & Bình luận** - Hệ thống review sản phẩm  
- **Tải ảnh lên** - Cloudinary integration  
- **Real-time notifications** - Socket.IO  
- **Dashboard thống kê** - Phân tích doanh số

---

## 🛠 Công Nghệ Sử Dụng

| Thành Phần | Công Nghệ | Phiên Bản | Mô Tả |
|:-----------|:----------|:---------|:------|
| **Backend** | Node.js | ≥18 | Runtime environment |
| | Express.js | 5.1 | Web framework |
| | MongoDB | Atlas | Cloud database |
| | Mongoose | 8.18 | ODM for MongoDB |
| | Socket.IO | 4.8 | Real-time communication |
| **Frontend** | React | 19 | UI library |
| | Vite | 7.1 | Build tool |
| | Redux Toolkit | 2.9 | State management |
| | Bootstrap | 5.3 | CSS framework |
| | React Router | 7.9 | Routing |
| **Tools** | Cloudinary | - | Image hosting |
| | Nodemailer | 7.0 | Email service |
| | Postman | API documentation |
| | Multer | 2.0 | File upload |

---

## Cấu Trúc Dự Án

```
FinalNodeJS/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/                     # API client services
│   │   ├── components/              # React components
│   │   │   ├── admin/               # Admin components
│   │   │   ├── product/             # Product display
│   │   │   ├── account/             # User account
│   │   │   ├── GlobalLoader/        # Loading component
│   │   │   └── routing/             # Route components
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin dashboard pages
│   │   │   ├── customer/            # Customer pages
│   │   │   ├── product/             # Product pages
│   │   │   └── auth/                # Authentication pages
│   │   ├── layouts/                 # Layout components
│   │   ├── store/                   # Redux store
│   │   ├── features/                # Redux slices
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── product/
│   │   │   ├── order/
│   │   │   ├── user/
│   │   │   └── ui/
│   │   ├── context/                 # React Context
│   │   ├── hooks/                   # Custom hooks
│   │   ├── data/                    # Mock data
│   │   ├── assets/                  # Images, styles
│   │   └── App.jsx                  # Main component
│   ├── public/                      # Static files
│   └── package.json
│
├── server/                          # Backend (Node.js + Express)
│   ├── controllers/                 # Route handlers
│   │   ├── authController.js
│   │   ├── productsController.js
│   │   ├── ordersController.js
│   │   ├── usersController.js
│   │   ├── cartController.js
│   │   ├── brandsController.js
│   │   ├── categoriesController.js
│   │   ├── discountsController.js
│   │   ├── promotionsController.js
│   │   ├── reviewController.js
│   │   ├── dashboardController.js
│   │   └── inventoryController.js
│   ├── models/                      # Database schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Brand.js
│   │   ├── Category.js
│   │   ├── Discount.js
│   │   ├── Promotion.js
│   │   ├── Review.js
│   │   └── [other models]
│   ├── routes/                      # API routes
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── config/                      # Configuration
│   │   └── cloudinary.js
│   ├── utils/                       # Utility functions
│   │   ├── errorResponse.js
│   │   ├── sendEmail.js
│   │   └── sendEmailWhenCreateOrder.js
│   ├── socket.js                    # Socket.IO configuration
│   ├── index.js                     # Server entry point
│   └── package.json
│
├── README.md                        # This file
└── package.json
```

---

## Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu Hệ Thống
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB Atlas** account (free tier) hoặc **MongoDB Compass**

### 1️. Clone Repository

```bash
git clone https://github.com/NodeJSOrganization/FinalNodeJS.git
cd FinalNodeJS
```

### 2️. Cài Đặt Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd ../client
npm install
```

### 3️. Cấu Hình Biến Môi Trường

#### Backend - Tạo file `.env` trong thư mục `server/`
```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email Service (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary (Image Upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Port
PORT=5000
NODE_ENV=development
```

#### Frontend - Tạo file `.env` trong thư mục `client/`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4️. Chạy Ứng Dụng

#### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Server chạy tại: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend chạy tại: `http://localhost:5173`

### 5. Xem dữ liệu MongoDB
- Có thể sử dụng **MongoDB Atlas** hoặc **MongoDB Compass** và new connection với URI
```
mongodb+srv://NodeJsFinal:Angrkg@nodejsfinal.iwen7jr.mongodb.net/nodejsfinal?retryWrites=true&w=majority&appName=NodeJsFinal
```
- Vào database **nodejsfinal** sẽ hiển thị ra toàn bộ dữ liệu của dự án

---

## Tính Năng Bảo Mật

- **JWT Authentication** - Xác thực token-based  
- **Password Hashing** - Bcrypt encryption  
- **CORS Protection** - Cross-Origin Resource Sharing  
- **Input Validation** - Xác thực dữ liệu đầu vào  
- **Role-based Access Control** - Kiểm soát quyền truy cập  
- **Secure File Upload** - Multer middleware

---

## Tính Năng Email

Ứng dụng hỗ trợ gửi email cho:
- Xác nhận đăng ký tài khoản
- Thông báo tạo đơn hàng
- Reset mật khẩu

Sử dụng **Nodemailer** kết nối với Gmail SMTP.

---

## Tải Ảnh Lên

Ứng dụng sử dụng **Cloudinary** cho:
- Tải ảnh avatar người dùng
- Tải ảnh sản phẩm
- Tải hình banner

---

## Real-Time Features

**Socket.IO** được sử dụng để:
- Thông báo đơn hàng mới
- Cập nhật trạng thái đơn hàng real-time
- Thông báo kho hàng

---

## Troubleshooting

### MongoDB Connection Error (MongoDB Atlas - MongoDB Compass)
```
- Kiểm tra MONGO_URI trong file .env
- Đảm bảo IP address được whitelisted trên MongoDB Atlas
- Kiểm tra username/password MongoDB
```

### Port Already in Use
```bash
# Thay đổi PORT trong file .env hoặc sử dụng port khác
# hoặc kill process trên port hiện tại

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### CORS Error
```
- Kiểm tra CORS configuration trong server/index.js
- Đảm bảo frontend URL được thêm vào whitelist
```

---