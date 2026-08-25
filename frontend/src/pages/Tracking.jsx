import { useEffect,useState } from "react";
import api from "../services/api";
import { socket } from "../services/socket";

export default function Tracking(){
  const [driverId,setDriverId]=useState("");
  const [location,setLocation]=useState(null);

  useEffect(()=>{
    socket.connect();
    const handler = loc => setLocation(loc);
    socket.on("driver:location",handler);
    return ()=>{ socket.off("driver:location",handler); socket.disconnect(); };
  },[]);

  const locate=async()=>{
    if(!driverId) return;
    try { const {data}=await api.get(`/tracking/${driverId}`); setLocation(data); }
    catch { alert("Driver location not available"); }
  };

  return <>
    <div className="mb-3"><h2 className="mb-1">Live Tracking</h2><p className="text-muted">Real-time tracking interface using Socket.IO</p></div>
    <div className="card card-soft mb-3"><div className="card-body">
      <div className="row g-2">
        <div className="col-8 col-md-4"><input className="form-control" placeholder="Driver ID" value={driverId} onChange={e=>setDriverId(e.target.value)}/></div>
        <div className="col-4 col-md-2"><button className="btn btn-primary w-100 touch-btn" onClick={locate}>Locate</button></div>
      </div>
    </div></div>
    <div className="map-placeholder card-soft p-4">
      {location ? <div>
        <i className="bi bi-geo-alt-fill fs-1 text-danger"></i>
        <h5 className="mt-2">Driver #{location.driverId}</h5>
        <div>Latitude: {location.latitude}</div>
        <div>Longitude: {location.longitude}</div>
        <small className="text-muted">Google Maps or Mapbox can be connected here for the map layer.</small>
      </div> :
      <div><i className="bi bi-map fs-1"></i><h5 className="mt-2">No driver selected</h5></div>}
    </div>
  </>;
}
