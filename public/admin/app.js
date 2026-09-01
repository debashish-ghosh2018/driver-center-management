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

//document.getElementById("logout").addEventListener("click", e => {
//  e.preventDefault();
//  localStorage.removeItem("dc_token");
//  token = null;
//  showLogin();
//});

//document.querySelectorAll("[data-page]").forEach(a => {
//  a.addEventListener("click", e => {
//    e.preventDefault();

//    document.querySelectorAll("[data-page]").forEach(x => x.classList.remove("active"));
//    a.classList.add("active");
//    loadPage(a.dataset.page);
//  });
//});


/*
 * ==========================================
 * Admin Navigation
 * ==========================================
 */
document.querySelectorAll(".admin-nav").forEach(item => {
  item.addEventListener("click", async () => {
    const pageName = item.dataset.page;

    /*
     * Update active menu
     */
    document.querySelectorAll(".admin-nav").forEach(nav => {
      nav.classList.remove("active");
      if (nav.dataset.page === pageName) {
        nav.classList.add("active");
      }
    });

    /*
     * Close mobile sidebar
     */
    const mobileSidebar = document.getElementById("mobileSidebar");
    if (mobileSidebar) {
      const instance = bootstrap.Offcanvas.getInstance(mobileSidebar);
      if (instance) {
        instance.hide();
      }
    }

    /*
     * Load selected page
     */
    await loadPage(pageName);
  });
});


/*
 * ==========================================
 * Change Password
 * ==========================================
 */
document.querySelectorAll(".change-password-menu").forEach(button => {
  button.addEventListener("click",() => {
    document.querySelectorAll(".admin-nav").forEach(nav => {
      nav.classList.remove("active");
    });

    changePasswordForm();
  });
});

/*
 * ==========================================
 * Mobile logo -> Dashboard
 * ==========================================
 */
const mobileDashboardLink = document.getElementById("mobileDashboardLink");
if (mobileDashboardLink) {
  mobileDashboardLink.addEventListener("click", event => { 
    event.preventDefault(); 
    loadPage( "dashboard");
  });
}

/*
 * ==========================================
 * Logout
 * ==========================================
 */
const logoutModalElement = document.getElementById("logoutModal");
const logoutModal = new bootstrap.Modal(logoutModalElement);

document.querySelectorAll(".logout-btn").forEach(button => {
  button.addEventListener("click", () => {
    logoutModal.show();
  });
});

document.getElementById("confirmLogoutBtn").addEventListener("click", () => {
  /*
   * Change the key if your application
   * stores JWT under a different name.
   */
  //localStorage.removeItem("token");
  //localStorage.removeItem("user");

  logoutModal.hide();
  
  localStorage.removeItem("dc_token");
  token = null;
  showLogin();
});


async function loadPage(name) {
  try {
    if (name === "dashboard") return dashboard();
    if (name === "customers") return customersPage();   //crudPage("Customers", "/customers", ["name","mobile","email","city","status"]);
    if (name === "drivers") return driversPage();   //crudPage("Drivers", "/drivers", ["driverCode","name","mobile","licenseNo","availability","status","rating"]);
    if (name === "vehicles") return crudPage("Vehicles", "/vehicles?isDeleted=0", ["vehicleNo","vehicleType","brand","model","status"]);
    if (name === "bookings") return bookings();
    if (name === "payments") return crudPage("Payments", "/payments", ["bookingId","amount","paymentMode","paymentStatus","paymentDate"]);
    if (name === "reports") return reports();
    if (name === "users") return usersPage();
    if (name === "acl") return aclPage();
    if (name === "change-password") return changePasswordPage();
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

async function customersPage() {
  const [customers, users] = await Promise.all([api("/customers?isDeleted=0"), api("/admin/users")]);
  const userMap = new Map();

  users.forEach(user => {
    if (user.customerProfile) {
      userMap.set(
        user.customerProfile.id,
        user
      );
    }
  });

  page.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="mb-1">Customers</h2><p class="text-muted mb-0">Manage customer profiles and login accounts</p></div><button class="btn btn-primary" id="addCustomerBtn"><i class="bi bi-plus-lg me-1"></i>Add Customer</button></div><div class="card border-0 shadow-sm"><div class="card-body table-responsive"><table class="table table-hover align-middle"><thead><tr><th>Customer Code</th><th>Name</th><th>Mobile</th><th>City</th><th>Status</th><th>Login Account</th><th class="text-end">Actions</th></tr></thead><tbody>${ customers.map(customer => { const linkedUser =userMap.get(customer.id); return `<tr><td> ${dcEscape(customer.customerCode)} </td><td> ${dcEscape( customer.name )} </td><td> ${dcEscape(customer.mobile)} </td><td> ${dcEscape(customer.city)} </td><td><span class="badge ${ customer.status === "ACTIVE" ? "text-bg-success" : "text-bg-secondary" }"> ${dcEscape(customer.status)} </span></td><td> ${ linkedUser ? `<div><strong> ${dcEscape( linkedUser.email )} </strong></div><small class="text-muted"> ${dcEscape(linkedUser.status)} </small>` : `<span class="badge text-bg-warning">No Account</span>` }</td><td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary customer-edit" data-id="${customer.id}"><i class="bi bi-pencil-square"></i>Edit</button> <button class="btn btn-sm btn-outline-danger customer-delete" data-id="${customer.id}"><i class="bi bi-trash"></i> Delete</button> ${ linkedUser ? `<button class="btn btn-sm btn-outline-dark customer-user-manage" data-user-id="${linkedUser.id}"><i class="bi bi-person-gear"></i>Manage Login</button>` : `<button class="btn btn-sm btn-outline-success customer-user-create" data-customer-id="${customer.id}"><i class="bi bi-person-plus"></i>Create Login</button>` } </td></tr>`; }).join("") } </tbody></table></div></div>`;

  document.getElementById("addCustomerBtn").addEventListener("click", () => { customerForm(); });
  document.querySelectorAll(".customer-edit").forEach(button => { 
    button.addEventListener("click", () => { 
      customerForm( Number(button.dataset.id));
    });
  });

  document.querySelectorAll(".customer-delete").forEach(button => { 
    button.addEventListener("click", () => { 
      removeCustomer(Number(button.dataset.id));
    });
  });  

  document.querySelectorAll(".customer-user-create").forEach(button => {
    button.addEventListener("click", () => {
      createCustomerLoginForm(Number(button.dataset.customerId));
    });
  });

  document.querySelectorAll(".customer-user-manage").forEach(button => {
    button.addEventListener("click", () => {
      userForm(Number(button.dataset.userId));
    });
  });
}

async function removeCustomer(id) {
  if (!confirm("Delete this customer record ?")) return;
  await api(`/customers/${id}`, {method: "DELETE"});
  loadPage('customers');
}

async function driversPage() {
  const [drivers, users] = await Promise.all([ api("/drivers?isDeleted=0"), api("/admin/users") ]);
  const userMap = new Map();

  users.forEach(user => {
    if (user.driverProfile) {
      userMap.set(user.driverProfile.id,user);
    }
  });

  page.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="mb-1">Drivers</h2><p class="text-muted mb-0">Manage drivers and driver login accounts</p></div><button class="btn btn-primary" id="addDriverBtn"><i class="bi bi-plus-lg me-1"></i>Add Driver</button></div><div class="card border-0 shadow-sm"><div class="card-body table-responsive"><table class="table table-hover align-middle"><thead><tr><th>Driver Code</th><th>Name</th><th>Mobile</th><th>License</th><th>Availability</th><th>Rating</th><th>Login Account</th><th class="text-end">Actions</th></tr></thead><tbody> ${ drivers.map(driver => { const linkedUser = userMap.get(driver.id); return `<tr><td> ${dcEscape(driver.driverCode)} </td><td> ${dcEscape(driver.name)}</td><td> ${dcEscape(driver.mobile)} </td><td> ${dcEscape(driver.licenseNo)} </td><td><span class="badge text-bg-info"> ${dcEscape(driver.availability)} </span></td><td> ${dcEscape(driver.rating)} </td><td> ${ linkedUser ? `<div><strong> ${dcEscape(linkedUser.email)} </strong></div><small class="text-muted"> ${dcEscape(linkedUser.status)}</small>` : `<span class="badge text-bg-warning">No Account</span>` } </td><td class="text-end text-nowrap"><button class="btn btn-sm btn-outline-primary driver-edit" data-id="${driver.id}"><i class="bi bi-pencil-square"></i>Edit</button> <button class="btn btn-sm btn-outline-danger driver-delete" data-id="${driver.id}"><i class="bi bi-trash"></i> Delete</button> ${ linkedUser ? `<button class="btn btn-sm btn-outline-dark driver-user-manage" data-user-id="${linkedUser.id}"><i class="bi bi-person-gear"></i>Manage Login</button>` : `<button class="btn btn-sm btn-outline-success driver-user-create" data-driver-id="${driver.id}"><i class="bi bi-person-plus"></i>Create Login</button>` } </td></tr>`; }).join("") } </tbody></table></div></div>`;

  document.getElementById("addDriverBtn").addEventListener("click", () => { driverForm(); });
  document.querySelectorAll(".driver-edit").forEach(button => {
    button.addEventListener("click", () => {
      driverForm(Number(button.dataset.id));
    });
  });

  document.querySelectorAll(".driver-delete").forEach(button => { 
    button.addEventListener("click", () => { 
      removeDriver(Number(button.dataset.id));
    });
  });  

  document.querySelectorAll(".driver-user-create").forEach(button => {
    button.addEventListener("click", () => {
      createDriverLoginForm(Number(button.dataset.driverId));
    });
  });

  document.querySelectorAll(".driver-user-manage").forEach(button => {
    button.addEventListener("click", () => {
      userForm(Number(button.dataset.userId));
    });
  });
}

async function removeDriver(id) {
  if(!confirm("Delete this driver record ?")) return;
  await api(`/drivers/${id}`,{method: "DELETE"});
  await loadPage('drivers');
}

async function customerForm(id = null) {
  const editing = Boolean(id);
  let customer = {};

  if (editing) {
    try {
      customer = await api(`/customers/${id}`);
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  page.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="mb-1"> ${editing ? "Edit Customer" : "Add Customer"} </h2><p class="text-muted mb-0"> ${editing ? `Update customer #${id}` : "Create a new customer profile"} </p></div><button type="button" class="btn btn-outline-secondary" id="customerBackBtn"><i class="bi bi-arrow-left me-1"></i>Back</button></div><div id="customerFormError" class="alert alert-danger d-none"></div><div class="card border-0 shadow-sm"><div class="card-body"><form id="customerForm" class="row g-3" novalidate><div class="col-md-6"><label class="form-label" for="customerName">Name<span class="text-danger">*</span></label><input type="text" class="form-control" id="customerName" name="name" value="${dcEscape(customer.name || "")}" minlength="2" required><div class="invalid-feedback">Customer name is required.</div></div><div class="col-md-6"><label class="form-label" for="customerMobile">Mobile<span class="text-danger">*</span></label><input type="text" class="form-control" id="customerMobile" name="mobile" value="${dcEscape(customer.mobile || "")}" minlength="8" maxlength="20" required><div class="invalid-feedback">A valid mobile number is required.</div></div><div class="col-md-6"><label class="form-label" for="customerEmail">Email</label><input type="email" class="form-control" id="customerEmail" name="email" value="${dcEscape(customer.email || "")}" ><div class="invalid-feedback">Enter a valid email address.</div></div><div class="col-md-6"><label class="form-label" for="customerStatus">Status</label><select class="form-select" id="customerStatus" name="status"><option value="ACTIVE" ${(customer.status || "ACTIVE") === "ACTIVE" ? "selected" : ""} >Active</option><option value="INACTIVE" ${ customer.status === "INACTIVE" ? "selected" : "" } >Inactive</option></select></div><div class="col-12"><label class="form-label" for="customerAddress">Address</label><textarea class="form-control" id="customerAddress" name="address" rows="3">${dcEscape(customer.address || "")}</textarea></div><div class="col-md-4"><label class="form-label" for="customerCity">City</label><input type="text" class="form-control" id="customerCity" name="city" value="${dcEscape(customer.city || "")}"></div><div class="col-md-4"><label class="form-label" for="customerState">State</label><input type="text" class="form-control" id="customerState" name="state" value="${dcEscape(customer.state || "")}"></div><div class="col-md-4"><label class="form-label" for="customerPincode">Pincode</label><input type="text" class="form-control" id="customerPincode" name="pincode" value="${dcEscape(customer.pincode || "")}"></div> ${!editing ? `<div class="col-12"><hr class="my-2"><h5 class="mb-1">Account Access</h5><p class="text-muted mb-3">Optionally create a customer login account.</p></div><div class="col-12"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" id="customerCreateLogin"><label class="form-check-label" for="customerCreateLogin">Create Login Account</label></div></div><div id="customerLoginFields" class="row g-3 d-none"><div class="col-md-6"><label class="form-label" for="customerLoginEmail">Login Email<span class="text-danger">*</span></label><input type="email" class="form-control" id="customerLoginEmail" name="loginEmail"><div class="invalid-feedback">Login email is required.</div></div><div class="col-md-6"><label class="form-label" for="customerLoginPassword">Password<span class="text-danger">*</span></label><input type="password" class="form-control" id="customerLoginPassword" name="password" minlength="8"><div class="invalid-feedback">Password must contain at least 8 characters.</div></div><div class="col-md-6"><label class="form-label" for="customerConfirmPassword">Confirm Password</label> <input type="password" class="form-control" id="customerConfirmPassword" name="confirmPassword"><div class="invalid-feedback">Passwords do not match.</div></div></div>` : "" } <div class="col-12"><div class="d-flex gap-2"><button type="submit" class="btn btn-primary" id="customerSaveBtn"><i class="bi bi-check-circle me-1"></i> ${editing ? "Update Customer" : "Create Customer"} </button><button type="button" class="btn btn-light" id="customerCancelBtn">Cancel</button></div></div></form></div></div>`;

  const form = document.getElementById("customerForm");
  const backButton = document.getElementById("customerBackBtn");
  const cancelButton = document.getElementById("customerCancelBtn");
  const errorBox = document.getElementById("customerFormError");
  const goBack = () => { customersPage(); };

  backButton.addEventListener("click",goBack);
  cancelButton.addEventListener("click",goBack);

  if (!editing) {
    const createLogin = document.getElementById("customerCreateLogin");
    const loginFields = document.getElementById("customerLoginFields");
    const loginEmail = document.getElementById("customerLoginEmail");
    const loginPassword = document.getElementById("customerLoginPassword");
    const confirmPassword = document.getElementById("customerConfirmPassword");
    const profileEmail = document.getElementById("customerEmail");

    createLogin.addEventListener("change", () => {
      const enabled = createLogin.checked;

      loginFields.classList.toggle("d-none", !enabled);
      loginEmail.required = enabled;
      loginPassword.required = enabled;
      confirmPassword.required = enabled;

      if (enabled && !loginEmail.value && profileEmail.value) {
        loginEmail.value = profileEmail.value;
      }
    });

    profileEmail.addEventListener("input", () => {
      if (createLogin.checked && !loginEmail.dataset.modified) {
        loginEmail.value = profileEmail.value;
      }
    });

    loginEmail.addEventListener("input", () => {
      loginEmail.dataset.modified = "true";
    });
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    errorBox.classList.add("d-none");
    errorBox.innerHTML = "";

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const body = Object.fromEntries( new FormData(form).entries());
    if (!editing) {
      const createLogin = document.getElementById("customerCreateLogin").checked;

      body.createUser = createLogin;
      if (createLogin) {
        const password = document.getElementById("customerLoginPassword").value;
        const confirmPassword = document.getElementById("customerConfirmPassword").value;
        const confirmInput = document.getElementById("customerConfirmPassword");

        if (password !== confirmPassword) {
          confirmInput.setCustomValidity("Passwords do not match");
          form.classList.add("was-validated");
          confirmInput.reportValidity();
          return;
        }

        confirmInput.setCustomValidity("");
        body.email = body.email || body.loginEmail;
      } else {
        delete body.loginEmail;
        delete body.password;
        delete body.confirmPassword;
      }
    }

    Object.keys(body).forEach(key => {
      if (body[key] === "") {
        body[key] = null;
      }
    });

    const saveButton = document.getElementById("customerSaveBtn");
    saveButton.disabled = true;
    saveButton.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving...`;

    try {
      if (editing) {
        await api(`/customers/${id}`, {method: "PUT", body: JSON.stringify(body)});
      } else if (body.createUser) {
        delete body.confirmPassword;
        await api("/admin/customers/with-user",{method:"POST", body: JSON.stringify(body)});
      } else {
        delete body.createUser;
        await api("/customers",{method:"POST",body:JSON.stringify(body)});
      }

      await customersPage();
    } catch (error) {
      let message = error.message || "Unable to save customer";

      if (error.response?.data?.errors) {
        message = error.response.data.errors.map(item => `${item.field}: ${item.message}`).join("<br>");
      }

      errorBox.innerHTML = message;
      errorBox.classList.remove("d-none");
      window.scrollTo({top: 0, behavior: "smooth"});
    } finally {
      saveButton.disabled = false;
      saveButton.innerHTML = editing ? `<i class="bi bi-check-circle me-1"></i>Update Customer` : `<i class="bi bi-check-circle me-1"></i>Create Customer`;
    }
  });
}

async function driverForm(id = null) {
  const editing = Boolean(id);
  let driver = {};

  if (editing) {
    try {
      driver = await api(`/drivers/${id}`);
    } catch (error) {
      alert(error.message);
      return;
    }
  }

  page.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="mb-1">${editing ? "Edit Driver" : "Add Driver"}</h2><p class="text-muted mb-0">${editing ? `Update driver #${id}` : "Create a new driver profile"}</p></div><button type="button" class="btn btn-outline-secondary" id="driverBackBtn"><i class="bi bi-arrow-left me-1"></i>Back</button></div><div id="driverFormError" class="alert alert-danger d-none"></div><div class="card border-0 shadow-sm"><div class="card-body"><form id="driverForm" class="row g-3" novalidate><div class="col-md-6"><label class="form-label" for="driverName">Name<span class="text-danger">*</span></label><input type="text" class="form-control" id="driverName" name="name" value="${dcEscape(driver.name || "")}" minlength="2" required><div class="invalid-feedback">Driver name is required.</div></div><div class="col-md-6"><label class="form-label" for="driverMobile">Mobile<span class="text-danger">*</span></label><input type="text" class="form-control" id="driverMobile" name="mobile" value="${dcEscape(driver.mobile || "")}" minlength="8" maxlength="20" required><div class="invalid-feedback">A valid mobile number is required.</div></div><div class="col-md-6"><label class="form-label" for="driverEmail">Email</label><input type="email" class="form-control" id="driverEmail" name="email" value="${dcEscape(driver.email || "")}"><div class="invalid-feedback">Enter a valid email address.</div></div><div class="col-md-6"><label class="form-label" for="driverLicenseNo">License Number<span class="text-danger">*</span></label><input type="text" class="form-control" id="driverLicenseNo" name="licenseNo" value="${dcEscape(driver.licenseNo || "")}" required><div class="invalid-feedback">License number is required.</div></div><div class="col-md-4"><label class="form-label" for="driverLicenseExpiry">License Expiry</label><input type="date" class="form-control" id="driverLicenseExpiry" name="licenseExpiry" value="${dcEscape(driver.licenseExpiry || "")}"></div><div class="col-md-4"><label class="form-label" for="driverExperience">Experience Years</label><input type="number" class="form-control" id="driverExperience" name="experienceYears" min="0" step="0.1" value="${dcEscape(driver.experienceYears || 0)}"></div><div class="col-md-4"><label class="form-label" for="driverRating">Rating</label><input type="number" class="form-control" id="driverRating" value="${dcEscape(driver.rating || 0)}" readonly></div><div class="col-12"><label class="form-label" for="driverAddress">Address</label><textarea class="form-control" id="driverAddress" name="address" rows="3">${dcEscape(driver.address || "")}</textarea></div><div class="col-md-6"><label class="form-label" for="driverAvailability">Availability</label><select class="form-select" id="driverAvailability" name="availability">${["AVAILABLE", "BUSY", "OFFLINE"].map(status => `<option value="${status}" ${(driver.availability || "OFFLINE") === status ? "selected" : ""} >${status}</option>`).join("")}</select></div><div class="col-md-6"><label class="form-label" for="driverStatus">Driver Status</label><select class="form-select" id="driverStatus" name="status">${["ACTIVE", "INACTIVE", "SUSPENDED"].map(status => `<option value="${status}" ${(driver.status || "ACTIVE") === status ? "selected" : ""} >${status}</option>`).join("")}</select></div> ${!editing ? `<div class="col-12"><hr class="my-2"><h5 class="mb-1">Account Access</h5><p class="text-muted mb-3">Optionally create a login account for this driver.</p></div><div class="col-12"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" id="driverCreateLogin"><label class="form-check-label" for="driverCreateLogin">Create Driver Login</label></div></div><div id="driverLoginFields" class="row g-3 d-none"><div class="col-md-6"><label class="form-label" for="driverLoginEmail">Login Email<span class="text-danger">*</span></label><input type="email" class="form-control" id="driverLoginEmail" name="loginEmail"><div class="invalid-feedback">Login email is required.</div></div><div class="col-md-6"><label class="form-label" for="driverLoginPassword">Password<span class="text-danger">*</span></label><input type="password" class="form-control" id="driverLoginPassword" name="password" minlength="8"><div class="invalid-feedback">Password must contain at least 8 characters.</div></div><div class="col-md-6"><label class="form-label" for="driverConfirmPassword">Confirm Password</label><input type="password" class="form-control" id="driverConfirmPassword" name="confirmPassword"><div class="invalid-feedback">Passwords do not match.</div></div></div>` : ""}<div class="col-12"><div class="d-flex gap-2"><button type="submit" class="btn btn-primary" id="driverSaveBtn"><i class="bi bi-check-circle me-1"></i>${editing ? "Update Driver" : "Create Driver"}</button><button type="button" class="btn btn-light" id="driverCancelBtn">Cancel</button></div></div></form></div></div>`;

  const form = document.getElementById("driverForm");
  const backButton = document.getElementById("driverBackBtn");
  const cancelButton = document.getElementById("driverCancelBtn");
  const errorBox = document.getElementById("driverFormError");

  const goBack = () => { driversPage(); };

  backButton.addEventListener("click",goBack);
  cancelButton.addEventListener("click",goBack);

  if (!editing) {
    const createLogin = document.getElementById("driverCreateLogin");
    const loginFields = document.getElementById("driverLoginFields");
    const loginEmail = document.getElementById("driverLoginEmail");
    const loginPassword = document.getElementById("driverLoginPassword");
    const confirmPassword = document.getElementById("driverConfirmPassword");
    const profileEmail = document.getElementById("driverEmail");

    createLogin.addEventListener("change",() => {
      const enabled = createLogin.checked;

      loginFields.classList.toggle("d-none",!enabled);
      loginEmail.required = enabled;
      loginPassword.required = enabled;

      confirmPassword.required = enabled;
      if (enabled && !loginEmail.value && profileEmail.value) {
        loginEmail.value = profileEmail.value;
      }
    });

    profileEmail.addEventListener("input", () => {
      if (createLogin.checked && !loginEmail.dataset.modified) {
          loginEmail.value = profileEmail.value;
      }
    });

    loginEmail.addEventListener("input",() => {
      loginEmail.dataset.modified = "true";
    });
  }

  form.addEventListener("submit",async event => {
    event.preventDefault();

    errorBox.classList.add("d-none");
    errorBox.innerHTML = "";
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const body = Object.fromEntries(new FormData(form).entries());
    if (!editing) {
      const createLogin = document.getElementById("driverCreateLogin").checked;
      body.createUser = createLogin;

      if (createLogin) {
        const password = document.getElementById("driverLoginPassword").value;
        const confirmPassword = document.getElementById("driverConfirmPassword").value;
        const confirmInput = document.getElementById("driverConfirmPassword");

        if (password !== confirmPassword) {
          confirmInput.setCustomValidity("Passwords do not match");
          form.classList.add("was-validated");
          confirmInput.reportValidity();
          return;
        }

        confirmInput.setCustomValidity("");
        body.email = body.email || body.loginEmail;
      } else {
        delete body.loginEmail;
        delete body.password;
        delete body.confirmPassword;
      }
    }

    Object.keys(body).forEach(key => {
      if (body[key] === "") {
        body[key] = null;
      }
    });

    const saveButton = document.getElementById("driverSaveBtn");
    saveButton.disabled = true;
    saveButton.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Saving...`;
    try {
      if (editing) {
        await api(`/drivers/${id}`,{method: "PUT", body: JSON.stringify(body)});
      } else if (body.createUser) {
        delete body.confirmPassword;
        await api("/admin/drivers/with-user",{method: "POST", body: JSON.stringify(body)});
      } else {
        delete body.createUser;
        await api("/drivers",{method:"POST",body:JSON.stringify(body)});
      }

      await driversPage();
    } catch (error) {
      let message = error.message || "Unable to save driver";
      if (error.response?.data?.errors) {
          message = error.response.data.errors.map(item => `${item.field}: ${item.message}`).join("<br>");
      }

      errorBox.innerHTML = message;
      errorBox.classList.remove("d-none");
      window.scrollTo({top: 0, behavior:"smooth"});
    } finally {
      saveButton.disabled = false;
      saveButton.innerHTML = editing ? `<i class="bi bi-check-circle me-1"></i>Update Driver` : `<i class="bi bi-check-circle me-1"></i>Create Driver`;
    }
  });
}

/*
function customerAccountFields() {
  return `<div class="col-12"><hr><h5>Account Access</h5><p class="text-muted"> Optionally create a customer login account.</p></div><div class="col-12"><div class="form-check"><input class="form-check-input" type="checkbox" id="customerCreateLogin" name="createUser"><label class="form-check-label" for="customerCreateLogin">Create Login Account</label></div></div><div id="customerLoginFields" class="row g-3 d-none"><div class="col-md-6"><label class="form-label">Login Email</label><input type="email" class="form-control" name="loginEmail"></div><div class="col-md-6"><label class="form-label">Password</label><input type="password" class="form-control" name="password" minlength="8"></div></div>`;
}

//const checkbox = document.getElementById("customerCreateLogin");
//const loginFields = document.getElementById("customerLoginFields");
//checkbox.addEventListener("change", () => {
//  loginFields.classList.toggle("d-none", !checkbox.checked);
//}); 

const form = document.getElementById("customerForm");
form.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const createUser = document.getElementById("customerCreateLogin").checked;

  data.createUser = createUser;
  if (createUser) {
    data.email = data.loginEmail || data.email;
    await api("/admin/customers/with-user",{method:"POST", body:JSON.stringify(data)});
  } else {
    delete data.password;
    delete data.loginEmail;

    await api("/customers",{method:"POST", body:JSON.stringify(data)});
  }

  customersPage();
});

function driverAccountFields() {
  return `<div class="col-12"><hr><h5>Account Access</h5><p class="text-muted">Optionally create a driver login account.</p></div><div class="col-12"><div class="form-check"><input class="form-check-input" type="checkbox" id="driverCreateLogin" name="createUser"><label class="form-check-label" for="driverCreateLogin">Create Driver Login</label></div></div><div id="driverLoginFields" class="row g-3 d-none"><div class="col-md-6"><label class="form-label">Login Email</label><input type="email" class="form-control" name="loginEmail"></div><div class="col-md-6"><label class="form-label">Password</label><input type="password" class="form-control" name="password" minlength="8"></div></div>`;
}

const driverCheckbox = document.getElementById("driverCreateLogin");
const driverLoginFields = document.getElementById("driverLoginFields");

driverCheckbox.addEventListener("change",() => {
  driverLoginFields.classList.toggle("d-none",!driverCheckbox.checked);
});

document.getElementById("driverForm").addEventListener("submit",async event => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(event.target).entries());
  const createUser = document.getElementById("driverCreateLogin").checked;

  data.createUser = createUser;
  if (createUser) {
    data.email = data.loginEmail || data.email;
    await api("/admin/drivers/with-user",{method:"POST",body:JSON.stringify(data)});
  } else {
    delete data.password;
    delete data.loginEmail;

    await api("/drivers",{method:"POST",body:JSON.stringify(data)});
  }
  driversPage();
});

async function createCustomerLoginForm(customerId) {
  const customer = await api(`/customers/${customerId}`);

  page.innerHTML = `<div class="d-flex justify-content-between mb-3"><div><h2>Create Customer Login</h2><p class="text-muted"> ${dcEscape(customer.name)} </p></div><button class="btn btn-outline-secondary" id="customerLoginBack">Back</button></div><div class="card border-0 shadow-sm"><div class="card-body"><form id="customerLoginForm" class="row g-3"><div class="col-md-6"><label class="form-label">Login Email</label><input type="email" class="form-control" name="email" value="${dcEscape(customer.email)}" required></div><div class="col-md-6"><label class="form-label">Password</label><input type="password" class="form-control" name="password" minlength="8" required></div><div class="col-12"><button class="btn  btn-primary">Create Login</button></div></form></div></div>`;

  document.getElementById("customerLoginBack").addEventListener("click",customersPage);
  document.getElementById("customerLoginForm").addEventListener("submit",async event => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.target).entries());
    await api(`/admin/customers/${customerId}/create-user`,{method: "POST", body: JSON.stringify(data)});
    customersPage();
  });
}

async function createDriverLoginForm(driverId) {
  const driver = await api(`/drivers/${driverId}`);

  page.innerHTML = `<div class="d-flex justify-content-between mb-3"><div><h2>Create Driver Login</h2><p class="text-muted">${dcEscape(driver.name)}</p></div><button class="btn btn-outline-secondary" id="driverLoginBack">Back</button></div><div class="card border-0 shadow-sm"><div class="card-body"><form id="driverLoginForm" class="row g-3"><div class="col-md-6"><label class="form-label">Login Email</label><input type="email" class="form-control" name="email" value="${dcEscape(driver.email)}" required></div><div class="col-md-6"><label class="form-label">Password</label><input type="password" class="form-control" name="password" minlength="8" required></div><div class="col-12"><button class="btn btn-primary">Create Login</button></div></form></div></div>`;

  document.getElementById("driverLoginBack").addEventListener("click",driversPage);
  document.getElementById("driverLoginForm").addEventListener("submit",async event => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.target).entries());
    await api(`/admin/drivers/${driverId}/create-user`,{method: "POST", body: JSON.stringify(data)});

    driversPage();
  });
}  
*/

async function crudPage(title, endpoint, fields) {
  const rows = await api(endpoint);

  page.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div><h2 class="mb-1">${title}</h2><p class="text-muted mb-0">Super Admin record management</p></div>
      <button id="dcAddBtn" class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Add ${title.charAt(0).toUpperCase() + title.slice(1, -1).toLowerCase()}</button>
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
      <td><button class="btn btn-sm btn-outline-primary me-1 booking-edit-btn" data-id="${r.id}"><i class="bi bi-pencil-square"></i>Edit</button><button class="btn btn-sm btn-outline-primary" onclick="assign(${r.id})">Assign</button></td></tr>`).join("")}</tbody></table></div></div>`;

  document.querySelectorAll(".booking-edit-btn").forEach(button => {
    button.addEventListener("click", () => {
      editBooking(Number(button.dataset.id));
    });
  });
}

async function newBooking() {
  const customers = await api("/customers?status=ACTIVE");
  const vehicles = await api("/vehicles?status=ACTIVE");

  page.innerHTML = `<div class="d-flex justify-content-between mb-3"><h2 class="mb-3">New Booking sssss</h2><button class="btn btn-secondary" onclick="loadPage('bookings')">Back</button></div><div class="card border-0 shadow-sm"><div class="card-body">
    <form id="bookingForm" class="row g-3">
      <div class="col-md-6"><label>Customer</label><select class="form-select" name="customerId">${customers.map(c=>`<option value="${c.id}">${c.name} - ${c.mobile}</option>`).join("")}</select></div>
      <div class="col-md-6"><label>Vehicle</label><select class="form-select" name="vehicleId"><option value="">Select None</option>${vehicles.map(v=>`<option value="${v.id}">${v.model} [ ${v.vehicleNo} ] - ${v.brand} (${v.year})</option>`).join("")}</select></div>      
      <div class="col-md-6"><label>Vehicle Type</label><input class="form-control" name="vehicleType"></div>
      <div class="col-md-6"><label>Booking Type</label><select class="form-select" name="bookingType"> ${["ONE_WAY","ROUND_TRIP","HOURLY"].map(x=>`<option value="${x}">${x}</option>`).join("")} </select></div>
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

function changePasswordForm() {
  page.innerHTML = `<div class="d-flex justify-content-between align-items-center mb-3"><div><h2 class="mb-1">Change Password</h2><p class="text-muted mb-0">Update the password for your current admin account.</p></div><button type="button" class="btn btn-outline-secondary" id="changePasswordBackBtn"><i class="bi bi-arrow-left me-1"></i>Back</button></div><div id="changePasswordError" class="alert alert-danger d-none"></div><div id="changePasswordSuccess" class="alert alert-success d-none"></div><div class="row"><div class="col-lg-6 col-xl-5"><div class="card border-0 shadow-sm"><div class="card-body"><form id="changePasswordForm" novalidate><div class="mb-3"><label for="currentPassword" class="form-label">Current Password<span class="text-danger">*</span></label><div class="input-group"><input type="password" class="form-control" id="currentPassword" name="currentPassword" autocomplete="current-password" required><button type="button" class="btn btn-outline-secondary toggle-password" data-target="currentPassword"><i class="bi bi-eye"></i></button></div><div class="invalid-feedback">Current password is required.</div></div><div class="mb-3"><label for="newPassword" class="form-label">New Password<span class="text-danger">*</span></label><div class="input-group"><input type="password" class="form-control" id="newPassword" name="newPassword" minlength="8" autocomplete="new-password" required><button type="button" class="btn btn-outline-secondary toggle-password" data-target="newPassword"><i class="bi bi-eye"></i></button></div><div class="invalid-feedback">Password must contain at least 8 characters.</div><div class="form-text">Use a strong password with uppercase, lowercase, number and special character.</div></div><div class="mb-4"><label for="confirmPassword" class="form-label">Confirm New Password<span class="text-danger">*</span></label><div class="input-group"><input type="password" class="form-control" id="confirmPassword" name="confirmPassword" minlength="8" autocomplete="new-password" required><button type="button" class="btn btn-outline-secondary toggle-password" data-target="confirmPassword"><i class="bi bi-eye"></i></button></div><div class="invalid-feedback">Confirm password is required.</div></div><div class="d-flex gap-2"><button type="submit" class="btn btn-primary" id="changePasswordSaveBtn"><i class="bi bi-key me-1"></i>Change Password</button><button type="button" class="btn btn-light" id="changePasswordCancelBtn">Cancel</button></div></form></div></div></div></div>`;

  const form = document.getElementById("changePasswordForm");
  const errorBox = document.getElementById("changePasswordError");
  const successBox = document.getElementById("changePasswordSuccess");
  const saveButton = document.getElementById("changePasswordSaveBtn");
  const goBack = () => { dashboard(); };

  document.getElementById("changePasswordBackBtn").addEventListener("click", goBack);
  document.getElementById("changePasswordCancelBtn").addEventListener("click", goBack);
  document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target);
      const icon = button.querySelector("i");
      if (target.type === "password") {
        target.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
      } else {
        target.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
      }
    });
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    errorBox.classList.add("d-none");
    successBox.classList.add("d-none");
    errorBox.textContent = "";
    successBox.textContent = "";

    const currentPassword = document.getElementById("currentPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmPassword");

    confirmPassword.setCustomValidity("");
    if (newPassword.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity("Passwords do not match");
    }

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    if (currentPassword.value === newPassword.value) {
      errorBox.textContent = "New password must be different from current password.";
      errorBox.classList.remove("d-none");
      return;
    }

    saveButton.disabled = true;
    saveButton.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Updating...`;

    try {
      await api("/auth/change-password",{method:"POST", body:JSON.stringify({currentPassword: currentPassword.value, newPassword: newPassword.value})});
      form.reset();

      form.classList.remove("was-validated");
      successBox.textContent = "Password changed successfully.";
      successBox.classList.remove("d-none");
    } catch (error) {
      errorBox.textContent = error.message || "Unable to change password.";
      errorBox.classList.remove("d-none");
    } finally {
      saveButton.disabled = false;
      saveButton.innerHTML = `<i class="bi bi-key me-1"></i>Change Password`;
    }
  });
}

// const changePasswordBtn = document.getElementById("changePasswordBtn");
// if (changePasswordBtn) {
//   changePasswordBtn.addEventListener("click", () => { changePasswordForm(); });
// }