// src/App.js
import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { FaRotateLeft, FaRotateRight } from "react-icons/fa6";

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

  const handleCreateVenue = () => {
    setVenueMap({ sections: [] });
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

  const updateSectionName = (id, name) => {
    setVenueMap((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id ? { ...section, name } : section,
      ),
    }));
  };

  const Section = ({ section }) => {
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
    const width = type === "theater" ? seatsPerRow * 30 + curveEffect * 2 : 200;
    const height =
      type === "theater" ? rows * 30 + Math.abs(theaterCurve) : 200;

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
          transform: `rotate(${rotation}deg)`,
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
        <div className="absolute -top-8 right-0 left-0 text-center">
          <span className="rounded bg-blue-100 px-2 py-1 text-sm font-semibold text-blue-800">
            {name}
          </span>
        </div>

        <div className="flex h-full w-full flex-col items-center justify-center">
          {type === "theater" ? (
            <div className="relative h-full w-full">
              {Array.from({ length: rows }).map((_, rowIndex) => {
                const center = (seatsPerRow - 1) / 2; // Định nghĩa center ở đây

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
                      top: `${rowIndex * 30}px`,
                    }}
                  >
                    {/* Hiển thị nhãn hàng với độ cong */}
                    <div
                      className="bg-main absolute flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        left: `-30px`,
                        top: `${curveFactorForLabel}px`,
                        transform: "translateY(-50%)",
                      }}
                    >
                      {rowLabels[rowIndex]}
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
                            left: `${seatIndex * 30}px`,
                            top: `${curveFactor}px`,
                          }}
                        >
                          <span className="text-[6px]">
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
                    <span className="text-[6px]">
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
                      adjustTheaterCurve(id, -5);
                    }}
                    className="rounded-full bg-white p-2 shadow hover:bg-gray-100"
                    title="Decrease curve"
                  >
                    <FaMinus className="text-blue-600" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      adjustTheaterCurve(id, 5);
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
      accept: "SECTION",
      drop(item, monitor) {
        if (toolMode !== "select") return;

        const delta = monitor.getDifferenceFromInitialOffset();
        const dx = Math.round(delta.x / zoomLevel);
        const dy = Math.round(delta.y / zoomLevel);

        // Di chuyển nhiều section nếu có section được chọn
        if (selectedSections.length > 0 && selectedSections.includes(item.id)) {
          moveSections(dx, dy);
        }
        // Di chuyển section đơn lẻ
        else {
          moveSection(item.id, item.left + dx, item.top + dy);
        }
        return undefined;
      },
    });

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Control") {
          setIsCtrlPressed(true);
        }
        if (e.key === "Shift") {
          setIsShiftPressed(true);
        }
      };

      const handleKeyUp = (e) => {
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
    }, []);

    const handleWheel = (e) => {
      if (!e.shiftKey) return; // Chỉ zoom khi giữ Shift

      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.min(Math.max(0.5, zoomLevel + delta), 2);
      setZoomLevel(newZoom);
    };

    // Handle canvas dragging for panning
    const handleMouseDown = (e) => {
      // Ctrl + chuột trái để pan
      if (isCtrlPressed) {
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
      // Di chuyển canvas khi Ctrl được nhấn
      if (isCtrlPressed && isDraggingCanvas) {
        setCanvasOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
      // Cập nhật vùng chọn
      else if (selectionBox && isShiftPressed) {
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

      // Xử lý khi kết thúc chọn vùng
      if (selectionBox && isShiftPressed) {
        // Tính toán ranh giới vùng chọn
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const maxX = Math.max(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const maxY = Math.max(selectionBox.startY, selectionBox.endY);

        // Tìm các section nằm trong vùng chọn
        const newSelectedSections = venueMap.sections
          .filter((section) => {
            // Tính toán vị trí thực tế trên canvas (đã zoom và pan)
            const scaledX = section.position.x * zoomLevel + canvasOffset.x;
            const scaledY = section.position.y * zoomLevel + canvasOffset.y;

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

            const scaledWidth = width * zoomLevel;
            const scaledHeight = height * zoomLevel;

            // Kiểm tra xem section có nằm trong vùng chọn không
            const sectionRight = scaledX + scaledWidth;
            const sectionBottom = scaledY + scaledHeight;

            return (
              scaledX >= minX &&
              scaledY >= minY &&
              sectionRight <= maxX &&
              sectionBottom <= maxY
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

    return (
      <div
        ref={drop}
        className="relative h-[600px] w-full overflow-hidden rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100"
        onClick={() => setSelectedSection(null)}
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
                left: Math.min(selectionBox.startX, selectionBox.endX),
                top: Math.min(selectionBox.startY, selectionBox.endY),
                width: Math.abs(selectionBox.endX - selectionBox.startX),
                height: Math.abs(selectionBox.endY - selectionBox.startY),
              }}
            />
          )}
          {venueMap?.sections?.map((section) => (
            <Section key={section.id} section={section} />
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
