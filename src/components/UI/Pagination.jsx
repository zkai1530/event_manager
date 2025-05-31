import ReactPaginate from "react-paginate";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Pagination = ({ totalPages, onPageChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1;
    if (newPage !== page) {
      navigate(`?page=${newPage}`);
      onPageChange(newPage - 1);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentPage = parseInt(params.get("page") || "1", 10); 
    if (currentPage !== page) {
      setPage(currentPage);
      onPageChange(currentPage - 1);
    }
  }, [location.search, page, onPageChange]);

  return (
    <div className="mt-4 mb-4 flex justify-end">
      <ReactPaginate
        previousLabel={<i className="fas fa-chevron-left"></i>}
        nextLabel={<i className="fas fa-chevron-right"></i>}
        breakLabel="..."
        pageCount={totalPages || 1}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageChange}
        containerClassName="flex items-center gap-2"
        pageClassName="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer text-sm"
        activeClassName="bg-main text-white"
        previousClassName="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer text-sm"
        nextClassName="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer text-sm"
        breakClassName="w-8 h-8 flex items-center justify-center text-sm"
        disabledClassName="opacity-50 cursor-not-allowed"
        forcePage={page - 1}
      />
    </div>
  );
};

export default Pagination;
