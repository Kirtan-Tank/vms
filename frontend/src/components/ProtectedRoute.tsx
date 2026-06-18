import { Navigate, Outlet } from "react-router-dom";

interface Props {
  session: any;
}

export function ProtectedRoute({ session }: Props) {
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
