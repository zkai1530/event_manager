
import Header from "components/layout/Header";
import { Routes, Route } from "react-router-dom";


const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Header />} />
    </Routes>
  );
};

export default PublicRoutes;
