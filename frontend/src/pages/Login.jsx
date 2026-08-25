import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login(){
  const {login}=useAuth();
  const [email,setEmail]=useState("admin@drivercenter.local");
  const [password,setPassword]=useState("Admin@12345");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const submit=async e=>{
    e.preventDefault(); setLoading(true); setError("");
    try { await login(email,password); }
    catch(err){ setError(err.response?.data?.message || "Unable to sign in"); }
    finally { setLoading(false); }
  };

  return <div className="login-wrap d-flex align-items-center">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-7 col-lg-5">
          <div className="card card-soft">
            <div className="card-body p-4 p-lg-5">
              <div className="text-center mb-4">
                <div className="kpi-icon mx-auto mb-3"><i className="bi bi-car-front"></i></div>
                <h3>Driver Center</h3>
                <p className="text-muted">Operations management portal</p>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={submit}>
                <label className="form-label">Email</label>
                <input className="form-control form-control-lg mb-3" value={email} onChange={e=>setEmail(e.target.value)} />
                <label className="form-label">Password</label>
                <input type="password" className="form-control form-control-lg mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
                <button className="btn btn-primary btn-lg w-100 touch-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
