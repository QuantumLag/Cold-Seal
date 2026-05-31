import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import Analytics from "./pages/Analytics";
import ShipmentDetail from "./pages/ShipmentDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "shipments", Component: Shipments },
      { path: "shipments/:id", Component: ShipmentDetail },
      { path: "analytics", Component: Analytics },
    ],
  },
]);
