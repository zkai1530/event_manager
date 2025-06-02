import { useNavigate, useParams } from "react-router-dom";
import { FaReceipt } from "react-icons/fa";
import { useEffect, useState } from "react";
// import { fetchTicketSales } from "services/user/orderService";
import { FormatPrice } from "utils/formatPrice";
import { fetchTicketSales } from "@/services/user/orderService";
import Loading1 from "@/components/ui/Loading1";

const TicketSalesPage = () => {
  const { scheduleId } = useParams();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get("page") || "1", 10) - 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false)
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchTicketSales(scheduleId, token, page);
        setData(data.data);
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      }
      finally {
        setIsLoading(false)
      }
    };
    fetchData();
  }, [scheduleId, token, page]);

  console.log("data ", data )

  if (!data)
    return (
      <div className="py-10 text-center text-lg font-medium text-gray-600">
        {/* Loading... */}
      </div>
    );

  // tính Net Sales
  const netSales = data.orders.reduce((total, order) => {
    return (
      total +
      order.orderTickets.reduce(
        // (sum, ot) => sum + ot.quantity * ot.priceAtPurchase,
        // 0,
        (sum, ot) => sum + ot.priceAtPurchase,
        0,
      )
    );
  }, 0);

  // tính tổng vé bán ra
  const totalTicketsSold = data.ticketSchedules.reduce(
    (total, ticket) => total + ticket.sold,
    0,
  );

  const totalTicketsIssued = data.ticketSchedules.reduce((total, ticket) => {
    return total + (ticket.availableQuantity || 0);
  }, 0);

  return (
    <div className="max-w-5xl px-6 md:px-1">
      <h1 className="font-logo text-main-bold mb-5 text-5xl font-semibold">
        Event Dashboard
      </h1>

      {/* Net Sales and Tickets Sold side by side */}
      <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col rounded-lg bg-white p-4 shadow-[0px_1px_9px_-1px_rgba(0,0,0,0.2)]">
          <h2 className="text-md mb-1 font-medium text-gray-800">Net Sales</h2>
          <p className="text-2xl font-bold text-gray-900">
            {FormatPrice(netSales)}
          </p>
        </div>
        <div className="flex flex-col rounded-lg bg-white p-4 shadow-[0px_1px_9px_-1px_rgba(0,0,0,0.2)]">
          <h2 className="text-md mb-1 font-medium text-gray-800">
            Tổng vé bán
          </h2>
          <p className="text-2xl font-bold text-gray-900">
            {totalTicketsSold.toLocaleString()} /{" "}
            {totalTicketsIssued.toLocaleString()}
          </p>
        </div>
      </section>

      {/* Sales by ticket type */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Doanh thu theo loại vé
        </h2>
        <table className="w-full table-auto border-collapse text-gray-700">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left font-bold">Loại vé</th>
              <th className="py-2 text-center font-bold">Lượt bán</th>
              <th className="py-2 text-right font-bold">Giá vé</th>
            </tr>
          </thead>
          <tbody>
            {data.ticketSchedules.map((ticket, idx) => (
              <tr key={ticket.id}>
                <td className="py-1 text-left">{ticket.ticketName}</td>
                <td className="py-1 text-center">
                  {ticket.sold}/{ticket.availableQuantity}
                </td>
                <td className="py-1 text-right">{FormatPrice(ticket.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Recent Orders */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Các đơn hàng gần đây
        </h2>
        {data.orders.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-500">
            <FaReceipt className="mb-3 h-12 w-12" />
            <p>Chưa có đơn hàng nào cho sự kiện này.</p>
          </div>
        ) : (
          <>
            <table className="w-full table-auto border-collapse text-gray-700">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 text-left font-bold">Đơn hàng #</th>
                  <th className="py-2 text-center font-bold">Tên người mua</th>
                  <th className="py-2 text-center font-bold">Số lượng</th>
                  <th className="py-2 text-center font-bold">Loại vé</th>
                  <th className="py-2 text-center font-bold">Giá lúc mua</th>
                  <th className="py-2 text-center font-bold">Check-in</th>
                  <th className="py-2 text-right font-bold">Ngày mua</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-3 text-center text-gray-500"
                    >
                      <div className="inline-flex items-center justify-center">
                        <Loading1 isLoading={isLoading} />
                      </div>
                    </td>
                  </tr>
                ) : data.orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-3 text-center text-gray-500"
                    >
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  data.orders.map((order) => (
                    <tr key={order.orderId} className="text-sm">
                      <td className="py-2 text-left font-medium text-gray-900">
                        {order.orderId}
                      </td>
                      <td className="py-2 text-center">{order.userName}</td>
                      <td className="py-2 text-center">
                        {order.orderTickets.reduce(
                          (sum, ot) => sum + ot.quantity,
                          0,
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {order.orderTickets
                          .map((ot) => ot.ticketName)
                          .join(", ") || "N/A"}
                      </td>
                      <td className="py-2 text-center font-semibold text-gray-900">
                        {FormatPrice(
                          order.orderTickets.reduce(
                            (sum, ot) => sum + ot.quantity * ot.priceAtPurchase,
                            0,
                          ),
                        )}
                      </td>
                      <td className="py-2 text-center">
                        {order.isCheckedIn ? (
                          <span className="text-green-600">✔ Đã check-in</span>
                        ) : (
                          <span className="text-red-600">✘ Chưa check-in</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        {new Date(order.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  const newPage = Math.max(page - 1, 0);
                  setPage(newPage);
                  navigate(`?page=${newPage + 1}`);
                }}
                disabled={page === 0}
                className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  navigate(`?page=${newPage + 1}`);
                }}
                disabled={page + 1 >= totalPages}
                className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default TicketSalesPage;
