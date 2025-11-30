import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <main className="flex items-center justify-center">
      <Outlet />
    </main>
  );
};

export default PublicLayout;