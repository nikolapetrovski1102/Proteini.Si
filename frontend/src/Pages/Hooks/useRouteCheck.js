import { useLocation } from "react-router-dom";

export const useRouteCheck = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/landing";
  const isAuthPage = ["/login", "/reset-password"].includes(location.pathname);

  return { isLandingPage, isAuthPage };
};
