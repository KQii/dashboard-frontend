import { Navigate } from "react-router-dom";
import useTitle from "../../hooks/useTitle";

const AuthPage = () => {
  useTitle("Elasticsearch Monitoring System");

  // oauth2-proxy handles authentication, just redirect to home
  return <Navigate to="/" />;
};

export default AuthPage;
