import { useAuth } from "context/AuthContext";
import { useEffect, useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const inputRef = useRef(null);
  const handleGoogleLogin = () => {
    const redirectUri = `${window.location.origin}/callback`;
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=1080231574783-oa36iru2q2ibfi659npnui31allll63n.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(
          redirectUri,
        )}&scope=email profile`;
        window.location.href = googleAuthUrl;
  };

  // when callback saved the code, callback -> login (call loginWithGoogle from authContext (saved token in localStorage)) -> navigate /home
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const googleAuthCode = localStorage.getItem("googleAuthCode");
    const existingToken = localStorage.getItem("token");

    if (existingToken) {
      navigate("/");
      return;
    }

    if (googleAuthCode) {
      loginWithGoogle(googleAuthCode)
        .then(() => {
          localStorage.removeItem("googleAuthCode");
          if (localStorage.getItem("token")) {
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("Login failed", error);
        });
    }
  }, [loginWithGoogle, navigate]);

  const handleBlur = () => {
    inputRef.current.reportValidity();
  };
  console.log("hi");
  return (
    <div className="relative min-h-screen w-full">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/event_background.jpg')" }}
      ></div>
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex flex-col rounded-lg border border-slate-400 bg-gray-900/10 p-8 shadow-lg backdrop-blur-md backdrop-filter">
          <div className="mb-4 flex items-center justify-center space-x-2 text-2xl font-bold text-white">
            <h1 className="font-logo from-main to-emphasis bg-gradient-to-r bg-clip-text text-[22px] font-extrabold text-transparent md:text-6xl">
              Eventify
            </h1>
          </div>
          <h2 className="font-main mb-2 text-3xl font-bold text-white">
            Xin Chào!
          </h2>
          <p className="mb-6 text-slate-300">
            Đăng nhập để khám phá và quản lý các sự kiện thú vị! 
          </p>
          <div className="mx-auto mb-4 w-full px-4 sm:px-0">
            <label className="mb-2 block text-sm font-medium text-white">
              Email
            </label>

            <div className="relative">
              <input
                ref={inputRef}
                placeholder="Nhập email của bạn"
                className="focus:border-main-bold focus:ring-main-bold dark:focus:border-main dark:focus:ring-main w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 shadow-sm transition-all duration-200 hover:border-gray-400 focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:hover:border-gray-500"
                type="email"
                required
                onBlur={handleBlur}
              />

              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                >
                  <path
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <button
            className="group relative mb-4 h-11 w-full rounded-xl bg-gray-800 text-center text-xl font-semibold text-white"
            type="button"
          >
            <div className="bg-main-bold absolute top-[4px] left-1 z-10 flex h-9 w-1/4 items-center justify-center rounded-md duration-500 group-hover:w-[396px]">
              <FaArrowRight />
            </div>
            <p className="translate-x-2">Tiếp tục</p>
          </button>

          <div className="mb-4 flex items-center justify-between">
            <hr className="w-full border-gray-600" />
            <span className="mx-4 text-gray-400">Hoặc</span>
            <hr className="w-full border-gray-600" />
          </div>

          <div className="mb-4">
            <button
              className="float-right mb-3 flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-white/25 bg-gray-800 px-6 py-3 font-bold text-white transition-all duration-300 ease-[cubic-bezier(0,0.87,0.12,1)] hover:scale-105 active:scale-95"
              onClick={handleGoogleLogin}
            >
              <svg
                viewBox="0 0 256 262"
                preserveAspectRatio="xMidYMid"
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-auto"
              >
                <path
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  fill="#4285F4"
                />
                <path
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  fill="#34A853"
                />
                <path
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                  fill="#FBBC05"
                />
                <path
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  fill="#EB4335"
                />
              </svg>
              Đăng nhập bằng Google
            </button>
            <p className="text-center text-slate-300">
              Hoặc{" "}
              <Link className="text-main-bold" to={"/"}>
                khám phá trang chủ
              </Link>{" "}
              mà không cần đăng nhập.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
