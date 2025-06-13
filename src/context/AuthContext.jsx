import { createContext, useContext, useEffect, useState } from "react";
import {
  logoutUser,
  loginWithGoogleCode,
  introspect,
  loginNormal,
} from "services/user/userService";

// Tạo context với giá trị mặc định khớp với loginWithGoogle nhận code
const AuthContext = createContext({
  user: null,
  loginWithGoogle: (code) => Promise.resolve(), // Định nghĩa hàm nhận code
  login: (email, password) => Promise.resolve(),
  logout: () => {},
  role: null,
  setUser: (user) => {},
  setRole: (role) => {},
});

/** @type {React.FC<{ children: React.ReactNode }>} */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const loginWithGoogle = async (code) => {
    try {
      const userData = await loginWithGoogleCode(code);
      setUser(userData);
      localStorage.setItem("token", userData.token);

      // Gọi introspect để lấy role
      const introspectData = await introspect(userData.token);
      setRole(introspectData.data.valid ? introspectData.data.role : null);
      if (!introspectData.data.valid) {
        setUser(null);
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("loginWithGoogle", error);
    }
  };

  const login = async (email, password) => {
    console.log(email, password)
    try {
      const response = await loginNormal(email, password);
      if (response.message === "Log in successfully!") {
        const token = response.data;
        localStorage.setItem("token", token);
        setUser({ token });
        const introspectData = await introspect(token);
        setRole(introspectData.data.valid ? introspectData.data.role : null);
        console.log("role ne ", introspectData.data.role)
        if (!introspectData.data.valid) {
          setUser(null);
          localStorage.removeItem("token");
          throw new Error("Invalid token after login");
        }
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login failed", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setRole(null);
      localStorage.removeItem("token");
      return;
    }

    try {
      const response = await logoutUser(token);
      if (response.message === "Log out successfully!") {
        setUser(null);
        setRole(null);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed", error?.response?.data || error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      introspect(token)
        .then((data) => {
          if (data.data.valid) {
            setUser({ token }); // Set user với token
            setRole(data.data.role);
          } else {
            setUser(null);
            setRole(null);
            localStorage.removeItem("token");
          }
        })
        .catch((error) => {
          console.error("Introspect failed", error);
          setUser(null);
          setRole(null);
          localStorage.removeItem("token");
        });
    }
  }, [user]);

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
    <AuthContext.Provider
      value={{ user, loginWithGoogle, login, logout, role, setUser, setRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
