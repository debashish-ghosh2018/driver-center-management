import { useEffect,useState } from "react";
import api from "../services/api";

export default function Bookings(){
  const [rows,setRows]=useState([]);
  const load=()=>api.get("/bookings").then(r=>setRows(r.data));
  useEffect(()=>{load();},[]);

  const change=async(id,status)=>{
    await api.post(`/bookings/${id}/status`,{status});
    load();
  };

  return <>
    <div className="mb-3"><h2 className="mb-1">Bookings</h2><p className="text-muted">Manage the complete trip workflow</p></div>
    <div className="row g-3">
      {rows.map(b=><div className="col-12 col-xl-6" key={b.id}>
        <div className="card card-soft h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div><h5 className="mb-1">{b.bookingNo}</h5><small className="text-muted">{b.Customer?.name || "Customer"}</small></div>
              <span className="status-pill">{b.status}</span>
            </div>
            <div className="row g-2 small">
              <div className="col-12"><i className="bi bi-geo-alt me-2"></i>{b.pickupLocation}</div>
              <div className="col-12"><i className="bi bi-flag me-2"></i>{b.dropLocation}</div>
              <div className="col-6"><i className="bi bi-calendar me-2"></i>{b.pickupDate}</div>
              <div className="col-6"><i className="bi bi-clock me-2"></i>{b.pickupTime}</div>
              <div className="col-6"><i className="bi bi-person me-2"></i>{b.Driver?.name || "Unassigned"}</div>
              <div className="col-6"><i className="bi bi-currency-rupee me-2"></i>{b.fare}</div>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3">
              {b.status==="ASSIGNED" && <button className="btn btn-sm btn-primary touch-btn" onClick={()=>change(b.id,"ACCEPTED")}>Accept</button>}
              {["ASSIGNED","ACCEPTED"].includes(b.status) && <button className="btn btn-sm btn-success touch-btn" onClick={()=>change(b.id,"STARTED")}>Start</button>}
              {b.status==="STARTED" && <button className="btn btn-sm btn-dark touch-btn" onClick={()=>change(b.id,"COMPLETED")}>Complete</button>}
              <a className="btn btn-sm btn-outline-secondary touch-btn" href={`/api/invoices/${b.id}/pdf`} target="_blank">Invoice</a>
            </div>
          </div>
        </div>
      </div>)}
    </div>
  </>;
}
