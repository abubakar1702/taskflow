import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const PublicLayout = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="flex items-center justify-center">
      <Outlet />
    </main>
  );
};

export default PublicLayout;