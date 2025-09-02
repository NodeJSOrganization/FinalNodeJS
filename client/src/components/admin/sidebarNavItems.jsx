import {
  FaTachometerAlt, FaBoxOpen, FaUsers, FaShoppingCart,
  FaWarehouse, FaTags, FaPlus, FaListUl,
  FaUserPlus,
  FaBullhorn,
  FaSitemap,
  FaCopyright
} from 'react-icons/fa';


export const sidebarNavItems = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: <FaTachometerAlt />,
  },
  {
    key: 'products',
    title: 'Sản phẩm',
    icon: <FaBoxOpen />,
    children: [
      {
        key: 'all-products',
        title: 'Tất cả sản phẩm',
        path: '/admin/products',
        icon: <FaListUl />,
      },
      {
        key: 'add-product',
        title: 'Thêm sản phẩm mới',
        path: '/admin/products/add',
        icon: <FaPlus />,
      },
      {
        key: 'promotions',
        title: 'khuyến mãi',
        icon: <FaBullhorn />,
        children: [
          {
            key: 'all-promotions',
            title: 'Tất cả KM',
            path: '/admin/promotions',
            icon: <FaListUl />,
          },
          {
            key: 'add-promotion',
            title: 'Thêm KM mới',
            path: '/admin/promotions/add',
            icon: <FaPlus />,
          },
        ],
      },
      {
        key: 'Categorys',
        title: 'Danh mục',
        icon: <FaSitemap />,
        children: [
          {
            key: 'all-categories',
            title: 'Tất cả danh mục',
            path: '/admin/categories',
            icon: <FaListUl />,
          },
          {
            key: 'add-category',
            title: 'Thêm danh mục mới',
            path: '/admin/categories/add',
            icon: <FaPlus />,
          },
        ],
      },
      {
        key: 'Brands',
        title: 'Thương hiệu',
        icon: <FaCopyright />,
        children: [
          {
            key: 'all-brands',
            title: 'Tất cả thương hiệu',
            path: '/admin/brands',
            icon: <FaListUl />,
          },
          {
            key: 'add-brand',
            title: 'Thêm thương hiệu mới',
            path: '/admin/brands/add',
            icon: <FaPlus />,
          },
        ],
      },
    ]
  },
  {
    key: 'users',
    title: 'Người dùng',
    icon: <FaUsers />,
    children: [
      {
        key: 'all-users',
        title: 'Tất cả người dùng',
        path: '/admin/users',
        icon: <FaListUl />,
      },
      {
        key: 'add-user',
        title: 'Thêm người dùng mới',
        path: '/admin/users/add',
        icon: <FaUserPlus />,
      }
    ]
  },
  {
    key: 'discounts',
    title: 'Mã giảm giá',
    icon: <FaTags />,
    children: [
      {
        key: 'all-discounts',
        title: 'Tất cả mã giảm giá',
        path: '/admin/discounts',
        icon: <FaListUl />,
      },
      {
        key: 'add-user',
        title: 'Thêm mã giảm mới',
        path: '/admin/discounts/add',
        icon: <FaPlus />,
      }
    ]
  },
  {
    key: 'orders',
    title: 'Đơn hàng',
    path: '/admin/orders',
    icon: <FaShoppingCart />,
  },
  {
    key: 'inventory',
    title: 'Kho hàng',
    path: '/admin/inventory',
    icon: <FaWarehouse />,
  }
];