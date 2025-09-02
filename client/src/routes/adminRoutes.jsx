import AdminLayout from '../layouts/AdminLayout';

// Import tất cả các trang của admin
import DashboardPage from '../pages/admin/DashboardPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import OrderManagementPage from '../pages/admin/OrderManagementPage';
import InventoryManagementPage from '../pages/admin/InventoryManagementPage';
import DiscountManagementPage from '../pages/admin/DiscountManagementPage';
import PromotionManagementPage from '../pages/admin/PromotionManagementPage';
import CategoryListPage from '../pages/admin/CategoryListPage';
import BrandListPage from '../pages/admin/BrandListPage';
import AddProductPage from '../pages/admin/AddProductPage';
import AddPromotionPage from '../pages/admin/AddPromotionPage';
import AddCategoryPage from '../pages/admin/AddCategoryPage';
import AddBrandPage from '../pages/admin/AddBrandPage';
import AddUserPage from '../pages/admin/AddUserPage';
import AddDiscountPage from '../pages/admin/AddDiscountPage';
import OrderDetailPage from '../pages/admin/OrderDetailPage';  
const Placeholder = ({ title }) => <h2>{title}</h2>;
const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />, // Tất cả route con sẽ dùng chung layout này
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'products', element: <ProductManagementPage /> },
      { path: 'products/add', element: <AddProductPage /> }, 
      { path: 'users', element: <UserManagementPage /> },
      { path: 'users/add', element: <AddUserPage /> },
      { path: 'orders', element: <OrderManagementPage /> },
      { path: 'inventory', element: <InventoryManagementPage /> },
      { path: 'discounts', element: <DiscountManagementPage /> },
       { path: 'discounts/add', element: <AddDiscountPage /> },
      { path: 'promotions', element: <PromotionManagementPage /> },
      { path: 'promotions/add', element: <AddPromotionPage /> },
      { path: 'categories', element: <CategoryListPage /> },
      { path: 'categories/add', element: <AddCategoryPage /> },
      { path: 'brands', element: <BrandListPage /> },
      { path: 'brands/add', element: <AddBrandPage /> },
      { path: 'orders/:orderId', element: <OrderDetailPage /> }, 
    ],
  },
];

export default adminRoutes;