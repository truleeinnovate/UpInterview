// import { useRef, useState, useEffect } from "react";

// export default function Whiteboard() {
//   const canvasRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [color, setColor] = useState("#ffffff");
//   const [lineWidth, setLineWidth] = useState(2);
//   const [tool, setTool] = useState("pen");

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       ctx.fillStyle = "#1f2937";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//     }
//   }, []);

//   const startDrawing = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const ctx = canvas.getContext("2d");
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//     setIsDrawing(true);
//   };

//   const draw = (e) => {
//     if (!isDrawing) return;

//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const ctx = canvas.getContext("2d");
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";

//     if (tool === "pen") {
//       ctx.strokeStyle = color;
//       ctx.lineWidth = lineWidth;
//       ctx.lineTo(x, y);
//       ctx.stroke();
//     } else if (tool === "eraser") {
//       ctx.strokeStyle = "#1f2937";
//       ctx.lineWidth = lineWidth * 3;
//       ctx.lineTo(x, y);
//       ctx.stroke();
//     }
//   };

//   const stopDrawing = () => {
//     setIsDrawing(false);
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.fillStyle = "#1f2937";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   };

//   const colors = [
//     { hex: "#ffffff", name: "White" },
//     { hex: "#000000", name: "Black" },
//     { hex: "#ef4444", name: "Red" },
//     { hex: "#f97316", name: "Orange" },
//     { hex: "#eab308", name: "Yellow" },
//     { hex: "#22c55e", name: "Green" },
//     { hex: "#3b82f6", name: "Blue" },
//     { hex: "#8b5cf6", name: "Purple" },
//     { hex: "#ec4899", name: "Pink" },
//     { hex: "#06b6d4", name: "Cyan" },
//   ];

//   return (
//     <div className="h-full flex flex-col bg-[#0a0e27] relative overflow-hidden">
//       <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none"></div>
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none"></div>

//       <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
//         <div className="flex items-center gap-6">
//           <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
//                 Drawing Tools
//               </label>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setTool("pen")}
//                   className={`h-6 text-xs group relative px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
//                     tool === "pen"
//                       ? "bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/50"
//                       : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/80"
//                   }`}
//                   title="Pen"
//                 >
//                   {tool === "pen" && (
//                     <div className="absolute inset-0 rounded-md bg-gradient-to-br from-fuchsia-400 to-pink-400 opacity-50 blur-xl"></div>
//                   )}
//                   <svg
//                     className="relative z-10 w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
//                     />
//                   </svg>
//                   <span className="relative z-10 text-xs font-bold">Pen</span>
//                 </button>
//                 <button
//                   onClick={() => setTool("eraser")}
//                   className={`h-6 text-xs group relative px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
//                     tool === "eraser"
//                       ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105"
//                       : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/80"
//                   }`}
//                   title="Eraser"
//                 >
//                   {tool === "eraser" && (
//                     <div className="absolute inset-0 rounded-md bg-gradient-to-br from-orange-400 to-red-400 opacity-50 blur-xl"></div>
//                   )}
//                   <svg
//                     className="relative z-10 w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                   <span className="relative z-10 text-xs font-bold">
//                     Eraser
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
//                 Color Palette
//               </label>
//               <div className="flex gap-2">
//                 {colors.map((c) => (
//                   <button
//                     key={c.hex}
//                     onClick={() => {
//                       setColor(c.hex);
//                       setTool("pen");
//                     }}
//                     className={`group relative w-6 h-6 rounded-md border-2 transition-all duration-300 transform ${
//                       color === c.hex && tool === "pen"
//                         ? "border-fuchsia-400 scale-110 shadow-xl"
//                         : "border-slate-600/30 hover:scale-105 hover:border-slate-500"
//                     }`}
//                     style={{ backgroundColor: c.hex }}
//                     title={c.name}
//                   >
//                     {color === c.hex && tool === "pen" && (
//                       <div
//                         className="absolute inset-0 rounded-md blur-lg opacity-60"
//                         style={{ backgroundColor: c.hex }}
//                       ></div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
//                 Brush Size:
//                 <span className="text-slate-300 font-bold ml-1">
//                   {lineWidth}px
//                 </span>
//               </label>
//               <div className="flex items-center gap-4">
//                 <input
//                   type="range"
//                   min="1"
//                   max="20"
//                   value={lineWidth}
//                   onChange={(e) => setLineWidth(Number(e.target.value))}
//                   className="w-32 h-2 bg-slate-700 rounded-md appearance-none cursor-pointer accent-fuchsia-500"
//                 />
//                 {/* <div
//                   className="rounded-full shadow-lg border-2 border-slate-600"
//                   style={{
//                     width: `${Math.max(lineWidth + 4, 10)}px`,
//                     height: `${Math.max(lineWidth + 4, 10)}px`,
//                     backgroundColor: color,
//                   }}
//                 /> */}
//                 <div className="w-6 h-6 flex items-center justify-center">
//                   <div
//                     className="rounded-full shadow border border-slate-600"
//                     style={{
//                       width: `${Math.min(Math.max(lineWidth + 4, 8), 20)}px`,
//                       height: `${Math.min(Math.max(lineWidth + 4, 8), 20)}px`,
//                       backgroundColor: color,
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50 backdrop-blur-sm">
//             <svg
//               className="w-4 h-4 text-fuchsia-400"
//               fill="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//             </svg>
//             <span className="text-xs text-slate-400 font-semibold">
//               Active: {tool === "pen" ? "Pen" : "Eraser"}
//             </span>
//           </div>
//           <button
//             onClick={clearCanvas}
//             className="group relative px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-md font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-2xl flex items-center gap-2"
//           >
//             <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
//             <svg
//               className="relative z-10 w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//               />
//             </svg>
//             <span className="relative z-10 text-sm">Clear</span>
//           </button>
//         </div>
//       </div>

//       {/* <div className="relative z-10 flex-1 flex items-center justify-center p-8">
//         <div className="relative w-full h-full flex items-center justify-center">
//           <canvas
//             ref={canvasRef}
//             width={1800}
//             height={1000}
//             onMouseDown={startDrawing}
//             onMouseMove={draw}
//             onMouseUp={stopDrawing}
//             onMouseLeave={stopDrawing}
//             className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-md shadow-2xl cursor-crosshair"
//             style={{ maxWidth: "100%", maxHeight: "100%" }}
//           />
//           <div className="absolute bottom-8 right-8 bg-slate-900/90 backdrop-blur-xl px-6 py-3 rounded-2xl text-slate-300 text-sm shadow-2xl border border-slate-700/50 flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-lg">
//               <svg
//                 className="w-5 h-5 text-fuchsia-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M13 10V3L4 14h7v7l9-11h-7z"
//                 />
//               </svg>
//             </div>
//             <span className="font-semibold">Click and drag to draw</span>
//           </div>
//         </div>
//       </div> */}
//       <div className="relative z-10 flex-1 flex items-center justify-center p-8 overflow-hidden">
//         <div className="relative w-full h-full flex items-center justify-center">
//           <canvas
//             ref={canvasRef}
//             width={1800}
//             height={1000}
//             onMouseDown={startDrawing}
//             onMouseMove={draw}
//             onMouseUp={stopDrawing}
//             onMouseLeave={stopDrawing}
//             className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-md shadow-2xl cursor-crosshair object-contain"
//             style={{
//               maxWidth: "100%",
//               maxHeight: "100%",
//               width: "auto",
//               height: "auto",
//             }}
//           />

//           {/* Overlay instruction tag */}
//           <div className="absolute bottom-8 right-8 bg-slate-900/90 backdrop-blur-xl px-6 py-3 rounded-md text-slate-300 text-sm shadow-2xl border border-slate-700/50 flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-md">
//               <svg
//                 className="w-5 h-5 text-fuchsia-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M13 10V3L4 14h7v7l9-11h-7z"
//                 />
//               </svg>
//             </div>
//             <span className="font-semibold">Click and drag to draw</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// Best latest one
// import { useRef, useState, useEffect } from "react";

// export default function Whiteboard() {
//   const canvasRef = useRef(null);
//   const containerRef = useRef(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [color, setColor] = useState("#ffffff");
//   const [lineWidth, setLineWidth] = useState(2);
//   const [tool, setTool] = useState("pen");
//   const [scale, setScale] = useState(1);

//   // --- NEW STATES FOR PANNING ---
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [isPanning, setIsPanning] = useState(false);
//   const [isSpacePressed, setIsSpacePressed] = useState(false);

//   // Initialize Canvas background
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const ctx = canvas.getContext("2d");
//       ctx.fillStyle = "#1f2937";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//     }
//   }, []);

//   // Handle Zoom and Spacebar Panning Listeners
//   useEffect(() => {
//     const container = containerRef.current;

//     const handleNativeWheel = (e) => {
//       if (e.ctrlKey || e.metaKey) {
//         e.preventDefault();
//         const delta = e.deltaY > 0 ? -0.1 : 0.1;
//         setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 5));
//       }
//     };

//     const handleKeyDown = (e) => {
//       if (e.code === "Space" && !isSpacePressed) {
//         setIsSpacePressed(true);
//       }
//     };

//     const handleKeyUp = (e) => {
//       if (e.code === "Space") {
//         setIsSpacePressed(false);
//         setIsPanning(false);
//       }
//     };

//     // Add listeners to window to ensure spacebar is caught even if not focused on canvas
//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     if (container) {
//       container.addEventListener("wheel", handleNativeWheel, {
//         passive: false,
//       });
//     }

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//       if (container) container.removeEventListener("wheel", handleNativeWheel);
//     };
//   }, [isSpacePressed]);

//   // Adjust coordinates based on CSS scale transform AND Pan offset
//   const getCoordinates = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();

//     // Logic: (Mouse Position - Element Left) * (Internal resolution / Actual element width)
//     return {
//       x: (e.clientX - rect.left) * (canvas.width / rect.width),
//       y: (e.clientY - rect.top) * (canvas.height / rect.height),
//     };
//   };

//   const startInteraction = (e) => {
//     if (isSpacePressed) {
//       setIsPanning(true);
//       return;
//     }
//     const { x, y } = getCoordinates(e);
//     const ctx = canvasRef.current.getContext("2d");
//     ctx.beginPath();
//     ctx.moveTo(x, y);
//     setIsDrawing(true);
//   };

//   const performInteraction = (e) => {
//     if (isPanning) {
//       setOffset((prev) => ({
//         x: prev.x + e.movementX,
//         y: prev.y + e.movementY,
//       }));
//       return;
//     }

//     if (!isDrawing) return;
//     const { x, y } = getCoordinates(e);
//     const ctx = canvasRef.current.getContext("2d");
//     ctx.lineCap = "round";
//     ctx.lineJoin = "round";

//     if (tool === "pen") {
//       ctx.strokeStyle = color;
//       ctx.lineWidth = lineWidth;
//       ctx.lineTo(x, y);
//       ctx.stroke();
//     } else if (tool === "eraser") {
//       ctx.strokeStyle = "#1f2937";
//       ctx.lineWidth = lineWidth * 3;
//       ctx.lineTo(x, y);
//       ctx.stroke();
//     }
//   };

//   const stopInteraction = () => {
//     setIsDrawing(false);
//     setIsPanning(false);
//   };

//   const clearCanvas = () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     ctx.fillStyle = "#1f2937";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//   };

//   const handleZoom = (delta) => {
//     setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 5));
//   };

//   const colors = [
//     { hex: "#ffffff", name: "White" },
//     { hex: "#000000", name: "Black" },
//     { hex: "#ef4444", name: "Red" },
//     { hex: "#f97316", name: "Orange" },
//     { hex: "#eab308", name: "Yellow" },
//     { hex: "#22c55e", name: "Green" },
//     { hex: "#3b82f6", name: "Blue" },
//     { hex: "#8b5cf6", name: "Purple" },
//     { hex: "#ec4899", name: "Pink" },
//     { hex: "#06b6d4", name: "Cyan" },
//   ];

//   return (
//     <div className="h-full flex flex-col bg-[#0a0e27] relative overflow-hidden select-none">
//       <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none"></div>
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none"></div>

//       {/* Header UI */}
//       <div className="relative z-20 flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
//         <div className="flex items-center gap-6">
//           <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
//                 Drawing Tools
//               </label>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setTool("pen")}
//                   className={`h-6 text-xs group relative px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
//                     tool === "pen"
//                       ? "bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg"
//                       : "bg-slate-700/50 text-slate-300"
//                   }`}
//                 >
//                   <svg
//                     className="relative z-10 w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
//                     />
//                   </svg>
//                   <span className="relative z-10 text-xs font-bold">Pen</span>
//                 </button>
//                 <button
//                   onClick={() => setTool("eraser")}
//                   className={`h-6 text-xs group relative px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
//                     tool === "eraser"
//                       ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg"
//                       : "bg-slate-700/50 text-slate-300"
//                   }`}
//                 >
//                   <svg
//                     className="relative z-10 w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                   <span className="relative z-10 text-xs font-bold">
//                     Eraser
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
//                 Color Palette
//               </label>
//               <div className="flex gap-2">
//                 {colors.map((c) => (
//                   <button
//                     key={c.hex}
//                     onClick={() => {
//                       setColor(c.hex);
//                       setTool("pen");
//                     }}
//                     className={`group relative w-6 h-6 rounded-md border-2 transition-all ${
//                       color === c.hex && tool === "pen"
//                         ? "border-fuchsia-400 scale-110 shadow-xl"
//                         : "border-slate-600/30"
//                     }`}
//                     style={{ backgroundColor: c.hex }}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
//             <div className="flex flex-col gap-1">
//               <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
//                 Brush Size:{" "}
//                 <span className="text-slate-300 font-bold ml-1">
//                   {lineWidth}px
//                 </span>
//               </label>
//               <div className="flex items-center gap-4">
//                 <input
//                   type="range"
//                   min="1"
//                   max="20"
//                   value={lineWidth}
//                   onChange={(e) => setLineWidth(Number(e.target.value))}
//                   className="w-32 h-2 bg-slate-700 rounded-md appearance-none cursor-pointer accent-fuchsia-500"
//                 />
//                 <div className="w-6 h-6 flex items-center justify-center">
//                   <div
//                     className="rounded-full shadow border border-slate-600"
//                     style={{
//                       width: `${Math.min(Math.max(lineWidth + 4, 8), 20)}px`,
//                       height: `${Math.min(Math.max(lineWidth + 4, 8), 20)}px`,
//                       backgroundColor: color,
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <button
//           onClick={clearCanvas}
//           className="group relative px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md font-bold transition-all hover:scale-105 flex items-center gap-2"
//         >
//           <svg
//             className="relative z-10 w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//             />
//           </svg>
//           <span className="relative z-10 text-sm">Clear</span>
//         </button>
//       </div>

//       {/* Main Drawing Area */}
//       <div
//         ref={containerRef}
//         className={`relative z-10 flex-1 flex items-center justify-center p-8 overflow-hidden touch-none ${
//           isPanning
//             ? "cursor-grabbing"
//             : isSpacePressed
//             ? "cursor-grab"
//             : "cursor-crosshair"
//         }`}
//       >
//         <div
//           className="relative transition-transform duration-75 ease-out"
//           style={{
//             transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
//           }}
//         >
//           <canvas
//             ref={canvasRef}
//             width={1800}
//             height={1000}
//             onMouseDown={startInteraction}
//             onMouseMove={performInteraction}
//             onMouseUp={stopInteraction}
//             onMouseLeave={stopInteraction}
//             className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-md shadow-2xl"
//           />
//         </div>

//         {/* Bottom Zoom Controls */}
//         <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-lg border border-slate-700/50 shadow-2xl z-30">
//           <button
//             onClick={() => handleZoom(-0.1)}
//             className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-lg"
//           >
//             −
//           </button>
//           <span className="text-slate-300 font-mono text-xs w-12 text-center">
//             {Math.round(scale * 100)}%
//           </span>
//           <button
//             onClick={() => handleZoom(0.1)}
//             className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-lg"
//           >
//             +
//           </button>
//           <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>
//           <button
//             onClick={() => {
//               setScale(1);
//               setOffset({ x: 0, y: 0 });
//             }}
//             className="text-[10px] text-slate-500 uppercase font-bold hover:text-fuchsia-400 px-2"
//           >
//             Reset View
//           </button>
//         </div>
//         {/* User Hint overlay */}
//         <div className="absolute bottom-8 right-8 bg-slate-900/90 backdrop-blur-xl px-4 py-1.5 rounded-md text-slate-300 text-sm shadow-2xl border border-slate-700/50 flex flex-col gap-1 pointer-events-none">
//           <div className="flex items-center gap-3">
//             <div className="px-3 py-1 bg-fuchsia-500/20 rounded text-fuchsia-400 font-bold text-[9px]">
//               CTRL + SCROLL
//             </div>
//             <span className="font-semibold text-xs">Zoom</span>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="px-3 py-1 bg-fuchsia-500/20 rounded text-fuchsia-400 font-bold text-[9px]">
//               SPACE + DRAG
//             </div>
//             <span className="font-semibold text-xs">Pan Canvas</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useRef, useState, useEffect } from "react";

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState("pen");
  const [scale, setScale] = useState(1);

  // --- PANNING STATES ---
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // --- UNDO / REDO STATES ---
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Initialize Canvas background and save initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save initial state
      setHistory([canvas.toDataURL()]);
    }
  }, []);

  // Handle Zoom, Panning, and Keyboard Shortcuts
  useEffect(() => {
    const container = containerRef.current;

    const handleNativeWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 5));
      }
    };

    const handleKeyDown = (e) => {
      if (e.code === "Space" && !isSpacePressed) {
        setIsSpacePressed(true);
      }
      // Undo shortcut: Ctrl + Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo shortcut: Ctrl + Y or Cmd + Shift + Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        redo();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    if (container) {
      container.addEventListener("wheel", handleNativeWheel, {
        passive: false,
      });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (container) container.removeEventListener("wheel", handleNativeWheel);
    };
  }, [isSpacePressed, history, redoStack]);

  // --- UNDO / REDO LOGIC ---
  const applyState = (dataUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const undo = () => {
    if (history.length <= 1) return;
    const currentHistory = [...history];
    const currentState = currentHistory.pop();
    const prevState = currentHistory[currentHistory.length - 1];

    setRedoStack((prev) => [currentState, ...prev]);
    setHistory(currentHistory);
    applyState(prevState);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const currentRedo = [...redoStack];
    const nextState = currentRedo.shift();

    setHistory((prev) => [...prev, nextState]);
    setRedoStack(currentRedo);
    applyState(nextState);
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    setHistory((prev) => [...prev, canvas.toDataURL()]);
    setRedoStack([]); // Clear redo stack on new action
  };

  // Coordinates Logic
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startInteraction = (e) => {
    if (isSpacePressed) {
      setIsPanning(true);
      return;
    }
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const performInteraction = (e) => {
    if (isPanning) {
      setOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
      return;
    }
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "pen") {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = lineWidth * 3;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopInteraction = () => {
    if (isDrawing) saveState();
    setIsDrawing(false);
    setIsPanning(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const handleZoom = (delta) => {
    setScale((prev) => Math.min(Math.max(prev + delta, 0.2), 5));
  };

  const colors = [
    { hex: "#ffffff" },
    { hex: "#000000" },
    { hex: "#ef4444" },
    { hex: "#f97316" },
    { hex: "#eab308" },
    { hex: "#22c55e" },
    { hex: "#3b82f6" },
    { hex: "#8b5cf6" },
    { hex: "#ec4899" },
    { hex: "#06b6d4" },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0e27] relative overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none"></div>

      {/* Header UI */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Drawing Tools
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool("pen")}
                  className={`h-6 text-xs group relative px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
                    tool === "pen"
                      ? "bg-gradient-to-br from-custom-blue/80 to-custom-blue/90 text-white shadow-lg"
                      : "bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <svg
                    className="relative z-10 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  <span className="relative z-10 text-xs font-bold">Pen</span>
                </button>
                <button
                  onClick={() => setTool("eraser")}
                  className={`h-6 text-xs group relative px-3 py-1.5 rounded-md transition-all duration-300 flex items-center gap-2 ${
                    tool === "eraser"
                      ? "bg-gradient-to-br from-custom-blue/90 to-custom-blue text-white shadow-lg"
                      : "bg-slate-700/50 text-slate-300"
                  }`}
                >
                  <svg
                    className="relative z-10 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="relative z-10 text-xs font-bold">
                    Eraser
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Color Palette
              </label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setColor(c.hex);
                      setTool("pen");
                    }}
                    className={`group relative w-6 h-6 rounded-md border-2 transition-all ${
                      color === c.hex && tool === "pen"
                        ? "border-fuchsia-400 scale-110 shadow-xl"
                        : "border-slate-600/30"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 px-4 py-2 rounded-md border border-slate-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Brush Size:{" "}
                <span className="text-slate-300 font-bold ml-1">
                  {lineWidth}px
                </span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-32 h-2 bg-slate-700 rounded-md appearance-none cursor-pointer accent-fuchsia-500"
                />
                <div className="w-6 h-6 flex items-center justify-center">
                  <div
                    className="rounded-full shadow border border-slate-600"
                    style={{
                      width: `${Math.min(Math.max(lineWidth + 4, 8), 20)}px`,
                      height: `${Math.min(Math.max(lineWidth + 4, 8), 20)}px`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Undo/Redo Controls */}
          <div className="flex gap-2 ml-2">
            <button
              onClick={undo}
              disabled={history.length <= 1}
              className="p-2 bg-slate-800/60 border border-slate-700/50 rounded-md text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
              title="Undo (Ctrl+Z)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-2 bg-slate-800/60 border border-slate-700/50 rounded-md text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg"
              title="Redo (Ctrl+Y)"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={clearCanvas}
          className="group relative px-4 py-1 bg-gradient-to-r from-custom-blue/90 to-custom-blue text-white rounded-md font-bold transition-all hover:scale-105 flex items-center gap-2"
        >
          <svg
            className="relative z-10 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="relative z-10 text-sm">Clear</span>
        </button>
      </div>

      <div
        ref={containerRef}
        className={`relative z-10 flex-1 flex items-center justify-center p-8 overflow-hidden touch-none ${
          isPanning
            ? "cursor-grabbing"
            : isSpacePressed
            ? "cursor-grab"
            : "cursor-crosshair"
        }`}
      >
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={1800}
            height={1000}
            onMouseDown={startInteraction}
            onMouseMove={performInteraction}
            onMouseUp={stopInteraction}
            onMouseLeave={stopInteraction}
            className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-md shadow-2xl"
          />
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-lg border border-slate-700/50 shadow-2xl z-30">
          <button
            onClick={() => handleZoom(-0.1)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-lg"
          >
            −
          </button>
          <span className="text-slate-300 font-mono text-xs w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-lg"
          >
            +
          </button>
          <button
            onClick={() => {
              setScale(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="text-[10px] text-slate-500 font-bold hover:text-fuchsia-400 px-2 border-l border-slate-700 ml-2"
          >
            Reset View
          </button>
        </div>

        <div className="absolute bottom-8 right-8 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-md text-slate-300 text-xs shadow-2xl border border-slate-700/50 pointer-events-none flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-custom-blue/40 rounded text-white font-bold text-[9px]">
              CTRL + Z / Y
            </div>
            <span>Undo / Redo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 bg-custom-blue/40 rounded text-white font-bold text-[9px]">
              SPACE + DRAG
            </div>
            <span>Pan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
