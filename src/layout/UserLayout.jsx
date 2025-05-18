import Footer from "components/layout/Footer";
import Header from "components/layout/Header";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    // <div>
    //   <div className="fixed top-0 right-0 left-0 z-100">
    //     <Header />
    //   </div>
    //   <div className="z-[50] flex w-full pt-[4.063rem]">
    //     <div className="container mx-auto w-full">
    //       <Outlet />
    //     </div>
    //   </div>
    // </div>
    <div className="flex min-h-screen flex-col">
      {" "}
      {/* Giữ flex và min-h-screen */}
      <div className="fixed top-0 right-0 left-0 z-100">
        {" "}
        {/* Header cố định */}
        <Header />
      </div>
      <div className="flex-grow pt-[4.063rem] pb-[2rem]">
        {" "}
        {/* Outlet ở giữa, pt cho Header */}
        <div className="container mx-auto w-full">
          <Outlet />
        </div>
      </div>
      <div className="">
        <Footer />
      </div>
    </div>
  );
};


export default UserLayout;
