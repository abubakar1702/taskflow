import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../utils/auth";

const PublicLayout = () => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex items-center justify-center">
      <Outlet />
    </main>
  );
};

export default PublicLayout;