import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import NodeMetrics from "./pages/NodeMetrics";
import SmartContractRules from "./pages/SmartContractRules";
import SystemSettings from "./pages/SystemSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "analytics", Component: Analytics },
      { path: "metrics", Component: NodeMetrics },
      { path: "contracts", Component: SmartContractRules },
      { path: "settings", Component: SystemSettings },
    ],
  },
]);
