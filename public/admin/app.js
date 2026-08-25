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

async function crudPage(title, endpoint, fields) {
  const rows = await api(endpoint);
  page.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>${title}</h2><button class="btn btn-primary" onclick="showCreate('${endpoint}','${title}')"><i class="bi bi-plus"></i> Add</button>
    </div>
    <div class="card border-0 shadow-sm"><div class="card-body table-responsive">
      <table class="table table-hover"><thead><tr>${fields.map(f=>`<th>${f}</th>`).join("")}<th>Action</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>${fields.map(f=>`<td>${r[f] ?? ""}</td>`).join("")}
      <td><button class="btn btn-sm btn-outline-danger" onclick="removeRow('${endpoint}',${r.id},'${title}')">Delete</button></td></tr>`).join("")}</tbody>
      </table>
    </div></div>`;
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
  page.innerHTML = `<h2 class="mb-3">New Booking</h2><div class="card border-0 shadow-sm"><div class="card-body">
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

if (token) showApp();

async function reports(){const x=await api("/reports/summary");page.innerHTML=`<h2>Reports</h2><div class="row g-3">${kpi("Bookings",x.bookings,"bi-calendar-check")}${kpi("Revenue","₹"+x.revenue.toFixed(2),"bi-currency-rupee")}${kpi("Driver Earnings","₹"+x.driverNetEarnings.toFixed(2),"bi-wallet2")}</div><div class="card mt-4 border-0 shadow-sm"><div class="card-body"><a href="/api-docs" target="_blank">Swagger API Documentation</a></div></div>`;}
