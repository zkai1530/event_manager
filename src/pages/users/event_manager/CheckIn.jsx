import React, { useState, useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/library";
import Swal from "sweetalert2";
import { checkin } from "@/services/user/orderService";

function CheckIn() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      codeReader
        .decodeFromVideoDevice(null, videoRef.current, (result, error) => {
          if (result) {
            console.log("QR Code detected:", result.getText());
            const qrCodeText = result.getText();
            setScanResult(qrCodeText);
            checkIn(qrCodeText);
            setIsScanning(false);
          }
          if (error) {
            const errorMessage =
              error && error.message ? error.message : String(error);
            if (errorMessage.includes("NotFoundException")) {
              return; // Bỏ qua lỗi NotFoundException (bao gồm NotFoundException2)
            }
            console.error("QR Reader error:", error);
            setCameraError(
              JSON.stringify(
                { message: "QR Reader error", data: errorMessage },
                null,
                2,
              ),
            );
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          const errMessage = err && err.message ? err.message : String(err);
          setCameraError(
            JSON.stringify(
              { message: "Camera access error", data: errMessage },
              null,
              2,
            ),
          );
          setIsScanning(false);
        });
    }

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [isScanning]);

  const startScanner = () => {
    if (isScanning) return;
    setCameraError(null);
    setScanResult(null);
    setIsScanning(true);
  };

  const stopScanner = () => {
    setIsScanning(false);
  };

  const checkIn = async (qrCode) => {
    console.log("QR Code scanned:", qrCode);
    const token = localStorage.getItem("token");
    try {
      const data = await checkin(qrCode, token);
      console.log("API response: ", data);
      setScanResult(JSON.stringify(data, null, 2));

      // Xử lý hiển thị modal dựa trên message
      if (data.message === "Check in successfully!") {
        const { data: ticketData } = data;
        Swal.fire({
          title: "Check-in Thành Công!",
          html: `
            <div style="text-align: left; font-size: 16px;">
              <p><strong>Order ID:</strong> ${ticketData.orderId}</p>
              <p><strong>Event:</strong> ${ticketData.eventName}</p>
              <p><strong>Date:</strong> ${ticketData.scheduleDate}</p>
              <p><strong>Time:</strong> ${ticketData.startTime} - ${ticketData.endTime}</p>
              <p><strong>Total Quantity:</strong> ${ticketData.totalQuantity}</p>
              <h3 style="margin-top: 10px;">Tickets:</h3>
              <ul>
                ${ticketData.orderTickets
                  .map(
                    (ticket) =>
                      `<li>${ticket.ticketName} (Qty: ${ticket.quantity})</li>`,
                  )
                  .join("")}
              </ul>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
        });
      } else if (data.message === "This order already checked in!") {
        Swal.fire({
          title: "Lỗi!",
          text: "Đơn hàng này đã được check-ian!",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.log("Check-in error: ", error.response?.data);
      setScanResult(
        JSON.stringify(
          { message: "Error scanning QR", data: error.message },
          null,
          2,
        ),
      );
      if (error.response?.data?.message === 'This order already checked in!') {
        Swal.fire({
          title: "Lỗi!",
          text: "Đơn hàng này đã được check-in!",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else if (error.response?.data?.message === "Access Denied! (unauthorized)") {
        Swal.fire({
          title: "Lỗi!",
          text: "Bạn không có quyền quét mã check-in của sự kiện này!",
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Lỗi!",
          text: "Mã QR không hợp lệ!",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold">Check in</h1>
        {!isScanning && (
          <button
            onClick={startScanner}
            className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
          >
            Bắt đầu quét
          </button>
        )}
        {isScanning && (
          <div>
            <video
              ref={videoRef}
              className="mb-4 h-[300px] w-full border-2 border-gray-300"
              autoPlay
            />
            <button
              onClick={stopScanner}
              className="mt-4 w-full rounded bg-red-500 py-2 text-white hover:bg-red-600"
            >
              Huỷ quét
            </button>
          </div>
        )}
        {cameraError && (
          <div className="mt-4 rounded bg-red-100 p-4 text-red-600">
            <pre className="max-h-40 overflow-auto text-sm">{cameraError}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;
