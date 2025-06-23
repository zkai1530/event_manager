import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaMinus,
  FaPlus,
  FaMousePointer,
  FaHandPaper,
  FaCrosshairs,
  FaChair,
  FaTable,
} from "react-icons/fa";
import { getVenueMap } from "@/services/user/seatmapService";

const SEAT_SPACING = 20;

const ViewSeatMap = () => {
  const [venueMap, setVenueMap] = useState(null);
  const [toolMode, setToolMode] = useState("select"); // 'select', 'pan'
  const [capacity, setCapacity] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const hasFocusedStage = useRef(false);
  const token = localStorage.getItem("token");

  // Gọi API getVenueMap khi component mount
  useEffect(() => {
    const fetchVenueMap = async () => {
      try {
        const data = await getVenueMap(3, token);
        setVenueMap({
          stage: {
            id: "stage_1",
            position: { x: data.stagePositionX, y: data.stagePositionY },
            width: data.stageWidth,
            height: data.stageHeight,
          },
          sections: data.sections.map((section) => ({
            id: section.sectionId.toString(),
            name: section.name,
            type: "theater",
            rows: section.totalRows,
            seatsPerRow: section.seatsPerRow,
            position: { x: section.positionX, y: section.positionY },
            rotation: section.rotation || 0,
            theaterCurve: section.theaterCurve || 0,
            rowLabels: section.seats
              .map((seat) => seat.rowLabel)
              .filter((v, i, a) => a.indexOf(v) === i)
              .sort(),
            seatLabels: section.seats
              .map((seat) => seat.seatLabel)
              .filter((v, i, a) => a.indexOf(v) === i)
              .sort((a, b) => parseInt(a) - parseInt(b)),
            seats: section.seats.map((seat) => ({
              rowLabel: seat.rowLabel,
              seatLabel: seat.seatLabel,
              status: seat.status, // Thêm status
            })),
          })),
        });
      } catch (error) {
        console.error(
          "Lỗi khi lấy VenueMap:",
          error.response?.data || error.message,
        );
      }
    };
    fetchVenueMap();
  }, []);

  // Tính toán capacity
  useEffect(() => {
    if (!venueMap) return;
    let total = 0;
    venueMap.sections.forEach((section) => {
      total += section.rows * section.seatsPerRow;
    });
    setCapacity(total);
  }, [venueMap]);

  // Focus stage khi venueMap được load
  useEffect(() => {
    if (venueMap?.stage && !hasFocusedStage.current) {
      focusStage();
      hasFocusedStage.current = true;
    }
  }, [venueMap]);

  const focusStage = () => {
    if (!venueMap?.stage) return;
    const stage = venueMap.stage;
    const canvasWidth = 1200;
    const canvasHeight = 600;
    const stageCenterX = stage.position.x + stage.width / 2;
    const stageCenterY = stage.position.y + stage.height / 2;
    const newOffsetX = canvasWidth / 2 - stageCenterX * zoomLevel;
    const newOffsetY = canvasHeight / 2 - stageCenterY * zoomLevel;
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
    setToolMode("select");
    setSelectedStage(stage.id);
  };

  const Stage = ({ stage }) => {
    const { id, position, width, height } = stage;
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedStage(id);
          setSelectedSections([]);
          setSelectedSection(null);
          setToolMode("select");
        }}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: width,
          height: height,
          backgroundColor: "rgba(217, 255, 251, 0.5)",
          border:
            selectedStage === id ? "2px solid #40e0d0" : "2px solid #40e0d0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "default",
          zIndex: selectedStage === id ? 10 : 0,
        }}
        className="rounded-lg"
      >
        <span className="font-bold text-gray-800">Sân khấu</span>
      </div>
    );
  };

  const Section = ({ section, zoomLevel, seats }) => {
    const {
      id,
      name,
      type,
      rows,
      seatsPerRow,
      position,
      rotation,
      theaterCurve,
      rowLabels,
      seatLabels,
    } = section;
    const curveEffect = Math.abs(theaterCurve) * 0.8;
    const baseWidth =
      type === "theater" ? seatsPerRow * SEAT_SPACING + curveEffect * 2 : 200;
    const baseHeight =
      type === "theater" ? rows * SEAT_SPACING + Math.abs(theaterCurve) : 200;
    const width = baseWidth * zoomLevel;
    const height = baseHeight * zoomLevel;

    return (
      <div
        className="bg-opacity-80 relative rounded-lg p-2 transition-all duration-200"
        onClick={(e) => {
          if (isCtrlPressed) return;
          e.stopPropagation();
          if (toolMode === "select" && isShiftPressed) {
            setSelectedSections((prev) =>
              prev.includes(id)
                ? prev.filter((secId) => secId !== id)
                : [...prev, id],
            );
          } else {
            setSelectedSection(id);
            setSelectedSections([id]);
          }
        }}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: width,
          height: height,
          transform: `rotate(${rotation}deg) scale(${zoomLevel})`,
          transformOrigin: "0 0",
          border: selectedSections.includes(id)
            ? "2px solid #3b82f6"
            : selectedSection === id
              ? "2px solid #3b82f6"
              : "none",
          cursor: "default",
          zIndex: selectedSections.includes(id) ? 10 : 1,
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full transform"
          style={{
            transform: `scale(${1 / zoomLevel})`,
            transformOrigin: "center bottom",
            whiteSpace: "nowrap",
            zIndex: 100,
          }}
        >
          <span className="rounded bg-blue-600 px-2 py-1 text-sm font-semibold text-white">
            {name}
          </span>
        </div>

        <div className="flex h-full w-full flex-col items-center">
          {type === "theater" ? (
            <div className="relative h-full w-full">
              {Array.from({ length: rows }).map((_, rowIndex) => {
                const center = (seatsPerRow - 1) / 2;
                const distanceFromCenterForLabel = Math.abs(0 - center);
                const curveFactorForLabel =
                  theaterCurve > 0
                    ? Math.pow(distanceFromCenterForLabel, 1.5) *
                      theaterCurve *
                      0.08
                    : -Math.pow(distanceFromCenterForLabel, 1.5) *
                      Math.abs(theaterCurve) *
                      0.08;

                return (
                  <div
                    key={rowIndex}
                    className="absolute right-0 left-0 flex justify-center"
                    style={{
                      top: `${rowIndex * SEAT_SPACING}px`,
                    }}
                  >
                    <div
                      className="absolute flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
                      style={{
                        left: `-${SEAT_SPACING}px`,
                        top: `${curveFactorForLabel + 8}px`,
                        transform: "translateY(-50%)",
                      }}
                    >
                      <span style={{ transform: `rotate(${-rotation}deg)` }}>
                        {rowLabels[rowIndex]}
                      </span>
                    </div>

                    {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                      const distanceFromCenter = Math.abs(seatIndex - center);
                      const curveFactor =
                        theaterCurve > 0
                          ? Math.pow(distanceFromCenter, 1.5) *
                            theaterCurve *
                            0.08
                          : -Math.pow(distanceFromCenter, 1.5) *
                            Math.abs(theaterCurve) *
                            0.08;
                      // Tìm seat tương ứng
                      const seat = seats.find(
                        (s) =>
                          s.rowLabel === rowLabels[rowIndex] &&
                          s.seatLabel === seatLabels[seatIndex],
                      );
                      const seatStatus = seat?.status || "AVAILABLE"; // Mặc định là AVAILABLE nếu không có status
                      const seatColor = {
                        SOLD: "bg-red-500 border-red-600",
                        AVAILABLE: "bg-gray-300 border-gray-400",
                        RESERVED: "bg-yellow-400 border-yellow-500",
                      }[seatStatus];

                      return (
                        <div
                          key={`${rowIndex}-${seatIndex}`}
                          className={`absolute flex h-4 w-4 items-center justify-center rounded-full ${seatColor}`}
                          style={{
                            left: `${seatIndex * SEAT_SPACING}px`,
                            top: `${curveFactor}px`,
                          }}
                        >
                          <span
                            className="text-[6px]"
                            style={{
                              transform: `rotate(${-rotation}deg)`,
                              display: "block",
                            }}
                          >
                            {rowLabels[rowIndex]}
                            {seatLabels[seatIndex]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="relative flex h-full w-full items-center justify-center">
              <div
                className="flex items-center justify-center"
                style={{
                  width: "80%",
                  height: "80%",
                  borderRadius: `${section.curve}%`,
                  background: "transparent",
                  border: "2px dashed #94a3b8",
                }}
              >
                <span className="text-sm font-bold text-gray-700">{name}</span>
              </div>
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 60 + rotation) * (Math.PI / 180);
                const distance = 70;
                const size = 16;
                return (
                  <div
                    key={i}
                    className="absolute flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 bg-gray-300"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * distance}px - ${size / 2}px)`,
                      top: `calc(50% + ${Math.sin(angle) * distance}px - ${size / 2}px)`,
                      width: `${size}px`,
                      height: `${size}px`,
                    }}
                  >
                    <span
                      className="text-[6px]"
                      style={{
                        transform: `rotate(${-rotation}deg)`,
                        display: "block",
                      }}
                    >
                      {name[0]}
                      {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const VenueCanvas = () => {
    const handleWheel = (e) => {
      if (!e.shiftKey && !isCtrlPressed) return;
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      const step = 0.1;
      const prevZoom = zoomLevel;
      const newZoom = Math.min(Math.max(0.5, zoomLevel + direction * step), 2);
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;
      const offsetX = canvasOffset.x - (mouseX / prevZoom - mouseX / newZoom);
      const offsetY = canvasOffset.y - (mouseY / prevZoom - mouseY / newZoom);
      setCanvasOffset({ x: offsetX, y: offsetY });
      setZoomLevel(newZoom);
    };

    const handleMouseDown = (e) => {
      if (toolMode === "pan" || (isCtrlPressed && toolMode === "select")) {
        setIsDraggingCanvas(true);
        setDragStart({
          x: e.clientX - canvasOffset.x,
          y: e.clientY - canvasOffset.y,
        });
        return;
      }
      if (toolMode === "select" && isShiftPressed) {
        const rect = e.currentTarget.getBoundingClientRect();
        setSelectionBox({
          startX: e.clientX - rect.left,
          startY: e.clientY - rect.top,
          endX: e.clientX - rect.left,
          endY: e.clientY - rect.top,
        });
      }
    };

    const handleMouseMove = (e) => {
      if (isCtrlPressed && isDraggingCanvas) {
        const canvasWidth = 1200;
        const canvasHeight = 600;
        const newOffsetX = e.clientX - dragStart.x;
        const newOffsetY = e.clientY - dragStart.y;
        const maxOffsetX = canvasWidth / 2;
        const minOffsetX = -maxOffsetX;
        const maxOffsetY = canvasHeight / 2;
        const minOffsetY = -maxOffsetY;
        setCanvasOffset({
          x: Math.min(maxOffsetX, Math.max(minOffsetX, newOffsetX)),
          y: Math.min(maxOffsetY, Math.max(minOffsetY, newOffsetY)),
        });
      } else if (selectionBox && isShiftPressed) {
        const rect = e.currentTarget.getBoundingClientRect();
        setSelectionBox({
          ...selectionBox,
          endX: e.clientX - rect.left,
          endY: e.clientY - rect.top,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCanvas(false);
      if (selectionBox && isShiftPressed) {
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const maxX = Math.max(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const maxY = Math.max(selectionBox.startY, selectionBox.endY);
        const canvasMinX = (minX - canvasOffset.x) / zoomLevel;
        const canvasMaxX = (maxX - canvasOffset.x) / zoomLevel;
        const canvasMinY = (minY - canvasOffset.y) / zoomLevel;
        const canvasMaxY = (maxY - canvasOffset.y) / zoomLevel;
        const newSelectedSections = venueMap.sections
          .filter((section) => {
            const { x, y } = section.position;
            let width, height;
            if (section.type === "theater") {
              const curveEffect = Math.abs(section.theaterCurve) * 0.8;
              width = section.seatsPerRow * 30 + curveEffect * 2;
              height = section.rows * 30 + Math.abs(section.theaterCurve);
            } else {
              width = 200;
              height = 200;
            }
            const sectionRight = x + width;
            const sectionBottom = y + height;
            return (
              x >= canvasMinX &&
              y >= canvasMinY &&
              sectionRight <= canvasMaxX &&
              sectionBottom <= canvasMaxY
            );
          })
          .map((s) => s.id);
        setSelectedSections(newSelectedSections);
        setSelectionBox(null);
      } else {
        setSelectionBox(null);
      }
    };

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Control") setIsCtrlPressed(true);
        if (e.key === "Shift") setIsShiftPressed(true);
        if (e.key === "f" || e.key === "F") focusStage();
      };
      const handleKeyUp = (e) => {
        if (e.key === "Control") setIsCtrlPressed(false);
        if (e.key === "Shift") setIsShiftPressed(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [venueMap, zoomLevel]);

    return (
      <div
        className="relative h-[600px] w-full overflow-hidden rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100"
        onClick={() => {
          setSelectedSection(null);
          setSelectedStage(null);
          setSelectedSections([]);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor:
            toolMode === "pan"
              ? isDraggingCanvas
                ? "grabbing"
                : "grab"
              : "default",
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.02) 2px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 2px, transparent 1px)`,
          backgroundSize: `30px 30px`,
          backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: "0 0",
            transition: isDraggingCanvas ? "none" : "transform 0.1s ease",
          }}
        >
          {selectionBox && (
            <div
              className="bg-opacity-30 absolute border-2 border-blue-400 bg-blue-100"
              style={{
                left:
                  (Math.min(selectionBox.startX, selectionBox.endX) -
                    canvasOffset.x) /
                  zoomLevel,
                top:
                  (Math.min(selectionBox.startY, selectionBox.endY) -
                    canvasOffset.y) /
                  zoomLevel,
                width:
                  Math.abs(selectionBox.endX - selectionBox.startX) / zoomLevel,
                height:
                  Math.abs(selectionBox.endY - selectionBox.startY) / zoomLevel,
              }}
            />
          )}
          {venueMap?.stage && <Stage stage={venueMap.stage} />}
          {venueMap?.sections?.map((section) => (
            <Section
              key={section.id}
              section={section}
              zoomLevel={zoomLevel}
              seats={section.seats}
            />
          ))}
        </div>

        {!venueMap && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="mb-4 text-2xl">Loading Venue Map...</div>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 rounded-lg bg-white/80 px-3 py-2 text-sm shadow-md backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="font-semibold">Capacity:</div>
              <div className="font-bold text-blue-600">{capacity}</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="font-semibold">Zoom:</div>
              <div className="font-bold text-blue-600">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-4 bottom-4 text-xs text-gray-500">
          {isCtrlPressed
            ? "Drag to pan | Release Ctrl to exit pan mode"
            : `Hold Ctrl to pan | Shift+Scroll to zoom${isShiftPressed ? " | Shift + drag to select multiple sections" : ""}`}
        </div>
      </div>
    );
  };

  const Toolbar = () => {
    return (
      <div className="mb-4 flex items-center space-x-2">
        <button
          onClick={() => setToolMode("select")}
          className={`flex items-center rounded-lg px-3 py-2 ${toolMode === "select" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
        >
          <FaMousePointer className="mr-2" />
          Select
        </button>
        <button
          onClick={() => setToolMode("pan")}
          className={`flex items-center rounded-lg px-3 py-2 ${toolMode === "pan" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
        >
          <FaHandPaper className="mr-2" />
          Pan
        </button>
        <button
          onClick={focusStage}
          className="flex items-center rounded-lg bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
        >
          <FaCrosshairs className="mr-2" />
          Focus Stage
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  View Venue Map
                </h1>
                <p className="mt-1 text-gray-600">
                  View the seating arrangement for your event.
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 px-4 py-2">
                <div className="flex items-center">
                  <span className="mr-2 font-medium text-gray-700">
                    Capacity:
                  </span>
                  <span className="font-bold text-blue-700">{capacity}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Toolbar />
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
              <VenueCanvas />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSeatMap;
