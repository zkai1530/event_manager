import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PublicRoutes from "./routes/PublicRoutes";
import PrivateRoutes from "./routes/PrivateRoutes";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import OrganizerRoutes from "./routes/OrganizerRoutes";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/*" element={<PublicRoutes />} />

          {/* Private Routes */}
          <Route element={<PrivateRoutes />}>
            <Route path="/user/*" element={<UserRoutes />} />
            <Route path="/organizations/*" element={<OrganizerRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
