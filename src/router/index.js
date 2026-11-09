import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
const PublicLayout = () => import('@/layouts/PublicLayout.vue')
const ConsumerLayout = () => import('@/layouts/ConsumerLayout.vue')
const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')

// Public Pages
const LandingPage = () => import('@/pages/public/LandingPage.vue')
const LoginPage = () => import('@/pages/public/LoginPage.vue')
const RegisterPage = () => import('@/pages/public/RegisterPage.vue')
const PublicTermsPage = () => import('@/pages/public/TermsPage.vue')
const PublicInfoPage = () => import('@/pages/public/InfoPage.vue')
const PublicHelpPage = () => import('@/pages/public/PublicHelpPage.vue')
const PublicFaqPage = () => import('@/pages/public/FaqPage.vue')

// Consumer Pages
const BrowsePage = () => import('@/pages/consumer/BrowsePage.vue')
const FoodDetailPage = () => import('@/pages/consumer/FoodDetailPage.vue')
const CartPage = () => import('@/pages/consumer/CartPage.vue')
const CheckoutPage = () => import('@/pages/consumer/CheckoutPage.vue')
const OrdersPage = () => import('@/pages/consumer/OrdersPage.vue')
const OrderStatusPage = () => import('@/pages/consumer/OrderStatusPage.vue')
const ReviewPage = () => import('@/pages/consumer/ReviewPage.vue')
const ProfilePage = () => import('@/pages/consumer/ProfilePage.vue')
const AddressListPage = () => import('@/pages/consumer/AddressListPage.vue')
const AddressFormPage = () => import('@/pages/consumer/AddressFormPage.vue')
const SupplierStorePage = () => import('@/pages/consumer/SupplierStorePage.vue')
const PaymentResultPage = () => import('@/pages/consumer/PaymentResultPage.vue')

// Supplier Pages
const SupplierDashboard = () => import('@/pages/supplier/SupplierDashboard.vue')
const AddFoodPage = () => import('@/pages/supplier/AddFoodPage.vue')
const IncomingOrdersPage = () => import('@/pages/supplier/IncomingOrdersPage.vue')
const SupplierProfilePage = () => import('@/pages/supplier/SupplierProfilePage.vue')

// Admin Pages
const AdminDashboard = () => import('@/pages/admin/AdminDashboard.vue')
const ComplaintsPage = () => import('@/pages/admin/ComplaintsPage.vue')
const HelpPage = () => import('@/pages/admin/HelpPage.vue')
const TermsPage = () => import('@/pages/admin/TermsPage.vue')
const SettingsPage = () => import('@/pages/admin/SettingsPage.vue')

const routes = [
  // Public routes
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'Landing', component: LandingPage, meta: { public: true } },
      { path: 'masuk', name: 'Login', component: LoginPage, meta: { public: true, noFooter: true } },
      { path: 'daftar', name: 'Register', component: RegisterPage, meta: { public: true, noFooter: true } },
      { path: 'syarat-ketentuan', name: 'PublicTerms', component: PublicTermsPage, meta: { public: true } },
      { path: 'tentang/:slug', name: 'PublicInfo', component: PublicInfoPage, meta: { public: true } },
      { path: 'bantuan', name: 'PublicHelp', component: PublicHelpPage, meta: { public: true } },
      { path: 'faq', name: 'PublicFaq', component: PublicFaqPage, meta: { public: true } },
    ]
  },

  // Consumer routes
  {
    path: '/',
    component: ConsumerLayout,
    children: [
      { path: 'jelajah', name: 'Browse', component: BrowsePage, meta: { role: 'consumer' } },
      { path: 'makanan/:id', name: 'FoodDetail', component: FoodDetailPage, meta: { role: 'consumer' } },
      { path: 'toko/:supplierId', name: 'SupplierStore', component: SupplierStorePage, meta: { role: 'consumer' } },
      { path: 'keranjang', name: 'Cart', component: CartPage, meta: { role: 'consumer' } },
      { path: 'checkout', name: 'Checkout', component: CheckoutPage, meta: { role: 'consumer' } },
      { path: 'pembayaran', name: 'PaymentResult', component: PaymentResultPage, meta: { role: 'consumer' } },
      { path: 'pesanan', name: 'Orders', component: OrdersPage, meta: { role: 'consumer' } },
      { path: 'pesanan/:id', name: 'OrderStatus', component: OrderStatusPage, meta: { role: 'consumer' } },
      { path: 'ulasan/:id', name: 'Review', component: ReviewPage, meta: { role: 'consumer' } },
      { path: 'profil', name: 'Profile', component: ProfilePage, meta: { role: 'consumer' } },
      // Address routes
      { path: 'alamat', name: 'AddressList', component: AddressListPage, meta: { role: 'consumer' } },
      { path: 'alamat/baru', name: 'AddressNew', component: AddressFormPage, meta: { role: 'consumer' } },
      { path: 'alamat/:id/ubah', name: 'AddressEdit', component: AddressFormPage, meta: { role: 'consumer' } },
    ]
  },

  // Supplier routes
  {
    path: '/supplier',
    component: DashboardLayout,
    children: [
      { path: '', name: 'SupplierDashboard', component: SupplierDashboard, meta: { role: 'supplier' } },
      { path: 'tambah', name: 'AddFood', component: AddFoodPage, meta: { role: 'supplier' } },
      { path: 'edit/:id', name: 'EditFood', component: AddFoodPage, meta: { role: 'supplier' } },
      { path: 'profil', name: 'SupplierProfile', component: SupplierProfilePage, meta: { role: 'supplier' } },
      { path: 'pesanan', name: 'IncomingOrders', component: IncomingOrdersPage, meta: { role: 'supplier' } },
    ]
  },

  // Admin routes
  {
    path: '/admin',
    component: DashboardLayout,
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard, meta: { role: 'admin' } },
      { path: 'pengaduan', name: 'Complaints', component: ComplaintsPage, meta: { role: 'admin' } },
      { path: 'bantuan', name: 'Help', component: HelpPage, meta: { role: 'admin' } },
      { path: 'faq', redirect: { name: 'Help', query: { section: 'faq' } } },
      { path: 'syarat', name: 'Terms', component: TermsPage, meta: { role: 'admin' } },
      { path: 'pengaturan', name: 'Settings', component: SettingsPage, meta: { role: 'admin' } },
    ]
  },

  // Alias
  { path: '/login', redirect: '/masuk' },
  { path: '/register', redirect: '/daftar' },
  { path: '/terms', redirect: '/syarat-ketentuan' },

  // Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    return to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 }
  }
})

// Role-based route guard
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (auth.isLoggedIn && (to.name === 'Login' || to.name === 'Register')) {
      return next(getRoleDashboard(auth.role))
    }
    return next()
  }

  if (!auth.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  if (to.meta.role && to.meta.role !== auth.role) {
    return next(getRoleDashboard(auth.role))
  }

  next()
})

export function getRoleDashboard(role) {
  const map = {
    consumer: '/jelajah',
    supplier: '/supplier',
    admin: '/admin'
  }
  return map[role] || '/'
}

export default router
