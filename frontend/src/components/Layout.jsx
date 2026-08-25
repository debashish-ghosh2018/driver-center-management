import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function Layout({children}) {
  return <div className="app-shell">
    <Sidebar/>
    <main className="main-content">
      <div className="container-fluid px-3 px-lg-4 py-3 py-lg-4">{children}</div>
    </main>
    <MobileNav/>
  </div>;
}
