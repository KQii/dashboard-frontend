import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "../../store";
import useTitle from "../../hooks/useTitle";

const AuthPage = () => {
  useTitle("Elasticsearch Monitoring System");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isLogged } = useSelector(
    (state: RootState) => state.auth,
    () => true
  );

  if (isLogged) {
    toast("You've already logged in");
    return <Navigate to="/" />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default AuthPage;
