import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { UserLayout } from '../../features/user/UserLayout';
import { PartnerLayout } from '../../features/delivery-partner/PartnerLayout';
import { AdminLayout } from '../../features/admin/AdminLayout';

// Public & Onboarding
import { WelcomeScreen } from '../../features/onboarding/WelcomeScreen';
import { AuthScreens } from '../../features/auth/AuthScreens';

// User Screens
import { UserDashboard } from '../../features/user/UserDashboard';
import { CalendarScreen } from '../../features/user/CalendarScreen';
import { InsightsScreen } from '../../features/user/InsightsScreen';
import { CareShopScreen } from '../../features/shop/CareShopScreen';
import { OrderFlowScreen } from '../../features/orders/OrderFlowScreen';
import { ProfileScreen } from '../../features/user/ProfileScreen';

// Partner Screens
import { PartnerDashboard } from '../../features/delivery-partner/PartnerDashboard';
import { PartnerRequests, ActiveOrderScreen } from '../../features/delivery-partner/PartnerOrders';
import { PartnerSafetyScreen } from '../../features/delivery-partner/PartnerSafetyScreen';

// Admin Screens
import { AdminDashboard } from '../../features/admin/AdminDashboard';
import { VerificationQueue } from '../../features/admin/VerificationQueue';
import { OrdersAdmin } from '../../features/admin/OrdersAdmin';
import { ProductCatalog } from '../../features/admin/ProductCatalog';
import { AuditLogView } from '../../features/admin/AuditLogView';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/auth/login" element={<AuthScreens />} />
      <Route path="/auth/register" element={<AuthScreens />} />

      {/* User Area */}
      <Route path="/app" element={<UserLayout />}>
        <Route index element={<Navigate to="/app/home" replace />} />
        <Route path="home" element={<UserDashboard />} />
        <Route path="calendar" element={<CalendarScreen />} />
        <Route path="insights" element={<InsightsScreen />} />
        <Route path="shop" element={<CareShopScreen />} />
        <Route path="orders" element={<OrderFlowScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
      </Route>

      {/* Delivery Partner Area */}
      <Route path="/partner" element={<PartnerLayout />}>
        <Route index element={<Navigate to="/partner/overview" replace />} />
        <Route path="overview" element={<PartnerDashboard />} />
        <Route path="requests" element={<PartnerRequests />} />
        <Route path="active" element={<ActiveOrderScreen />} />
        <Route path="safety" element={<PartnerSafetyScreen />} />
      </Route>

      {/* Admin Operations Area */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminDashboard />} />
        <Route path="verification" element={<VerificationQueue />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="audit" element={<AuditLogView />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
