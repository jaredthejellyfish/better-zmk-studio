import Sidebar from "@/components/organisms/sidebar";
import Header from "@/components/organisms/header";
import { Outlet, useLocation } from "react-router-dom";
import RefetchButton from "@/components/molecules/refetch-button";

const pages = {
  "/": "Keybinds",
  "/settings": "Settings",
};

function Layout() {
  const location = useLocation();
  const pathname = location.pathname;
  const title = pages[pathname as keyof typeof pages] || "";

  return (
    <main className="flex flex-row">
      <Sidebar />
      <section className="flex-1">
        <Header title={title}>
          {title === "Keybinds" && <RefetchButton />}
        </Header>
        <div>
          <Outlet />
        </div>
      </section>
    </main>
  );
}

export default Layout;
