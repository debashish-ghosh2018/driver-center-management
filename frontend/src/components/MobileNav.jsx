import { NavLink } from "react-router-dom";
const links=[
  ["Home","/","bi-house"],
  ["Bookings","/bookings","bi-calendar-check"],
  ["Drivers","/drivers","bi-person-badge"],
  ["Track","/tracking","bi-geo-alt"],
  ["Reports","/reports","bi-grid"]
];
export default function MobileNav(){
  return <nav className="mobile-bottom-nav shadow-sm">
    {links.map(([label,to,icon])=>
      <NavLink key={to} to={to} end={to==="/"}>
        <i className={`bi ${icon}`}></i>{label}
      </NavLink>
    )}
  </nav>;
}
