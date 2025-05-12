import React, { useState, useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/library";

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
            setScanResult(result.getText());
            checkIn(result.getText());
            setIsScanning(false);
          }
          if (error) {
            console.error("QR Reader error:", error);
            setCameraError(
              JSON.stringify(
                { message: "QR Reader error", data: error.message },
                null,
                2,
              ),
            );
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setCameraError(
            JSON.stringify(
              { message: "Camera access error", data: err.message },
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
    console.log("QR Code scanned:", qrCode); // Log giá trị QR code
    const token =
      "eyJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJldmVudF9tYW5hZ2VyLmNvbSIsInN1YiI6InprYWkiLCJleHAiOjE3NDY5MzYyOTMsImlhdCI6MTc0Njg0OTg5MywianRpIjoiNGExOTY5YmQtN2QxOC00YzdlLTk1ZmEtMjBhOWYzNjRiMjZlIiwic2NvcGUiOiJVU0VSIn0.N9INuIICVZCF44fVLmLV6vj0mqvX83Rcb2flGSBJwITux7GURDcOUhRKt5Xxz5SjF1IJgX8jsy47mcRp-vTfIw";
    try {
      const response = await fetch(
        "https://event-manager-5elo.onrender.com/order/check-in",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ qrCode }),
        },
      );
      const data = await response.json();
      console.log("API response:", data); // Log phản hồi từ API
      setScanResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("API error:", error);
      setScanResult(
        JSON.stringify(
          { message: "Error scanning QR", data: error.message },
          null,
          2,
        ),
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold">QR Code Scanner</h1>
        {!isScanning && (
          <button
            onClick={startScanner}
            className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
          >
            Start Scanning
          </button>
        )}
        {isScanning && (
          <div>
            <video
              ref={videoRef}
              className="mb-4 h-[300px] w-full border-2 border-gray-300"
            />
            <button
              onClick={stopScanner}
              className="mt-4 w-full rounded bg-red-500 py-2 text-white hover:bg-red-600"
            >
              Stop Scanning
            </button>
          </div>
        )}
        {cameraError && (
          <div className="mt-4 rounded bg-red-100 p-4 text-red-600">
            <pre className="max-h-40 overflow-auto text-sm">{cameraError}</pre>
          </div>
        )}
        {scanResult && (
          <div className="mt-4 rounded bg-gray-200 p-4">
            <pre className="max-h-40 overflow-auto text-sm">{scanResult}</pre>
            {JSON.parse(scanResult).message === "Check in successfully!" && (
              <div className="mt-2">
                <h2 className="text-lg font-semibold">Check-in Details</h2>
                <p>Order ID: {JSON.parse(scanResult).data.orderId}</p>
                <p>Event: {JSON.parse(scanResult).data.eventName}</p>
                <p>Date: {JSON.parse(scanResult).data.scheduleDate}</p>
                <p>
                  Time: {JSON.parse(scanResult).data.startTime} -{" "}
                  {JSON.parse(scanResult).data.endTime}
                </p>
                <p>
                  Total Quantity: {JSON.parse(scanResult).data.totalQuantity}
                </p>
                <h3 className="mt-2 font-semibold">Tickets:</h3>
                <ul>
                  {JSON.parse(scanResult).data.orderTickets.map(
                    (ticket, index) => (
                      <li key={index}>
                        {ticket.ticketName} (Qty: {ticket.quantity})
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
            {JSON.parse(scanResult).message ===
              "This order already checked in!" && (
              <p className="mt-2 text-red-500">Order already checked in!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckIn;
