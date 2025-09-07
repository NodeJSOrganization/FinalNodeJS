import lap1 from "..//assets/images/laptops/lap1.webp";
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
  laptops: [
    {
      id: 1,
      name: "Laptop Gaming ASUS ROG",
      brand: "ASUS",
      description:
        "Laptop Gaming ASUS ROG được thiết kế dành riêng cho game thủ với hiệu năng mạnh mẽ. Máy sử dụng chip Intel Core i9 thế hệ mới nhất, card đồ họa NVIDIA RTX 3080, và màn hình 144Hz. Phù hợp cho cả chơi game lẫn chỉnh sửa video. Thiết kế chắc chắn với hệ thống tản nhiệt tiên tiến.",
      images: [lap9, lap2, lap3],
      variants: [
        { name: "16GB RAM, 512GB SSD", price: "25,000,000 VND", stock: 10 },
        { name: "32GB RAM, 1TB SSD", price: "30,000,000 VND", stock: 5 },
      ],
      createdAt: new Date("2025-08-31").getTime(),
    },
    {
      id: 2,
      name: "Laptop Dell Inspiron",
      brand: "Dell",
      description:
        "Laptop Dell Inspiron lý tưởng cho công việc văn phòng và học tập. Máy có thiết kế mỏng nhẹ, pin lâu, và hiệu năng ổn định với chip Intel Core i5. Phù hợp cho các tác vụ cơ bản như soạn thảo và duyệt web.",
      images: [lap7, lap5, lap6],
      variants: [
        { name: "8GB RAM, 256GB SSD", price: "15,000,000 VND", stock: 15 },
        { name: "16GB RAM, 512GB SSD", price: "18,000,000 VND", stock: 8 },
      ],
      createdAt: new Date("2025-08-25").getTime(),
    },
    {
      id: 3,
      name: "Laptop Dell Inspiron",
      brand: "Dell",
      description:
        "Laptop Dell Inspiron lý tưởng cho công việc văn phòng và học tập. Máy có thiết kế mỏng nhẹ, pin lâu, và hiệu năng ổn định với chip Intel Core i5. Phù hợp cho các tác vụ cơ bản như soạn thảo và duyệt web.",
      images: [lap2, lap5, lap6],
      variants: [
        { name: "8GB RAM, 256GB SSD", price: "15,000,000 VND", stock: 15 },
        { name: "16GB RAM, 512GB SSD", price: "18,000,000 VND", stock: 8 },
      ],
      createdAt: new Date("2025-09-01").getTime(),
    },
    {
      id: 4,
      name: "Laptop Dell Inspiron",
      brand: "Dell",
      description:
        "Laptop Dell Inspiron lý tưởng cho công việc văn phòng và học tập. Máy có thiết kế mỏng nhẹ, pin lâu, và hiệu năng ổn định với chip Intel Core i5. Phù hợp cho các tác vụ cơ bản như soạn thảo và duyệt web.",
      images: [lap3, lap5, lap6],
      variants: [
        { name: "8GB RAM, 256GB SSD", price: "15,000,000 VND", stock: 15 },
        { name: "16GB RAM, 512GB SSD", price: "18,000,000 VND", stock: 8 },
      ],
      createdAt: new Date("2025-08-20").getTime(),
    },
    {
      id: 5,
      name: "Laptop Dell Inspiron",
      brand: "Dell",
      description:
        "Laptop Dell Inspiron lý tưởng cho công việc văn phòng và học tập. Máy có thiết kế mỏng nhẹ, pin lâu, và hiệu năng ổn định với chip Intel Core i5. Phù hợp cho các tác vụ cơ bản như soạn thảo và duyệt web.",
      images: [lap6, lap5, lap6],
      variants: [
        { name: "8GB RAM, 256GB SSD", price: "15,000,000 VND", stock: 15 },
        { name: "16GB RAM, 512GB SSD", price: "18,000,000 VND", stock: 8 },
      ],
      createdAt: new Date("2025-09-03").getTime(),
    },
    {
      id: 6,
      name: "Laptop Dell Inspiron",
      brand: "Dell",
      description:
        "Laptop Dell Inspiron lý tưởng cho công việc văn phòng và học tập. Máy có thiết kế mỏng nhẹ, pin lâu, và hiệu năng ổn định với chip Intel Core i5. Phù hợp cho các tác vụ cơ bản như soạn thảo và duyệt web.",
      images: [lap5, lap5, lap6],
      variants: [
        { name: "8GB RAM, 256GB SSD", price: "15,000,000 VND", stock: 15 },
        { name: "16GB RAM, 512GB SSD", price: "18,000,000 VND", stock: 8 },
      ],
      createdAt: new Date("2025-09-04").getTime(),
    },
    {
      id: 7,
      name: "Laptop Dell Inspiron",
      brand: "Dell",
      description:
        "Laptop Dell Inspiron lý tưởng cho công việc văn phòng và học tập. Máy có thiết kế mỏng nhẹ, pin lâu, và hiệu năng ổn định với chip Intel Core i5. Phù hợp cho các tác vụ cơ bản như soạn thảo và duyệt web.",
      images: [lap8, lap5, lap6],
      variants: [
        { name: "8GB RAM, 256GB SSD", price: "15,000,000 VND", stock: 15 },
        { name: "16GB RAM, 512GB SSD", price: "18,000,000 VND", stock: 8 },
      ],
      createdAt: new Date("2025-08-15").getTime(),
    },
  ],
  monitors: [
    {
      id: 11,
      name: "Monitor Dell 27inch",
      brand: "Dell",
      description:
        "Monitor Dell 27inch mang đến hình ảnh sắc nét với độ phân giải Full HD. Phù hợp cho văn phòng và giải trí tại nhà. Thiết kế viền mỏng và chân đế chắc chắn.",
      images: [monitor3, monitor5, monitor6],
      variants: [
        { name: "Full HD", price: "5,000,000 VND", stock: 20 },
        { name: "QHD", price: "6,500,000 VND", stock: 10 },
      ],
      createdAt: new Date("2025-09-02").getTime(),
    },
    {
      id: 12,
      name: "Monitor Dell 27inch12",
      brand: "Dell",
      description:
        "Monitor Dell 27inch mang đến hình ảnh sắc nét với độ phân giải Full HD. Phù hợp cho văn phòng và giải trí tại nhà. Thiết kế viền mỏng và chân đế chắc chắn.",
      images: [monitor5, monitor3, monitor6],
      variants: [
        { name: "Full HD", price: "5,000,000 VND", stock: 20 },
        { name: "QHD", price: "6,500,000 VND", stock: 10 },
      ],
      createdAt: new Date("2025-08-28").getTime(),
    },
    {
      id: 13,
      name: "Monitor Dell 27inch13",
      brand: "Dell",
      description:
        "Monitor Dell 27inch mang đến hình ảnh sắc nét với độ phân giải Full HD. Phù hợp cho văn phòng và giải trí tại nhà. Thiết kế viền mỏng và chân đế chắc chắn.",
      images: [monitor6, monitor3, monitor5],
      variants: [
        { name: "Full HD", price: "5,000,000 VND", stock: 20 },
        { name: "QHD", price: "6,500,000 VND", stock: 10 },
      ],
      createdAt: new Date("2025-09-05").getTime(),
    },
  ],
  "hard-drives": [
    {
      id: 21,
      name: "SSD Samsung 1TB21",
      brand: "Samsung",
      description:
        "SSD Samsung 1TB cung cấp tốc độ đọc/ghi vượt trội, lý tưởng cho nâng cấp PC hoặc laptop. Độ bền cao và tiết kiệm năng lượng.",
      images: [harddriver1, harddriver2, harddriver3],
      variants: [
        { name: "SATA", price: "2,500,000 VND", stock: 25 },
        { name: "NVMe", price: "3,000,000 VND", stock: 12 },
      ],
      createdAt: new Date("2025-09-01").getTime(),
    },
    {
      id: 22,
      name: "SSD Samsung 1TB22",
      brand: "Samsung",
      description:
        "SSD Samsung 1TB cung cấp tốc độ đọc/ghi vượt trội, lý tưởng cho nâng cấp PC hoặc laptop. Độ bền cao và tiết kiệm năng lượng.",
      images: [harddriver2, harddriver3, harddriver5],
      variants: [
        { name: "SATA", price: "2,500,000 VND", stock: 25 },
        { name: "NVMe", price: "3,000,000 VND", stock: 12 },
      ],
      createdAt: new Date("2025-08-30").getTime(),
    },
    {
      id: 23,
      name: "SSD Samsung 1TB23",
      brand: "Samsung",
      description:
        "SSD Samsung 1TB cung cấp tốc độ đọc/ghi vượt trội, lý tưởng cho nâng cấp PC hoặc laptop. Độ bền cao và tiết kiệm năng lượng.",
      images: [harddriver3, harddriver5, harddriver1],
      variants: [
        { name: "SATA", price: "2,500,000 VND", stock: 25 },
        { name: "NVMe", price: "3,000,000 VND", stock: 12 },
      ],
      createdAt: new Date("2025-09-06").getTime(),
    },
  ],
};
