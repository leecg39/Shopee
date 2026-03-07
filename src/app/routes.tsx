import { Navigate, createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { DashboardPage } from "./components/DashboardPage";
import { ProductRegistrationPage } from "./components/ProductRegistrationPage";
import { OrdersPage } from "./components/OrdersPage";
import { ShippingPage } from "./components/ShippingPage";
import { CostPage } from "./components/CostPage";
import { MarginsPage } from "./components/MarginsPage";
import { DiscountsPage } from "./components/DiscountsPage";
import { CampaignPage } from "./components/CampaignPage";
import { SourcingPage } from "./components/SourcingPage";
import { IntegrationPage } from "./components/IntegrationPage";
import { InventoryPage } from "./components/InventoryPage";
import { NotificationsPage } from "./components/NotificationsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/landing",
    Component: LandingPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "dashboard", Component: DashboardPage },
      { path: "products/register", Component: ProductRegistrationPage },
      { path: "orders", Component: OrdersPage },
      { path: "shipping", Component: ShippingPage },
      { path: "cost", Component: CostPage },
      { path: "margins", Component: MarginsPage },
      { path: "discounts", Component: DiscountsPage },
      { path: "campaign", Component: CampaignPage },
      { path: "sourcing", Component: SourcingPage },
      { path: "inventory", Component: InventoryPage },
      { path: "notifications", Component: NotificationsPage },
      { path: "integration", Component: IntegrationPage },
      { path: "*", element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
