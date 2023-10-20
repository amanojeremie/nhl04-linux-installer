import React from "react";
import ReactDOM from "react-dom/client";
import Installer from "./routes/installer";
import "./styles.css";
import RosterInstaller from "./routes/roster-installer";
import Licenses from "./routes/licenses";
import Root from "./routes/root";
import PostInstallGuide from "./routes/post-install-guide";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
  {
    path: '/installer',
    element: <Installer />
  },
  {
    path: '/roster-installer',
    element: <RosterInstaller />
  },
  {
    path: '/post-install-guide',
    element: <PostInstallGuide />
  },
  {
    path: '/licenses',
    element: <Licenses />
  },
]);


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
