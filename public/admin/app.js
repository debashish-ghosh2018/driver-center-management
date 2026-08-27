const API = "/api";
let token = localStorage.getItem("dc_token");

const page = document.getElementById("page");
const loginView = document.getElementById("loginView");
const appView = document.getElementById("appView");

function showApp() {
  loginView.classList.add("d-none");
  appView.classList.remove("d-none");
  loadPage("dashboard");
}

function showLogin() {
  loginView.classList.remove("d-none");
  appView.classList.add("d-none");
}

async function api(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });
    token = data.token;
    localStorage.setItem("dc_token", token);
    showApp();
  } catch (err) {
    const el = document.getElementById("loginError");
    el.textContent = err.message;
    el.classList.remove("d-none");
  }
});

document.getElementById("logout").addEventListener("click", e => {
  e.preventDefault();
  localStorage.removeItem("dc_token");
  token = null;
  showLogin();
});

document.querySelectorAll("[data-page]").forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll("[data-page]").forEach(x => x.classList.remove("active"));
    a.classList.add("active");
    loadPage(a.dataset.page);
  });
});

async function loadPage(name) {
  try {
    if (name === "dashboard") return dashboard();
    if (name === "customers") return crudPage("Customers", "/customers", ["name","mobile","email","city","status"]);
    if (name === "drivers") return crudPage("Drivers", "/drivers", ["driverCode","name","mobile","licenseNo","availability","status","rating"]);
    if (name === "vehicles") return crudPage("Vehicles", "/vehicles", ["vehicleNo","vehicleType","brand","model","status"]);
    if (name === "bookings") return bookings();
    if (name === "payments") return crudPage("Payments", "/payments", ["bookingId","amount","paymentMode","paymentStatus","paymentDate"]);
    if (name === "reports") return reports();
    if (name === "users") return usersPage();
    if (name === "acl") return aclPage();
  } catch (e) {
    page.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

async function dashboard() {
  const d = await api("/dashboard");
  page.innerHTML = `
    <div class="d-flex justify-content-between mb-4"><h2>Dashboard</h2><span class="text-muted">${new Date().toLocaleString()}</span></div>
    <div class="row g-3">
      ${kpi("Customers", d.customers, "bi-people")}
      ${kpi("Drivers", d.drivers, "bi-person-badge")}
      ${kpi("Available Drivers", d.availableDrivers, "bi-person-check")}
      ${kpi("Vehicles", d.vehicles, "bi-car-front")}
      ${kpi("Pending Bookings", d.pendingBookings, "bi-hourglass-split")}
      ${kpi("Active Bookings", d.activeBookings, "bi-calendar-check")}
      ${kpi("Completed Trips", d.completedBookings, "bi-check-circle")}
      ${kpi("Revenue", "₹" + d.revenue.toFixed(2), "bi-currency-rupee")}
    </div>`;
}

function kpi(title, value, icon) {
  return `<div class="col-md-3"><div class="card card-kpi shadow-sm"><div class="card-body">
    <div class="d-flex justify-content-between"><div><small class="text-muted">${title}</small><h3 class="mt-2">${value}</h3></div>
    <i class="bi ${icon} fs-1 text-primary"></i></div></div></div></div>`;
}

function dcLabelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, s => s.toUpperCase());
}

function dcEscape(value) {
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function dcFields(title) {
  if (title === "Customers") return [
    {name:"name",required:true},
    {name:"mobile",required:true},
    {name:"email",type:"email"},
    {name:"address",type:"textarea"},
    {name:"city"},
    {name:"state"},
    {name:"pincode"},
    {name:"status",type:"select",options:["ACTIVE","INACTIVE"]}
  ];
  if (title === "Drivers") return [
    {name:"name",required:true},
    {name:"mobile",required:true},
    {name:"email",type:"email"},
    {name:"address",type:"textarea"},
    {name:"licenseNo",required:true},
    {name:"licenseExpiry",type:"date"},
    {name:"experienceYears",type:"number",step:"0.1"},
    {name:"availability",type:"select",options:["AVAILABLE","BUSY","OFFLINE"]},
    {name:"status",type:"select",options:["ACTIVE","INACTIVE","SUSPENDED"]}
  ];
  if (title === "Vehicles") return [
    {name:"vehicleNo",required:true},
    {name:"vehicleType",required:true},
    {name:"brand"},{name:"model"},
    {name:"year",type:"number"},
    {name:"insuranceExpiry",type:"date"},
    {name:"fitnessExpiry",type:"date"},
    {name:"status",type:"select",options:["ACTIVE","INACTIVE","MAINTENANCE"]}
  ];
  if (title === "Payments") return [
    {name:"bookingId",required:true},
    {name:"amount",required:true},
    {name:"paymentMode",required:true,type:"select",options:["CASH","UPI","CARD","BANK_TRANSFER"]},
    {name:"paymentStatus",required:true,type:"select",options:["PENDING","PAID","FAILED","REFUNDED"]},
    {name:"paymentDate",required:true,type:"date"}
  ];

  return [];
}

function dcRenderField(field, value) {
  const label = dcLabelize(field.name);
  if (field.type === "select") {
    return `<div class="col-md-6"><label class="form-label">${label}</label>
      <select class="form-select" name="${field.name}" ${field.required?"required":""}>
        <option value="">Select ${label}</option>
        ${field.options.map(o=>`<option value="${o}" ${String(value??"")===o?"selected":""}>${dcLabelize(o)}</option>`).join("")}
      </select></div>`;
  }
  if (field.type === "textarea") {
    return `<div class="col-12"><label class="form-label">${label}</label>
      <textarea class="form-control" rows="3" name="${field.name}">${dcEscape(value)}</textarea></div>`;
  }
  return `<div class="col-md-6"><label class="form-label">${label}</label>
    <input class="form-control" name="${field.name}" type="${field.type||"text"}"
      ${field.step?`step="${field.step}"`:""} value="${dcEscape(value)}" ${field.required?"required":""}></div>`;
}

async function crudPage(title, endpoint, fields) {
  const rows = await api(endpoint);

  page.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div><h2 class="mb-1">${title}</h2><p class="text-muted mb-0">Super Admin record management</p></div>
      <button id="dcAddBtn" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Add</button>
    </div>
    <div class="card border-0 shadow-sm"><div class="card-body table-responsive">
      <table class="table table-hover align-middle">
        <thead><tr>${fields.map(f=>`<th>${dcLabelize(f)}</th>`).join("")}<th class="text-end">Actions</th></tr></thead>
        <tbody>
          ${rows.length ? rows.map(r=>`
            <tr>
              ${fields.map(f=>`<td>${dcEscape(r[f])}</td>`).join("")}
              <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-outline-primary me-1 dc-edit" data-id="${r.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                <button class="btn btn-sm btn-outline-danger dc-delete" data-id="${r.id}"><i class="bi bi-trash"></i> Delete</button>
              </td>
            </tr>`).join("") : `<tr><td colspan="${fields.length+1}" class="text-center text-muted py-4">No records found</td></tr>`}
        </tbody>
      </table>
    </div></div>`;

  document.getElementById("dcAddBtn").addEventListener("click",()=>dcRecordForm(endpoint,title));
  document.querySelectorAll(".dc-edit").forEach(b=>b.addEventListener("click",()=>dcRecordForm(endpoint,title,Number(b.dataset.id))));
  document.querySelectorAll(".dc-delete").forEach(b=>b.addEventListener("click",()=>removeRow(endpoint,Number(b.dataset.id),title)));
}

async function dcRecordForm(endpoint,title,id=null) {
  const editing = !!id;
  let record = {};
  if (editing) record = await api(`${endpoint}/${id}`);

  page.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div><h2 class="mb-1">${editing?"Edit":"Add"} ${title.slice(0,-1)}</h2>
      <p class="text-muted mb-0">${editing?`Updating record #${id}`:"Create new record"}</p></div>
      <button id="dcBackBtn" class="btn btn-outline-secondary">Back</button>
    </div>
    <div class="card border-0 shadow-sm"><div class="card-body">
      <form id="dcRecordForm" class="row g-3">
        ${dcFields(title).map(f=>dcRenderField(f,record[f.name])).join("")}
        <div class="col-12"><button class="btn btn-primary">${editing?"Update":"Create"} Record</button></div>
      </form>
    </div></div>`;

  document.getElementById("dcBackBtn").addEventListener("click",()=>loadPage(title.toLowerCase()));
  document.getElementById("dcRecordForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    Object.keys(body).forEach(k=>{ if(body[k]==="") body[k]=null; });
    await api(editing?`${endpoint}/${id}`:endpoint,{
      method: editing?"PUT":"POST",
      body: JSON.stringify(body)
    });
    await loadPage(title.toLowerCase());
  });
}

async function removeRow(endpoint,id,title) {
  if(!confirm(`Delete ${title.slice(0,-1)} #${id}?`)) return;
  await api(`${endpoint}/${id}`,{method:"DELETE"});
  await loadPage(title.toLowerCase());
}

async function showCreate(endpoint, title) {
  // const fields = title === "Customers" ? ["name","mobile","email","address","city","state","pincode"] : title === "Drivers" ? ["name","mobile","email","address","licenseNo","licenseExpiry","experienceYears"] : ["vehicleNo","vehicleType","brand","model","year","insuranceExpiry","fitnessExpiry"];

  // console.log(title);
  let fields = [];
  if(title === "Customers"){
    fields = ["name","mobile","email","address","city","state","pincode"];
  } else if(title === "Drivers") {
    fields = ["name","mobile","email","address","licenseNo","licenseExpiry","experienceYears"];
  } else if(title === "Vehicles") {
    fields = ["vehicleNo","vehicleType","brand","model","year","insuranceExpiry","fitnessExpiry"];
  } else if(title === "Payments") {
    fields = ["bookingId","amount","paymentMode","paymentStatus","paymentDate"];
  }
  //console.log(fields);

  if(title === "Payments"){

    // Find the index of the element
    const index = fields.indexOf('bookingId');

    // Ensure the element exists before trying to remove it
    if (index > -1) {
      fields.splice(index, 1); // 2nd parameter (1) means remove exactly one item
    }

    const bookings = await api("/bookings?status=STARTED");
    
    page.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2>Add ${title}</h2>
    <button class="btn btn-secondary" onclick="loadPage('${title.toLowerCase()}')">Back</button></div>
    <div class="card border-0 shadow-sm"><div class="card-body"><form id="createForm" class="row g-3"><div class="col-md-6"><label>Booking</label><select class="form-select" name="bookingId">${bookings.map(b => `<option value="${b.id}">${b.bookingNo}</option>`).join("")}</select></div>
    ${fields.map(f => `<div class="col-md-6"><label class="form-label">${f}</label><input class="form-control" name="${f}" ${f.includes("Date")||f.toLowerCase().includes("expiry")?'type="date"':''}></div>`).join("")}
    <div class="col-12"><button class="btn btn-primary">Save</button></div></form></div></div>`;
  } else {
    page.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2>Add ${title}</h2>
    <button class="btn btn-secondary" onclick="loadPage('${title.toLowerCase()}')">Back</button></div>
    <div class="card border-0 shadow-sm"><div class="card-body"><form id="createForm" class="row g-3">
    ${fields.map(f => `<div class="col-md-6"><label class="form-label">${f}</label><input class="form-control" name="${f}" ${f.includes("Date")||f.toLowerCase().includes("expiry")?'type="date"':''}></div>`).join("")}
    <div class="col-12"><button class="btn btn-primary">Save</button></div></form></div></div>`;
  }

  document.getElementById("createForm").addEventListener("submit", async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target).entries());
    try {
      await api(endpoint, { method: "POST", body: JSON.stringify(body) });
      await loadPage(title.toLowerCase());
    } catch(err) { alert(err.message); }
  });
}

async function removeRow(endpoint, id, title) {
  if (!confirm("Delete this record?")) return;
  await api(`${endpoint}/${id}`, { method: "DELETE" });
  loadPage(title.toLowerCase());
}

async function bookings() {
  const rows = await api("/bookings");
  page.innerHTML = `
    <div class="d-flex justify-content-between mb-3"><h2>Bookings</h2>
      <button class="btn btn-primary" onclick="newBooking()">New Booking</button></div>
    <div class="card border-0 shadow-sm"><div class="card-body table-responsive">
    <table class="table table-hover"><thead><tr><th>No</th><th>Customer</th><th>Driver</th><th>Pickup</th><th>Drop</th><th>Date</th><th>Fare</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td>${r.bookingNo}</td><td>${r.Customer?.name||""}</td><td>${r.Driver?.name||"Unassigned"}</td>
      <td>${r.pickupLocation}</td><td>${r.dropLocation}</td><td>${r.pickupDate}</td><td>₹${r.fare}</td>
      <td><span class="badge text-bg-secondary">${r.status}</span></td>
      <td><button class="btn btn-sm btn-outline-primary" onclick="assign(${r.id})">Assign</button></td>
    </tr>`).join("")}</tbody></table></div></div>`;
}

async function newBooking() {
  const customers = await api("/customers");
  page.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2 class="mb-3">New Booking sssss</h2><button class="btn btn-secondary" onclick="loadPage('bookings')">Back</button></div><div class="card border-0 shadow-sm"><div class="card-body">
    <form id="bookingForm" class="row g-3">
      <div class="col-md-6"><label>Customer</label><select class="form-select" name="customerId">${customers.map(c=>`<option value="${c.id}">${c.name} - ${c.mobile}</option>`).join("")}</select></div>
      <div class="col-md-6"><label>Vehicle Type</label><input class="form-control" name="vehicleType"></div>
      <div class="col-md-6"><label>Pickup</label><input class="form-control" name="pickupLocation" required></div>
      <div class="col-md-6"><label>Drop</label><input class="form-control" name="dropLocation" required></div>
      <div class="col-md-3"><label>Date</label><input type="date" class="form-control" name="pickupDate" required></div>
      <div class="col-md-3"><label>Time</label><input type="time" class="form-control" name="pickupTime" required></div>
      <div class="col-md-3"><label>Fare</label><input type="number" step="0.01" class="form-control" name="fare"></div>
      <div class="col-12"><label>Remarks</label><textarea class="form-control" name="remarks"></textarea></div>
      <div class="col-12"><button class="btn btn-primary">Create Booking</button></div>
    </form></div></div>`;

  document.getElementById("bookingForm").addEventListener("submit", async e => {
    e.preventDefault();
    try {
      await api("/bookings", { method:"POST", body:JSON.stringify(Object.fromEntries(new FormData(e.target).entries())) });
      bookings();
    } catch(err) { alert(err.message); }
  });
}

async function editBooking(id) {
  const b = await api(`/bookings/${id}`);
  page.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div><h2 class="mb-1">Edit Booking</h2><p class="text-muted mb-0">${dcEscape(b.bookingNo)}</p></div>
      <button id="dcBookingBack" class="btn btn-outline-secondary">Back</button>
    </div>
    <div class="card border-0 shadow-sm"><div class="card-body">
      <form id="dcBookingForm" class="row g-3">
        <div class="col-md-6"><label class="form-label">Pickup Location</label><input class="form-control" name="pickupLocation" value="${dcEscape(b.pickupLocation)}" required></div>
        <div class="col-md-6"><label class="form-label">Drop Location</label><input class="form-control" name="dropLocation" value="${dcEscape(b.dropLocation)}" required></div>
        <div class="col-md-4"><label class="form-label">Pickup Date</label><input type="date" class="form-control" name="pickupDate" value="${dcEscape(b.pickupDate)}" required></div>
        <div class="col-md-4"><label class="form-label">Pickup Time</label><input type="time" class="form-control" name="pickupTime" value="${dcEscape(String(b.pickupTime||"").slice(0,5))}" required></div>
        <div class="col-md-4"><label class="form-label">Fare</label><input type="number" step="0.01" class="form-control" name="fare" value="${dcEscape(b.fare)}"></div>
        <div class="col-md-6"><label class="form-label">Vehicle Type</label><input class="form-control" name="vehicleType" value="${dcEscape(b.vehicleType)}"></div>
        <div class="col-md-6"><label class="form-label">Booking Type</label>
          <select class="form-select" name="bookingType">
            ${["ONE_WAY","ROUND_TRIP","HOURLY"].map(x=>`<option value="${x}" ${b.bookingType===x?"selected":""}>${x}</option>`).join("")}
          </select></div>
        <div class="col-12"><label class="form-label">Remarks</label><textarea class="form-control" name="remarks" rows="3">${dcEscape(b.remarks)}</textarea></div>
        <div class="col-12"><button class="btn btn-primary">Update Booking</button></div>
      </form>
    </div></div>`;

  document.getElementById("dcBookingBack").addEventListener("click",bookings);
  document.getElementById("dcBookingForm").addEventListener("submit",async e=>{
    e.preventDefault();
    await api(`/bookings/${id}`,{method:"PUT",body:JSON.stringify(Object.fromEntries(new FormData(e.target).entries()))});
    await bookings();
  });
}

async function assign(id) {
  const drivers = await api("/drivers?status=ACTIVE");
  const available = drivers.filter(d => d.availability === "AVAILABLE");
  if (!available.length) return alert("No available drivers.");
  const name = prompt("Enter driver ID:\n" + available.map(d => `${d.id}: ${d.name}`).join("\n"));
  if (!name) return;
  try {
    await api(`/bookings/${id}/assign-driver`, { method:"POST", body:JSON.stringify({driverId:Number(name)}) });
    bookings();
  } catch(err) { alert(err.message); }
}

// ===== User Management + ACL =====
async function usersPage(){
  const rows = await api("/admin/users");
  page.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3"><div><h2>Users</h2><p class="text-muted mb-0">Manage system accounts and roles</p></div><button class="btn btn-primary" id="userAdd">Add User</button></div><div class="card border-0 shadow-sm"><div class="card-body table-responsive"><table class="table table-hover"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td>${dcEscape(r.name)}</td><td>${dcEscape(r.email)}</td><td>${dcEscape(r.role)}</td><td>${dcEscape(r.status)}</td><td class="text-end"><button class="btn btn-sm btn-outline-primary me-1 uedit" data-id="${r.id}">Edit</button><button class="btn btn-sm btn-outline-danger udel" data-id="${r.id}">Delete</button></td></tr>`).join("")}</tbody></table></div></div>`;

  document.getElementById("userAdd").addEventListener("click",() => userForm());
  document.querySelectorAll(".uedit").forEach(b => b.addEventListener("click",() => userForm(Number(b.dataset.id))));
  document.querySelectorAll(".udel").forEach(b => b.addEventListener("click",async() => {
    if(confirm("Delete this user?")){
      await api(`/admin/users/${b.dataset.id}`,{method:"DELETE"});
      usersPage();
    }
  }));
}

async function userForm(id = null) {
    const editing = !!id,
        u = editing ? await api(`/admin/users/${id}`) : {};
    page.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2>${editing?"Edit":"Add"} User</h2><button class="btn btn-outline-secondary" id="uback">Back</button></div><div id="uerr" class="alert alert-danger d-none"></div><div class="card border-0 shadow-sm"><div class="card-body"><form id="uf" class="row g-3" novalidate><div class="col-md-6"><label class="form-label">Name</label><input class="form-control" name="name" value="${dcEscape(u.name)}" required minlength="2"></div><div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" name="email" value="${dcEscape(u.email)}" required></div><div class="col-md-6"><label class="form-label">Password</label><input type="password" class="form-control" name="password" ${editing?"":"required minlength=8"}></div><div class="col-md-3"><label class="form-label">Role</label><select class="form-select" name="role">${["SUPER_ADMIN","ADMIN","MANAGER","STAFF","DRIVER","CUSTOMER"].map(x=>`<option ${u.role===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="col-md-3"><label class="form-label">Status</label><select class="form-select" name="status">${["ACTIVE","INACTIVE"].map(x=>`<option ${u.status===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="col-12"><button class="btn btn-primary">Save User</button></div></form></div></div>`;
    document.getElementById("uback").addEventListener("click", usersPage);
    document.getElementById("uf").addEventListener("submit", async e => {
        e.preventDefault();
        if (!e.target.checkValidity()) {
            e.target.classList.add("was-validated");
            return;
        }
        const body = Object.fromEntries(new FormData(e.target).entries());
        if (editing && !body.password) delete body.password;
        try {
            await api(editing ? `/admin/users/${id}` : "/admin/users", {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify(body)
            });
            usersPage();
        } catch (err) {
            const x = document.getElementById("uerr");
            x.textContent = err.message;
            x.classList.remove("d-none");
        }
    });
}

async function aclPage() {
    const data = await api("/admin/acl"),
        roles = ["ADMIN", "MANAGER", "STAFF"],
        group = {};

    data.permissions.forEach(p => (group[p.module] ??= []).push(p));
    page.innerHTML = `<div class="mb-3"><h2>Access Control</h2><p class="text-muted">Configure permissions by role. Super Admin always has full access.</p></div>${roles.map(role=>`<div class="card border-0 shadow-sm mb-3"><div class="card-body"><h5>${role}</h5><form class="aclf" data-role="${role}">${Object.entries(group).map(([m,ps])=>`<div class="mb-3"><h6>${m}</h6><div class="row">${ps.map(p=>`<div class="col-md-4"><label class="form-check"><input class="form-check-input" type="checkbox" value="${p.id}" ${data.mappings.some(x=>x.role===role&&x.permissionId===p.id)?"checked":""}><span class="form-check-label">${dcEscape(p.name)}</span></label></div>`).join("")}</div></div>`).join("")}<button class="btn btn-primary">Save ${role}</button></form></div></div>`).join("")}`;

    document.querySelectorAll(".aclf").forEach(f => f.addEventListener("submit", async e => {
        e.preventDefault();
        const ids = [...f.querySelectorAll("input:checked")].map(x => Number(x.value));
        await api("/admin/acl", {
            method: "POST",
            body: JSON.stringify({
                role: f.dataset.role,
                permissionIds: ids
            })
        });
        alert("Permissions updated");
    }));
}

if (token) showApp();

async function reports() {
    const x = await api("/reports/summary");
    page.innerHTML = `<h2>Reports</h2><div class="row g-3">${kpi("Bookings",x.bookings,"bi-calendar-check")}${kpi("Revenue","₹"+x.revenue.toFixed(2),"bi-currency-rupee")}${kpi("Driver Earnings","₹"+x.driverNetEarnings.toFixed(2),"bi-wallet2")}</div><div class="card mt-4 border-0 shadow-sm"><div class="card-body"><a href="/api-docs" target="_blank">Swagger API Documentation</a></div></div>`;
}
