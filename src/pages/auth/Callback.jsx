import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasCalled = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const existingToken = localStorage.getItem("token");

    if (hasCalled.current) return;

    if (code && !existingToken) {
      localStorage.setItem("googleAuthCode", code);
      hasCalled.current = true;
      navigate("/login");
    }

    if (existingToken) {
      hasCalled.current = true;
      navigate("/"); 
    }
  }, [searchParams, navigate]);

  return null;
};

export default Callback;
