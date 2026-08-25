import { useEffect,useState } from "react";
import api from "../services/api";
import KpiCard from "../components/KpiCard";

export default function Reports(){
  const [r,setR]=useState(null);
  useEffect(()=>{api.get("/reports/summary").then(x=>setR(x.data));},[]);
  if(!r) return <div className="text-center py-5"><div className="spinner-border"/></div>;
  return <>
    <div className="mb-3"><h2 className="mb-1">Reports</h2><p className="text-muted">Current reporting period</p></div>
    <div className="row g-3">
      <KpiCard title="Bookings" value={r.bookings} icon="bi-calendar-check"/>
      <KpiCard title="Revenue" value={`₹${Number(r.revenue||0).toFixed(2)}`} icon="bi-currency-rupee"/>
      <KpiCard title="Driver Earnings" value={`₹${Number(r.driverNetEarnings||0).toFixed(2)}`} icon="bi-wallet2"/>
    </div>
  </>;
}
