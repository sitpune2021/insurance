import React from "react";
import Login from "./pages/Login_auth";
import Home from "./pages/Home";
import Appointment from "./pages/Appointment/Appointment";
import AppointmentReply from "./pages/Appointment/AppointmentReply";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventDetailsPage from "./pages/EvenetsDetailsPage";
import FullPageCalendar from "./pages/Calander";
import EditAppointment from "./pages/Appointment/EditAppointment";
import Laboratory from "./pages/Laboratory/Laboratory";
import AddLaboratory from "./pages/Laboratory/Addlaboratory";
import EditLaboratory from "./pages/Laboratory/EditLaboratory";
import Assistant from "./pages/Assistant/Assistant";
import AddAssistant from "./pages/Assistant/AddAssistant";
import EditAssistant from "./pages/Assistant/EditAssistant";
import LaboratoryDashboard from "./pages/LaboratoryDashboard/LaboratoryDashboard";
import laboratoryNavbar from "./pages/LaboratoryDashboard/Navbar";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/Dashboard" element={<Home />}></Route>
        <Route
          path="/LaboratoryDashboard"
          element={<LaboratoryDashboard />}
        ></Route>
        <Route path="/LaboratoryNavbar" element={<laboratoryNavbar />}></Route>
        <Route path="/Appointment" element={<Appointment />}></Route>
        <Route path="/edit-appointment/:id" element={<EditAppointment />} />
        <Route path="/ReplyAppointment" element={<AppointmentReply />}></Route>
        <Route path="/calendar" element={<FullPageCalendar />} />
        <Route path="/events/:date" element={<EventDetailsPage />} />
        <Route path="/laboratory" element={<Laboratory />}></Route>
        <Route path="/addLaboratory" element={<AddLaboratory />}></Route>
        <Route path="/edit-laboratory/:id" element={<EditLaboratory />} />
        <Route path="/assistant" element={<Assistant />}></Route>
        <Route path="/addassistant" element={<AddAssistant />}></Route>
        <Route path="/edit-assistant/:id" element={<EditAssistant />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
