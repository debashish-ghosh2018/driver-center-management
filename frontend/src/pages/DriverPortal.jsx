import { useState } from "react";
import api from "../services/api";

export default function DriverPortal(){
  const [message,setMessage]=useState("");

  const shareLocation=()=>{
    if(!navigator.geolocation) return setMessage("Geolocation is not supported on this device.");
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        await api.post("/tracking/location",{
          latitude:pos.coords.latitude,
          longitude:pos.coords.longitude,
          accuracy:pos.coords.accuracy
        });
        setMessage("Current location shared successfully.");
      }catch{
        setMessage("Unable to send the location.");
      }
    },()=>setMessage("Unable to read the device location."));
  };

  return <div className="container py-4">
    <div className="mb-3"><h2>Driver Portal</h2><p className="text-muted">Mobile driver interface</p></div>
    <div className="card card-soft">
      <div className="card-body">
        <h5><i className="bi bi-geo-alt me-2"></i>Live Location</h5>
        <p className="text-muted">Share your latest GPS position with dispatch.</p>
        <button className="btn btn-primary w-100 touch-btn" onClick={shareLocation}>Share Current Location</button>
        {message && <div className="alert alert-light mt-3 mb-0">{message}</div>}
      </div>
    </div>
  </div>;
}
