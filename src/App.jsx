import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { mockApi } from "./services/mockApi";
import MongoNotification from "./components/MongoNotification";

function ProtectedRoute({ children, requiredRole }) {
  const user = mockApi.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "admin" ? "/adminupload" : "/details"} replace />;
  }
  
  return children;
}

function RootRedirect() {
  const user = mockApi.getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.role === "admin" ? "/adminupload" : "/details"} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <MongoNotification />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/details" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/adminupload" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;