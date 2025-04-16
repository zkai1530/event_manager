import { createContext, useContext, useEffect, useState } from "react";
import { getUserInfo, loginWithGoogleCode } from "services/user/userService";

// Tạo context với giá trị mặc định khớp với loginWithGoogle nhận code
const AuthContext = createContext({
  user: null,
  loginWithGoogle: (code) => Promise.resolve(), // Định nghĩa hàm nhận code
});

/** @type {React.FC<{ children: React.ReactNode }>} */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loginWithGoogle = async (code) => {
    try {
      const userData = await loginWithGoogleCode(code);
      setUser(userData);
      localStorage.setItem("token", userData.token);
    } catch (error) {
      console.error("loginWithGoogle", error);
    }
  };

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token && !user) {
  //     getUserInfo(token)
  //       .then((data) => setUser(data))
  //       .catch((error) => {
  //         console.error("getUserInfo", error);
  //         // localStorage.removeItem("token");
  //       });
  //   }
  // }, [user]);

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
