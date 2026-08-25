import { useState } from "react";
import api from "../services/api";

export default function CustomerPortal(){
  const [bookingId,setBookingId]=useState("");
  const [rating,setRating]=useState(5);
  const [comment,setComment]=useState("");

  const submit=async e=>{
    e.preventDefault();
    try{
      await api.post("/ratings",{bookingId:Number(bookingId),rating:Number(rating),comment});
      alert("Thank you. Your rating has been submitted.");
      setComment("");
    }catch(err){ alert(err.response?.data?.message || "Unable to submit rating"); }
  };

  return <div className="container py-4">
    <div className="mb-3"><h2>Customer Portal</h2><p className="text-muted">Mobile-friendly customer self-service</p></div>
    <div className="card card-soft">
      <div className="card-body">
        <h5>Rate a completed trip</h5>
        <form onSubmit={submit} className="row g-3">
          <div className="col-12 col-md-5"><input className="form-control" placeholder="Booking ID" value={bookingId} onChange={e=>setBookingId(e.target.value)} required/></div>
          <div className="col-12 col-md-4"><select className="form-select" value={rating} onChange={e=>setRating(e.target.value)}>
            {[5,4,3,2,1].map(x=><option key={x} value={x}>{x} Star{x>1?"s":""}</option>)}
          </select></div>
          <div className="col-12"><textarea className="form-control" rows="4" placeholder="Comment" value={comment} onChange={e=>setComment(e.target.value)}/></div>
          <div className="col-12"><button className="btn btn-primary w-100 touch-btn">Submit Rating</button></div>
        </form>
      </div>
    </div>
  </div>;
}
