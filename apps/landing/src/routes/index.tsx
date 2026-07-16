import { lazy, type ComponentType } from "react";

const LandingPage = lazy(() => import("@/pages/LandingPage"));

interface RouteConfig {
  path: string;
  element: ComponentType;
}

export const routes: RouteConfig[] = [
  {
    path: "/",
    element: LandingPage as unknown as ComponentType,
  },
];
