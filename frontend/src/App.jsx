import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EntityList from "./pages/EntityList";
import Bookings from "./pages/Bookings";
import Tracking from "./pages/Tracking";
import Reports from "./pages/Reports";
import DriverPortal from "./pages/DriverPortal";
import CustomerPortal from "./pages/CustomerPortal";

function ProtectedApp(){
  const {user}=useAuth();
  if(!user) return <Login/>;

  if(user.role==="DRIVER") return <Routes><Route path="*" element={<DriverPortal/>}/></Routes>;
  if(user.role==="CUSTOMER") return <Routes><Route path="*" element={<CustomerPortal/>}/></Routes>;

  return <Layout>
    <Routes>
      <Route path="/" element={<Dashboard/>}/>
      <Route path="/customers" element={<EntityList title="Customers" endpoint="/customers" columns={[
        {key:"customerCode",label:"Code"},{key:"name",label:"Name"},{key:"mobile",label:"Mobile"},{key:"city",label:"City"},{key:"status",label:"Status"}
      ]}/>}/>
      <Route path="/drivers" element={<EntityList title="Drivers" endpoint="/drivers" columns={[
        {key:"driverCode",label:"Code"},{key:"name",label:"Name"},{key:"mobile",label:"Mobile"},{key:"availability",label:"Availability"},{key:"rating",label:"Rating"}
      ]}/>}/>
      <Route path="/vehicles" element={<EntityList title="Vehicles" endpoint="/vehicles" columns={[
        {key:"vehicleNo",label:"Vehicle No"},{key:"vehicleType",label:"Type"},{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"status",label:"Status"}
      ]}/>}/>
      <Route path="/bookings" element={<Bookings/>}/>
      <Route path="/payments" element={<EntityList title="Payments" endpoint="/payments" columns={[
        {key:"bookingId",label:"Booking"},{key:"amount",label:"Amount"},{key:"paymentMode",label:"Mode"},{key:"paymentStatus",label:"Status"},{key:"paymentDate",label:"Date"}
      ]}/>}/>
      <Route path="/tracking" element={<Tracking/>}/>
      <Route path="/reports" element={<Reports/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  </Layout>;
}

export default function App(){
  return <AuthProvider><ProtectedApp/></AuthProvider>;
}
