export default function KpiCard({title,value,icon}) {
  return <div className="col-6 col-md-4 col-xl-3">
    <div className="card card-soft h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between gap-2">
          <div><small className="text-muted">{title}</small><h4 className="mt-2 mb-0">{value}</h4></div>
          <div className="kpi-icon"><i className={`bi ${icon}`}></i></div>
        </div>
      </div>
    </div>
  </div>;
}
