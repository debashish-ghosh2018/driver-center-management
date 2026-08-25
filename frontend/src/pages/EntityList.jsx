import { useEffect,useState } from "react";
import api from "../services/api";

export default function EntityList({title,endpoint,columns}){
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const load=()=> {
    setLoading(true);
    api.get(endpoint).then(r=>setRows(r.data)).finally(()=>setLoading(false));
  };
  useEffect(load,[endpoint]);

  const remove=async id=>{
    if(!confirm("Delete this record?")) return;
    await api.delete(`${endpoint}/${id}`);
    load();
  };

  return <>
    <div className="mb-3"><h2 className="mb-1">{title}</h2><p className="text-muted mb-0">Manage {title.toLowerCase()}</p></div>
    <div className="card card-soft">
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light"><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}<th></th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={columns.length+1} className="text-center p-4">Loading...</td></tr>}
              {!loading && rows.map(r=><tr key={r.id}>
                {columns.map(c=><td key={c.key}>{r[c.key] ?? "-"}</td>)}
                <td className="text-end"><button className="btn btn-sm btn-outline-danger" onClick={()=>remove(r.id)}><i className="bi bi-trash"/></button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>;
}
