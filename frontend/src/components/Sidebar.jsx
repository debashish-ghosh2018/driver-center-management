import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  ["Dashboard","/","bi-speedometer2"],
  ["Customers","/customers","bi-people"],
  ["Drivers","/drivers","bi-person-badge"],
  ["Vehicles","/vehicles","bi-car-front"],
  ["Bookings","/bookings","bi-calendar-check"],
  ["Payments","/payments","bi-credit-card"],
  ["Tracking","/tracking","bi-geo-alt"],
  ["Reports","/reports","bi-bar-chart"]
];

export default function Sidebar() {
  const {user,logout} = useAuth();
  return <aside className="sidebar p-3">
    <div className="mb-4 text-white">
      <h4 className="mb-1"><i className="bi bi-car-front me-2"></i>Driver Center</h4>
      <small className="text-secondary">{user?.name} · {user?.role}</small>
    </div>
    <nav className="nav flex-column">
      {links.map(([label,to,icon]) =>
        <NavLink key={to} to={to} end={to==="/"} className="nav-link">
          <i className={`bi ${icon} me-2`}></i>{label}
        </NavLink>
      )}
      <button className="btn btn-link nav-link text-start mt-3" onClick={logout}>
        <i className="bi bi-box-arrow-right me-2"></i>Logout
      </button>
    </nav>
  </aside>;
}
