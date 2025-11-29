import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Outlet />
    </main>
  );
};

export default PublicLayout;