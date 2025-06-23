// src/App.js
import { createSeatMap } from "@/services/user/seatmapService";
import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FaMinus,
  FaPlus,
  FaTrash,
  FaMousePointer,
  FaHandPaper,
  FaPlusCircle,
  FaChair,
  FaTable,
  FaCrosshairs,
} from "react-icons/fa";
import { FaRotateLeft, FaRotateRight } from "react-icons/fa6";
import Swal from "sweetalert2";

const SEAT_SPACING = 20;

const SeatMap6 = () => {
  const [venueMap, setVenueMap] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [sectionType, setSectionType] = useState("theater");
  const [rows, setRows] = useState(5);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [sectionName, setSectionName] = useState("");
  const [selectedSection, setSelectedSection] = useState(null);
  const [toolMode, setToolMode] = useState("select"); // 'select', 'pan', 'add'
  const [capacity, setCapacity] = useState(0);
  const [sectionCounter, setSectionCounter] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectedSections, setSelectedSections] = useState([]);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  // Tính toán tổng số chỗ ngồi
  useEffect(() => {
    if (!venueMap) return;

    let total = 0;
    venueMap.sections.forEach((section) => {
      if (section.type === "theater") {
        total += section.rows * section.seatsPerRow;
      } else {
        // Giả định mỗi bàn tròn có 6 chỗ
        total += 6;
      }
    });

    setCapacity(total);
  }, [venueMap]);

  const focusStage = () => {
    if (!venueMap?.stage) return;

    const stage = venueMap.stage;
    const canvasWidth = 1200; // Kích thước canvas
    const canvasHeight = 600;

    // Tính toán vị trí center stage trong hệ tọa độ gốc
    const stageCenterX = stage.position.x + stage.width / 2;
    const stageCenterY = stage.position.y + stage.height / 2;

    // Tính toán offset để stage nằm giữa canvas
    const newOffsetX = canvasWidth / 2 - stageCenterX * zoomLevel;
    const newOffsetY = canvasHeight / 2 - stageCenterY * zoomLevel;

    setCanvasOffset({
      x: newOffsetX,
      y: newOffsetY,
    });

    setToolMode("select");
    setSelectedStage(stage.id);
  };

  const handleDoubleClickSectionName = (e, sectionId, currentName) => {
    e.stopPropagation();
    setEditingSectionId(sectionId);
    setIsEditing(true);

    setIsShiftPressed(false);
    setIsCtrlPressed(false);
  };

  const updateSectionName = (id, name) => {
    setVenueMap((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id ? { ...section, name } : section,
      ),
    }));
    setEditingSectionId(null);
    setIsEditing(false);
  };

  const handleNameEditKeyDown = (e, id) => {
    if (e.key === "Enter") {
      updateSectionName(id, e.target.value);
    } else if (e.key === "Escape") {
      setEditingSectionId(null);
      setIsEditing(false);
    }
  };

  // Focus vào input khi bắt đầu chỉnh sửa
  useEffect(() => {
    if (editingSectionId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSectionId]);

  const handleCreateVenue = () => {
    setVenueMap({
      sections: [],
      stage: {
        id: "stage_1",
        position: { x: 600, y: 300 }, // Ở giữa canvas (giả định 1200x600px)
        width: 200, // Kích thước mặc định
        height: 50,
      },
    });
    setShowEditor(false);
  };

  const addSection = () => {
    const name = sectionName || `Section ${sectionCounter}`;

    const newSection = {
      id: Date.now().toString(),
      name,
      type: sectionType,
      rows,
      seatsPerRow,
      position: { x: 200, y: 200 },
      rotation: 0,
      curve: sectionType === "circular" ? 50 : 0,
      theaterCurve: 0, // Thêm theater curve
      rowLabels: Array.from({ length: rows }, (_, i) =>
        String.fromCharCode(65 + i),
      ),
      seatLabels: Array.from({ length: seatsPerRow }, (_, i) =>
        (i + 1).toString(),
      ),
    };

    setVenueMap((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));

    setSectionCounter((prev) => prev + 1);
    setSectionName("");
    setShowEditor(false);
    setToolMode("select");
  };

  const adjustTheaterCurve = (id, curve) => {
    setVenueMap((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              theaterCurve: Math.max(
                -50,
                Math.min(50, section.theaterCurve + curve),
              ),
            }
          : section,
      ),
    }));
  };

  const moveSection = (id, left, top) => {
    setVenueMap((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id
          ? { ...section, position: { x: left, y: top } }
          : section,
      ),
    }));
  };

  const rotateSection = (id, angle) => {
    setVenueMap((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id
          ? { ...section, rotation: (section.rotation + angle) % 360 }
          : section,
      ),
    }));
  };

  const adjustCurve = (id, curve) => {
    setVenueMap((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              curve: Math.max(10, Math.min(100, section.curve + curve)),
            }
          : section,
      ),
    }));
  };

  const deleteSection = (id) => {
    // Xóa nhiều section nếu đang chọn nhiều
    if (selectedSections.length > 1 && selectedSections.includes(id)) {
      setVenueMap((prev) => ({
        ...prev,
        sections: prev.sections.filter(
          (section) => !selectedSections.includes(section.id),
        ),
      }));
      setSelectedSections([]);
      setSelectedSection(null);
    }
    // Xóa section đơn lẻ
    else {
      setVenueMap((prev) => ({
        ...prev,
        sections: prev.sections.filter((section) => section.id !== id),
      }));
      setSelectedSection(null);
      setSelectedSections([]);
    }
  };

  // const updateSectionName = (id, name) => {
  //   setVenueMap((prev) => ({
  //     ...prev,
  //     sections: prev.sections.map((section) =>
  //       section.id === id ? { ...section, name } : section,
  //     ),
  //   }));
  // };

  const Stage = ({ stage }) => {
    const { id, position, width, height } = stage;

    const [{ isDragging }, drag] = useDrag({
      type: "STAGE",
      item: { type: "STAGE", id, left: position.x, top: position.y }, // Thêm type
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    const [, dragTop] = useDrag({
      type: "STAGE_RESIZE",
      item: { type: "STAGE_RESIZE", id, edge: "top" }, // Thêm type
      collect: (monitor) => ({}),
    });

    const [, dragRight] = useDrag({
      type: "STAGE_RESIZE",
      item: { type: "STAGE_RESIZE", id, edge: "right" },
      collect: (monitor) => ({}),
    });

    const [, dragBottom] = useDrag({
      type: "STAGE_RESIZE",
      item: { type: "STAGE_RESIZE", id, edge: "bottom" },
      collect: (monitor) => ({}),
    });

    const [, dragLeft] = useDrag({
      type: "STAGE_RESIZE",
      item: { type: "STAGE_RESIZE", id, edge: "left" },
      collect: (monitor) => ({}),
    });

    return (
      <div
        ref={drag}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedStage(id);
          setSelectedSections([]); // Bỏ chọn sections
          setSelectedSection(null); // Bỏ chọn section đơn
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
          cursor: toolMode === "select" ? "move" : "default",
          opacity: isDragging ? 0.5 : 1,
          zIndex: selectedStage === id ? 10 : 0, // Đưa stage lên trên khi chọn
        }}
        className="rounded-lg"
      >
        <span className="font-bold text-gray-800">Sân khấu</span>
        {selectedStage === id && (
          <>
            <div
              ref={dragTop}
              style={{
                position: "absolute",
                top: -5,
                left: "50%",
                width: 10,
                height: 10,
                backgroundColor: "#40e0d0",
                borderRadius: "50%",
                cursor: "ns-resize",
                transform: "translateX(-50%)",
              }}
            />
            <div
              ref={dragRight}
              style={{
                position: "absolute",
                right: -5,
                top: "50%",
                width: 10,
                height: 10,
                backgroundColor: "#40e0d0",
                borderRadius: "50%",
                cursor: "ew-resize",
                transform: "translateY(-50%)",
              }}
            />
            <div
              ref={dragBottom}
              style={{
                position: "absolute",
                bottom: -5,
                left: "50%",
                width: 10,
                height: 10,
                backgroundColor: "#40e0d0",
                borderRadius: "50%",
                cursor: "ns-resize",
                transform: "translateX(-50%)",
              }}
            />
            <div
              ref={dragLeft}
              style={{
                position: "absolute",
                left: -5,
                top: "50%",
                width: 10,
                height: 10,
                backgroundColor: "#40e0d0",
                borderRadius: "50%",
                cursor: "ew-resize",
                transform: "translateY(-50%)",
              }}
            />
          </>
        )}
      </div>
    );
  };

  const Section = ({ section, zoomLevel }) => {
    const {
      id,
      name,
      type,
      rows,
      seatsPerRow,
      position,
      rotation,
      curve,
      theaterCurve,
      rowLabels,
      seatLabels,
    } = section;

    const [{ isDragging }, drag] = useDrag({
      type: "SECTION",
      item: {
        id,
        left: position.x,
        top: position.y,
        isMultiSelect:
          selectedSections.includes(id) && selectedSections.length > 1,
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    // Tính toán kích thước dựa trên curve
    const curveEffect = Math.abs(theaterCurve) * 0.8;
    const baseWidth =
      type === "theater" ? seatsPerRow * SEAT_SPACING + curveEffect * 2 : 200;
    const baseHeight =
      type === "theater" ? rows * SEAT_SPACING + Math.abs(theaterCurve) : 200;

    const width = baseWidth * zoomLevel;
    const height = baseHeight * zoomLevel;

    return (
      <div
        ref={drag}
        className="bg-opacity-80 relative rounded-lg p-2 transition-all duration-200"
        onClick={(e) => {
          if (isCtrlPressed) return;

          e.stopPropagation();

          // Xử lý chọn nhiều với Shift
          if (toolMode === "select" && isShiftPressed) {
            setSelectedSections((prev) =>
              prev.includes(id)
                ? prev.filter((secId) => secId !== id)
                : [...prev, id],
            );
          }
          // Chọn đơn lẻ
          else {
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
          transform: `rotate(${rotation}deg) scale(${zoomLevel})`, // Thêm scale
          transformOrigin: "0 0",
          border: selectedSections.includes(id)
            ? "2px solid #3b82f6"
            : selectedSection === id
              ? "2px solid #3b82f6"
              : "none",
          cursor: isCtrlPressed
            ? "default"
            : toolMode === "select"
              ? "move"
              : "default",
          opacity: isDragging ? 0.5 : 1,
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
            pointerEvents: "auto",
          }}
        >
          {editingSectionId === id ? (
            <input
              ref={inputRef}
              type="text"
              defaultValue={name}
              onKeyDown={(e) => handleNameEditKeyDown(e, id)}
              onBlur={(e) => updateSectionName(id, e.target.value)}
              className="bg-main inline-none rounded px-2 py-1 text-sm font-semibold text-white"
              style={{ minWidth: "80px" }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="bg-main cursor-text rounded px-2 py-1 text-sm font-semibold text-white"
              onDoubleClick={(e) => handleDoubleClickSectionName(e, id)}
              onClick={(e) => e.stopPropagation()}
            >
              {name}
            </span>
          )}
        </div>

        <div className="flex h-full w-full flex-col items-center justify-center">
          {type === "theater" ? (
            <div className="relative h-full w-full">
              {Array.from({ length: rows }).map((_, rowIndex) => {
                const center = (seatsPerRow - 1) / 2;

                // Tính toán vị trí cho nhãn hàng
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
                    {/* Hiển thị nhãn hàng với độ cong */}
                    <div
                      className="bg-main absolute flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
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

                      // Tính toán độ cong cho từng ghế
                      const curveFactor =
                        theaterCurve > 0
                          ? Math.pow(distanceFromCenter, 1.5) *
                            theaterCurve *
                            0.08
                          : -Math.pow(distanceFromCenter, 1.5) *
                            Math.abs(theaterCurve) *
                            0.08;

                      return (
                        <div
                          key={`${rowIndex}-${seatIndex}`}
                          className="absolute flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 bg-gray-300"
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
                  borderRadius: `${curve}%`,
                  background: "transparent",
                  border: "2px dashed #94a3b8",
                }}
              >
                <span className="text-sm font-bold text-gray-700">{name}</span>
              </div>

              {/* Hiển thị các ghế xung quanh bàn */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 60 + rotation) * (Math.PI / 180);
                const distance = 70;
                const size = 16;

                return (
                  <div
                    key={i}
                    className="absolute flex h-4 w-4 items-center justify-center rounded-full border border-gray-400 bg-gray-300"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * distance}px - ${size / 2}px`,
                      top: `calc(50% + ${Math.sin(angle) * distance}px - ${size / 2}px`,
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

        {selectedSection === id && (
          <div className="absolute right-0 -bottom-16 left-0 flex flex-col items-center">
            <div className="mb-2 flex justify-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rotateSection(id, -15);
                }}
                className="rounded-full bg-white p-2 shadow hover:bg-gray-100"
                title="Rotate left"
              >
                <FaRotateLeft className="text-blue-600" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  rotateSection(id, 15);
                }}
                className="rounded-full bg-white p-2 shadow hover:bg-gray-100"
                title="Rotate right"
              >
                <FaRotateRight className="text-blue-600" />
              </button>

              {/* Chỉ hiển thị nút curve cho theater */}
              {type === "theater" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      adjustTheaterCurve(id, -1);
                    }}
                    className="rounded-full bg-white p-2 shadow hover:bg-gray-100"
                    title="Decrease curve"
                  >
                    <FaMinus className="text-blue-600" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      adjustTheaterCurve(id, 1);
                    }}
                    className="rounded-full bg-white p-2 shadow hover:bg-gray-100"
                    title="Increase curve"
                  >
                    <FaPlus className="text-blue-600" />
                  </button>
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSection(id);
                }}
                className="rounded-full bg-white p-2 shadow hover:bg-red-50"
                title="Delete section"
              >
                <FaTrash className="text-red-500" />
              </button>
            </div>

            {/* Slider điều chỉnh curve cho theater */}
            {type === "theater" && (
              <div className="w-48">
                <div className="mb-1 text-xs text-gray-600">
                  Curve:{" "}
                  {theaterCurve > 0
                    ? `Down ${theaterCurve}%`
                    : `Up ${Math.abs(theaterCurve)}%`}
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={theaterCurve}
                  onChange={(e) =>
                    adjustTheaterCurve(
                      id,
                      parseInt(e.target.value) - theaterCurve,
                    )
                  }
                  className="w-full"
                />
              </div>
            )}

            {/* Slider cho circular section */}
            {type === "circular" && (
              <div className="w-48">
                <div className="mb-1 text-xs text-gray-600">
                  Curve: {curve}%
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={curve}
                  onChange={(e) =>
                    adjustCurve(id, parseInt(e.target.value) - curve)
                  }
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const VenueCanvas = () => {
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const [, drop] = useDrop({
      accept: ["SECTION", "STAGE", "STAGE_RESIZE"],
      drop(item, monitor) {
        if (toolMode !== "select") return;

        const delta = monitor.getDifferenceFromInitialOffset();
        const dx = Math.round(delta.x / zoomLevel);
        const dy = Math.round(delta.y / zoomLevel);

        if (item.type === "STAGE") {
          moveStage(item.id, item.left + dx, item.top + dy);
        } else if (item.type === "STAGE_RESIZE") {
          resizeStage(item.id, item.edge, dx, dy);
        } else if (
          selectedSections.length > 0 &&
          selectedSections.includes(item.id)
        ) {
          moveSections(dx, dy);
        } else {
          moveSection(item.id, item.left + dx, item.top + dy);
        }
        return undefined;
      },
    });

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (isEditing) return;

        if (e.key === "Control") {
          setIsCtrlPressed(true);
        }
        if (e.key === "Shift") {
          setIsShiftPressed(true);
        }

        // Thêm phím tắt focus stage (F)
        if (!isEditing && (e.key === "f" || e.key === "F")) {
          focusStage();
        }
      };

      const handleKeyUp = (e) => {
        if (isEditing) return;
        if (e.key === "Control") {
          setIsCtrlPressed(false);
        }
        if (e.key === "Shift") {
          setIsShiftPressed(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [venueMap, zoomLevel, focusStage, isEditing]);

    const handleWheel = (e) => {
      if (!e.shiftKey && !isCtrlPressed) return;
      e.preventDefault();

      // Xác định hướng lăn chuột
      const direction = e.deltaY > 0 ? -1 : 1;
      const step = 0.1; // 10%

      const prevZoom = zoomLevel;
      const newZoom = Math.min(Math.max(0.5, zoomLevel + direction * step), 2);

      const canvasRect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Tính toán offset mới dựa trên zoom
      const offsetX = canvasOffset.x - (mouseX / prevZoom - mouseX / newZoom);
      const offsetY = canvasOffset.y - (mouseY / prevZoom - mouseY / newZoom);

      setCanvasOffset({ x: offsetX, y: offsetY });
      setZoomLevel(newZoom);
    };

    // Handle canvas dragging for panning
    const handleMouseDown = (e) => {
      // Ctrl + chuột trái để pan
      if (toolMode === "pan" || (isCtrlPressed && toolMode === "select")) {
        setIsDraggingCanvas(true);
        setDragStart({
          x: e.clientX - canvasOffset.x,
          y: e.clientY - canvasOffset.y,
        });
        return;
      }

      // Shift + chuột trái để chọn vùng
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
        const canvasWidth = 1200; // Giả định
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
        // Tính toán tọa độ thực tế trên canvas (đã tính zoom)
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const maxX = Math.max(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const maxY = Math.max(selectionBox.startY, selectionBox.endY);

        // Chuyển đổi tọa độ màn hình sang tọa độ canvas
        const canvasMinX = (minX - canvasOffset.x) / zoomLevel;
        const canvasMaxX = (maxX - canvasOffset.x) / zoomLevel;
        const canvasMinY = (minY - canvasOffset.y) / zoomLevel;
        const canvasMaxY = (maxY - canvasOffset.y) / zoomLevel;

        // Tìm các section nằm trong vùng chọn
        const newSelectedSections = venueMap.sections
          .filter((section) => {
            const { x, y } = section.position;

            // Tính toán kích thước section
            let width, height;
            if (section.type === "theater") {
              const curveEffect = Math.abs(section.theaterCurve) * 0.8;
              width = section.seatsPerRow * 30 + curveEffect * 2;
              height = section.rows * 30 + Math.abs(section.theaterCurve);
            } else {
              width = 200;
              height = 200;
            }

            // Kiểm tra xem section có nằm trong vùng chọn không
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

    const moveSections = (dx, dy) => {
      setVenueMap((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => {
          if (selectedSections.includes(section.id)) {
            return {
              ...section,
              position: {
                x: section.position.x + dx,
                y: section.position.y + dy,
              },
            };
          }
          return section;
        }),
      }));
    };

    const moveStage = (id, left, top) => {
      setVenueMap((prev) => ({
        ...prev,
        stage: { ...prev.stage, position: { x: left, y: top } },
      }));
    };

    const resizeStage = (id, edge, dx, dy) => {
      setVenueMap((prev) => {
        const stage = prev.stage;
        let newWidth = stage.width;
        let newHeight = stage.height;
        let newX = stage.position.x;
        let newY = stage.position.y;

        if (edge === "right") {
          newWidth = Math.max(50, stage.width + dx); // Tối thiểu 50px
        } else if (edge === "left") {
          newWidth = Math.max(50, stage.width - dx);
          newX = stage.position.x + dx; // Điều chỉnh vị trí để giữ cạnh phải cố định
        } else if (edge === "bottom") {
          newHeight = Math.max(20, stage.height + dy); // Tối thiểu 20px
        } else if (edge === "top") {
          newHeight = Math.max(20, stage.height - dy);
          newY = stage.position.y + dy; // Điều chỉnh vị trí để giữ cạnh dưới cố định
        }

        return {
          ...prev,
          stage: {
            ...stage,
            position: { x: newX, y: newY },
            width: newWidth,
            height: newHeight,
          },
        };
      });
    };

    return (
      <div
        ref={drop}
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
          overflow: "hidden",
          touchAction: "none",
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                     linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`,
          backgroundSize: `30px 30px`, // Kích thước lưới cố định
          backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`, // Di chuyển theo pan
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
          {/* Vùng chọn */}
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
              zoomLevel={zoomLevel} // Thêm prop này
            />
          ))}
        </div>

        {venueMap.sections.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="mb-4 text-2xl">No sections created yet</div>
              <p className="mb-2">
                Click "Add Section" to start designing your venue
              </p>
              <button
                onClick={() => setShowEditor(true)}
                className="mt-4 rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
              >
                Add Your First Section
              </button>
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
            : toolMode === "add"
              ? "Select a section type to add"
              : `Hold Ctrl to pan | Shift+Scroll to zoom${
                  isShiftPressed
                    ? " | Shift + drag to select multiple sections"
                    : ""
                }`}
        </div>
      </div>
    );
  };

  const Toolbar = () => {
    const handleSave = async () => {
      // Tạo JSON request cho API (chỉ cho theater)
      const requestJson = {
        eventId: 562,
        stagePositionX: venueMap.stage.position.x,
        stagePositionY: venueMap.stage.position.y,
        stageWidth: venueMap.stage.width,
        stageHeight: venueMap.stage.height,
        sections: venueMap.sections
          .filter((section) => section.type === "theater")
          .map((section) => ({
            name: section.name,
            totalRows: section.rows,
            seatsPerRow: section.seatsPerRow,
            positionX: section.position.x,
            positionY: section.position.y,
            rotation: section.rotation,
            theaterCurve: section.theaterCurve,
            seats: [],
          })),
      };

      // Tạo seats cho các section theater
      venueMap.sections
        .filter((section) => section.type === "theater")
        .forEach((section, index) => {
          for (let row = 0; row < section.rows; row++) {
            for (let seat = 0; seat < section.seatsPerRow; seat++) {
              requestJson.sections[index].seats.push({
                rowLabel: section.rowLabels[row],
                seatLabel: section.seatLabels[seat],
              });
            }
          }
        });

      // Console.log JSON
      console.log("JSON gửi đến BE:", JSON.stringify(requestJson, null, 2));

      try {
        const response = await createSeatMap(
          requestJson,
          localStorage.getItem("token"),
        );
        // Cập nhật venueMap với dữ liệu từ BE
        // setVenueMap({
        //   ...venueMap,
        //   sections: response.sections.map((section) => ({
        //     ...section,
        //     id: section.sectionId.toString(),
        //     type: "theater",
        //     rowLabels: Array.from({ length: section.totalRows }, (_, i) =>
        //       String.fromCharCode(65 + i),
        //     ),
        //     seatLabels: Array.from({ length: section.seatsPerRow }, (_, i) =>
        //       (i + 1).toString(),
        //     ),
        //   })),
        // });
        if (response.message === "Resource found!") {
          Swal.fire({
            icon: "success",
            title: "Tạo map thành công!",
            text: "Venue map đã được tạo thành công.",
          });
        }
      } catch (error) {
        console.error("Lỗi khi tạo VenueMap:", error);
      }
    };

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
          onClick={() => {
            setToolMode("add");
            setShowEditor(true);
          }}
          className={`flex items-center rounded-lg px-3 py-2 ${toolMode === "add" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}
        >
          <FaPlusCircle className="mr-2" />
          Add Section
        </button>
        <button
          onClick={focusStage}
          className="flex items-center rounded-lg bg-white px-3 py-2 text-gray-700 hover:bg-gray-100"
        >
          <FaCrosshairs className="mr-2" />
          Focus Stage
        </button>

        <button
          onClick={handleSave}
          className="flex items-center rounded-lg bg-green-500 px-3 py-2 text-white hover:bg-green-600"
        >
          <FaPlusCircle className="mr-2" />
          Save Venue
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-6">
      {!venueMap ? (
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="p-8 md:p-12">
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-gray-800">
                  Create Your Venue Map
                </h1>
                <p className="mx-auto max-w-2xl text-gray-600">
                  Design your event venue with interactive seat maps. Drag and
                  drop sections, customize seating arrangements, and visualize
                  your event space.
                </p>
              </div>

              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-1">
                  <div className="h-full rounded-xl bg-gray-50 p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                      Theater Style
                    </h2>
                    <div className="flex aspect-video items-center justify-center rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="grid grid-cols-6 gap-2">
                        {[...Array(24)].map((_, i) => (
                          <div
                            key={i}
                            className="h-6 w-6 rounded-full border border-blue-400 bg-blue-300"
                          ></div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600">
                      Perfect for conferences and presentations with rows of
                      seats facing a stage.
                    </p>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="h-full rounded-xl bg-gray-50 p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                      Circular Tables
                    </h2>
                    <div className="flex aspect-video items-center justify-center rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                      <div className="relative">
                        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-green-300">
                          <span className="font-bold text-green-700">
                            Table
                          </span>
                        </div>
                        {[...Array(6)].map((_, i) => {
                          const angle = i * 60;
                          return (
                            <div
                              key={i}
                              className="absolute h-6 w-6 rounded-full border border-green-400 bg-green-300"
                              style={{
                                left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
                                top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                                transform: "translate(-50%, -50%)",
                              }}
                            ></div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="mt-4 text-gray-600">
                      Ideal for banquets, dinners, and networking events with
                      circular table arrangements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowEditor(true)}
                  className="transform rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-indigo-700"
                >
                  Create Venue Map
                </button>
                <p className="mt-4 text-sm text-gray-500">
                  Only one person should edit the seat map at a time otherwise
                  you'll lose your changes.
                </p>
              </div>
            </div>
          </div>

          {/* Section Editor Modal */}
          {showEditor && (
            <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
              <div className="w-full max-w-md rounded-xl bg-white">
                <div className="p-6">
                  <h3 className="mb-4 text-xl font-bold">Create New Venue</h3>

                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium">
                      Section Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSectionType("theater")}
                        className={`rounded-xl border-2 p-4 text-center transition-all ${
                          sectionType === "theater"
                            ? "border-blue-500 bg-blue-50 shadow-inner"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="mx-auto mb-2 grid h-16 w-16 grid-cols-4 gap-1">
                          {[...Array(16)].map((_, i) => (
                            <div
                              key={i}
                              className="h-3 w-3 rounded-full bg-blue-300"
                            ></div>
                          ))}
                        </div>
                        <div className="font-medium">Theater</div>
                        <div className="mt-1 text-xs text-gray-500">
                          Rows of seats
                        </div>
                      </button>

                      <button
                        onClick={() => setSectionType("circular")}
                        className={`rounded-xl border-2 p-4 text-center transition-all ${
                          sectionType === "circular"
                            ? "border-blue-500 bg-blue-50 shadow-inner"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center">
                          <div className="h-12 w-12 rounded-full border-4 border-blue-300"></div>
                        </div>
                        <div className="font-medium">Circular</div>
                        <div className="mt-1 text-xs text-gray-500">
                          Table seating
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">
                      Section Name
                    </label>
                    <input
                      type="text"
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      placeholder={`Section ${sectionCounter}`}
                      className="w-full rounded-lg border border-gray-300 p-3"
                    />
                  </div>

                  {sectionType === "theater" && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Number of Rows
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="1"
                            max="20"
                            value={rows}
                            onChange={(e) => setRows(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <div className="w-10 text-center font-medium">
                            {rows}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Seats per Row
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="1"
                            max="30"
                            value={seatsPerRow}
                            onChange={(e) =>
                              setSeatsPerRow(parseInt(e.target.value))
                            }
                            className="flex-1"
                          />
                          <div className="w-10 text-center font-medium">
                            {seatsPerRow}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowEditor(false)}
                      className="rounded-lg border border-gray-300 px-5 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateVenue}
                      className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-white transition-all hover:from-blue-600 hover:to-indigo-700"
                    >
                      Create Venue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
              <div className="border-b border-gray-200 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      Venue Map Editor
                    </h1>
                    <p className="mt-1 text-gray-600">
                      Only one person should edit the seat map at a time
                      otherwise you'll lose your changes.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-lg bg-blue-50 px-4 py-2">
                      <div className="flex items-center">
                        <span className="mr-2 font-medium text-gray-700">
                          Capacity:
                        </span>
                        <span className="font-bold text-blue-700">
                          {capacity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setVenueMap(null);
                        setSelectedSection(null);
                        setSectionCounter(1);
                        setSelectedStage(null);
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50"
                    >
                      New Venue
                    </button>
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

            {/* Add Section Modal */}
            {showEditor && (
              <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                <div className="w-full max-w-md rounded-xl bg-white">
                  <div className="p-6">
                    <h3 className="mb-4 text-xl font-bold">Add New Section</h3>

                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-medium">
                        Section Type
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setSectionType("theater")}
                          className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${
                            sectionType === "theater"
                              ? "border-blue-500 bg-blue-50 shadow-inner"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <FaChair className="mb-2 text-2xl text-blue-500" />
                            <div className="font-medium">Theater</div>
                          </div>
                        </button>

                        <button
                          onClick={() => setSectionType("circular")}
                          className={`flex-1 rounded-xl border-2 p-4 text-center transition-all ${
                            sectionType === "circular"
                              ? "border-blue-500 bg-blue-50 shadow-inner"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <FaTable className="mb-2 text-2xl text-blue-500" />
                            <div className="font-medium">Circular</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium">
                        Section Name
                      </label>
                      <input
                        type="text"
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                        placeholder={`Section ${sectionCounter}`}
                        className="w-full rounded-lg border border-gray-300 p-3"
                      />
                    </div>

                    {sectionType === "theater" && (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Number of Rows
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={rows}
                            onChange={(e) => setRows(parseInt(e.target.value))}
                            className="w-full rounded-lg border border-gray-300 p-3"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Seats per Row
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={seatsPerRow}
                            onChange={(e) =>
                              setSeatsPerRow(parseInt(e.target.value))
                            }
                            className="w-full rounded-lg border border-gray-300 p-3"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowEditor(false)}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addSection}
                        className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-white transition-all hover:from-blue-600 hover:to-indigo-700"
                      >
                        Add Section
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DndProvider>
      )}
    </div>
  );
};

export default SeatMap6;
