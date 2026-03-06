import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { DashboardPage } from "./components/DashboardPage";
import { OrdersPage } from "./components/OrdersPage";
import { CostPage } from "./components/CostPage";
import { MarginsPage } from "./components/MarginsPage";
import { DiscountsPage } from "./components/DiscountsPage";
import { CampaignPage } from "./components/CampaignPage";
import { SourcingPage } from "./components/SourcingPage";
import { IntegrationPage } from "./components/IntegrationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { path: "dashboard", Component: DashboardPage },
      { path: "orders", Component: OrdersPage },
      { path: "cost", Component: CostPage },
      { path: "margins", Component: MarginsPage },
      { path: "discounts", Component: DiscountsPage },
      { path: "campaign", Component: CampaignPage },
      { path: "sourcing", Component: SourcingPage },
      { path: "integration", Component: IntegrationPage },
    ],
  },
]);
