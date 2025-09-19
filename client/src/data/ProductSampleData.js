import lap1 from "../assets/images/laptops/lap1.webp";
import lap2 from "../assets/images/laptops/lap2.webp";
import lap3 from "../assets/images/laptops/lap3.webp";
import lap4 from "../assets/images/laptops/lap4.webp";
import lap5 from "../assets/images/laptops/lap5.webp";
import lap6 from "../assets/images/laptops/lap6.webp";
import lap7 from "../assets/images/laptops/lap7.webp";
import lap8 from "../assets/images/laptops/lap8.webp";
import lap9 from "../assets/images/laptops/lap9.webp";

import harddriver1 from "../assets/images/hard-drives/harddriver1.jpg";
import harddriver2 from "../assets/images/hard-drives/harddriver2.jpg";
import harddriver3 from "../assets/images/hard-drives/harddriver3.jpg";
import harddriver5 from "../assets/images/hard-drives/harddriver5.jpg";

import monitor3 from "../assets/images/monitors/monitor3.jpg";
import monitor5 from "../assets/images/monitors/monitor5.jpg";
import monitor6 from "../assets/images/monitors/monitor6.jpg";

export const ProductSampleData = {
  // ===================================
  // === DANH MỤC: LAPTOPS ===
  // ===================================

  //     {
  //       id: 23,
  //       name: "SSD Samsung 1TB23",
  //       brand: "Samsung",
  //       description:
  //         "SSD Samsung 1TB cung cấp tốc độ đọc/ghi vượt trội, lý tưởng cho nâng cấp PC hoặc laptop. Độ bền cao và tiết kiệm năng lượng.",
  //       images: [harddriver3, harddriver5, harddriver1],
  //       variants: [
  //         { name: "SATA", price: "2,500,000 VND", stock: 25 },
  //         { name: "NVMe", price: "3,000,000 VND", stock: 12 },
  //       ],
  //       createdAt: new Date("2025-09-06").getTime(),
  //     },

  laptops: [
    {
      id: "1",
      name: "Laptop Lenovo LOQ 15IRX9",
      brand: "Lenovo",
      category: "laptops",
      description:
        "Laptop Lenovo LOQ 15IRX9 83DV012LVN trang bị CPU Intel Core i5-13450HX, là lựa chọn tuyệt vời cho cả gaming và công việc.",
      images: [lap1, lap2, lap3],
      variants: [
        {
          id: "11",
          color: "Xám",
          performance: "16GB RAM - 512GB SSD",
          costPrice: 21500000,
          sellingPrice: 23990000,
          image: lap4,
          sku: "LNV-LOQ-16-512",
          quantity: 15,
        },
        {
          id: "12",
          color: "Xanh",
          performance: "32GB RAM - 1TB SSD",
          costPrice: 26000000,
          sellingPrice: 28490000,
          image: lap5,
          sku: "LNV-LOQ-32-1TB",
          quantity: 7,
        },
      ],
      createdAt: new Date("2025-09-10").getTime(),
      updatedAt: new Date("2025-09-11").getTime(),
    },
    {
      id: "2",
      name: "Laptop Gaming ASUS ROG",
      brand: "ASUS",
      category: "laptops",
      description:
        "Hiệu năng mạnh mẽ với chip Intel Core i9, card đồ họa NVIDIA RTX 3080, và màn hình 144Hz, dành riêng cho game thủ.",
      images: [lap9, lap2, lap3],
      variants: [
        {
          id: "21",
          color: "Đen",
          performance: "16GB RAM, 512GB SSD",
          costPrice: 23000000,
          sellingPrice: 25000000,
          image: lap9,
          sku: "ASUS-ROG-16-512",
          quantity: 10,
        },
        {
          id: "22",
          color: "Đen",
          performance: "32GB RAM, 1TB SSD",
          costPrice: 28000000,
          sellingPrice: 30000000,
          image: lap9,
          sku: "ASUS-ROG-32-1TB",
          quantity: 5,
        },
      ],
      createdAt: new Date("2025-08-31").getTime(),
      updatedAt: new Date("2025-09-01").getTime(),
    },
    {
      id: "3",
      name: "Laptop Dell Inspiron",
      brand: "Dell",
      category: "laptops",
      description:
        "Lý tưởng cho công việc văn phòng và học tập. Thiết kế mỏng nhẹ, pin lâu, và hiệu năng ổn định với chip Intel Core i5.",
      images: [lap7, lap5, lap6],
      variants: [
        {
          id: "31",
          color: "Bạc",
          performance: "8GB RAM, 256GB SSD",
          costPrice: 13500000,
          sellingPrice: 15000000,
          image: lap7,
          sku: "DELL-INSP-8-256",
          quantity: 15,
        },
        {
          id: "32",
          color: "Bạc",
          performance: "16GB RAM, 512GB SSD",
          costPrice: 16500000,
          sellingPrice: 18000000,
          image: lap7,
          sku: "DELL-INSP-16-512",
          quantity: 8,
        },
      ],
      createdAt: new Date("2025-08-25").getTime(),
      updatedAt: new Date("2025-08-26").getTime(),
    },
  ],
  // ===================================
  // === DANH MỤC: MONITORS ===
  // ===================================
  monitors: [
    {
      id: "101",
      name: "Monitor Dell 27 inch",
      brand: "Dell",
      category: "monitors",
      description:
        "Mang đến hình ảnh sắc nét với độ phân giải cao. Phù hợp cho văn phòng và giải trí tại nhà. Thiết kế viền mỏng và chân đế chắc chắn.",
      images: [monitor3, monitor5, monitor6],
      variants: [
        {
          id: "1011",
          color: "Đen",
          performance: "Full HD (1920x1080)",
          costPrice: 4500000,
          sellingPrice: 5000000,
          image: monitor3,
          sku: "DELL-MON-27-FHD",
          quantity: 20,
        },
        {
          id: "1012",
          color: "Đen",
          performance: "QHD (2560x1440)",
          costPrice: 6000000,
          sellingPrice: 6500000,
          image: monitor3,
          sku: "DELL-MON-27-QHD",
          quantity: 10,
        },
      ],
      createdAt: new Date("2025-09-02").getTime(),
      updatedAt: new Date("2025-09-03").getTime(),
    },
    {
      id: "102",
      name: "Monitor LG UltraGear 24 inch",
      brand: "LG",
      category: "monitors",
      description:
        "Màn hình gaming chuyên nghiệp với tần số quét 144Hz và thời gian phản hồi 1ms, cho trải nghiệm chơi game mượt mà.",
      images: [monitor5, monitor6],
      variants: [
        {
          id: "1021",
          color: "Đen Đỏ",
          performance: "Full HD, 144Hz",
          costPrice: 5500000,
          sellingPrice: 6200000,
          image: monitor5,
          sku: "LG-UG-24-144",
          quantity: 18,
        },
      ],
      createdAt: new Date("2025-08-28").getTime(),
      updatedAt: new Date("2025-08-29").getTime(),
    },
  ],
  // ===================================
  // === DANH MỤC: HARD DRIVES ===
  // ===================================
  "hard-drives": [
    {
      id: "201",
      name: "SSD Samsung 1TB",
      brand: "Samsung",
      category: "hard-drives",
      description:
        "Cung cấp tốc độ đọc/ghi vượt trội, lý tưởng cho nâng cấp PC hoặc laptop. Độ bền cao và tiết kiệm năng lượng.",
      images: [harddriver1, harddriver2, harddriver3],
      variants: [
        {
          id: "2011",
          color: "N/A",
          performance: "Chuẩn SATA 3",
          costPrice: 2200000,
          sellingPrice: 2500000,
          image: harddriver1,
          sku: "SS-EVO-1TB-SATA",
          quantity: 25,
        },
        {
          id: "2012",
          color: "N/A",
          performance: "Chuẩn NVMe",
          costPrice: 2700000,
          sellingPrice: 3000000,
          image: harddriver2,
          sku: "SS-EVO-1TB-NVME",
          quantity: 12,
        },
      ],
      createdAt: new Date("2025-09-01").getTime(),
      updatedAt: new Date("2025-09-02").getTime(),
    },
    {
      id: "202",
      name: "HDD Western Digital 2TB",
      brand: "Western Digital",
      category: "hard-drives",
      description:
        "Dung lượng lưu trữ lớn, phù hợp để lưu trữ phim, ảnh và các dữ liệu quan trọng. Tốc độ quay 7200RPM.",
      images: [harddriver5, harddriver2],
      variants: [
        {
          id: "2021",
          color: "N/A",
          performance: "2TB, 7200RPM",
          costPrice: 1500000,
          sellingPrice: 1800000,
          image: harddriver5,
          sku: "WD-BLUE-2TB-7200",
          quantity: 30,
        },
      ],
      createdAt: new Date("2025-08-30").getTime(),
      updatedAt: new Date("2025-08-31").getTime(),
    },
  ],
};
