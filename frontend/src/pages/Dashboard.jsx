import { useEffect,useState } from "react";
import api from "../services/api";
import KpiCard from "../components/KpiCard";

export default function Dashboard(){
  const [d,setD]=useState(null);
  useEffect(()=>{ api.get("/dashboard").then(r=>setD(r.data)); },[]);
  if(!d) return <div className="text-center py-5"><div className="spinner-border"/></div>;
  return <>
    <div className="mb-4">
      <h2 className="mb-1">Dashboard</h2>
      <p className="text-muted mb-0">Driver center operational overview</p>
    </div>
    <div className="row g-3">
      <KpiCard title="Customers" value={d.customers} icon="bi-people"/>
      <KpiCard title="Drivers" value={d.drivers} icon="bi-person-badge"/>
      <KpiCard title="Available Drivers" value={d.availableDrivers} icon="bi-person-check"/>
      <KpiCard title="Vehicles" value={d.vehicles} icon="bi-car-front"/>
      <KpiCard title="Pending" value={d.pendingBookings} icon="bi-hourglass"/>
      <KpiCard title="Active Trips" value={d.activeBookings} icon="bi-geo"/>
      <KpiCard title="Completed" value={d.completedBookings} icon="bi-check-circle"/>
      <KpiCard title="Revenue" value={`₹${Number(d.revenue||0).toFixed(2)}`} icon="bi-currency-rupee"/>
    </div>
  </>;
}
