import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
  role?: string;
}

const ProtectedRoute = ({ children, role }: Props) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    // If specific role required
    if (role && payload.role !== role) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  } catch (error) {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
