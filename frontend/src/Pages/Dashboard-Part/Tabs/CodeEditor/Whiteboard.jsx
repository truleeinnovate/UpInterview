import { useRef, useState, useEffect } from 'react';

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = lineWidth * 3;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const colors = [
    { hex: '#ffffff', name: 'White' },
    { hex: '#000000', name: 'Black' },
    { hex: '#ef4444', name: 'Red' },
    { hex: '#f97316', name: 'Orange' },
    { hex: '#eab308', name: 'Yellow' },
    { hex: '#22c55e', name: 'Green' },
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#8b5cf6', name: 'Purple' },
    { hex: '#ec4899', name: 'Pink' },
    { hex: '#06b6d4', name: 'Cyan' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0e27] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between px-8 py-5 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-slate-800/60 px-5 py-3 rounded-xl border border-slate-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Drawing Tools</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('pen')}
                  className={`group relative p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    tool === 'pen'
                      ? 'bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/50 scale-105'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/80'
                  }`}
                  title="Pen"
                >
                  {tool === 'pen' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-400 opacity-50 blur-xl"></div>
                  )}
                  <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span className="relative z-10 text-sm font-bold">Pen</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`group relative p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                    tool === 'eraser'
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/80'
                  }`}
                  title="Eraser"
                >
                  {tool === 'eraser' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 opacity-50 blur-xl"></div>
                  )}
                  <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="relative z-10 text-sm font-bold">Eraser</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 px-5 py-3 rounded-xl border border-slate-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Color Palette</label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setColor(c.hex);
                      setTool('pen');
                    }}
                    className={`group relative w-10 h-10 rounded-xl border-2 transition-all duration-300 transform ${
                      color === c.hex && tool === 'pen'
                        ? 'border-fuchsia-400 scale-110 shadow-xl'
                        : 'border-slate-600/30 hover:scale-105 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {color === c.hex && tool === 'pen' && (
                      <div className="absolute inset-0 rounded-xl blur-lg opacity-60" style={{ backgroundColor: c.hex }}></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/60 px-5 py-3 rounded-xl border border-slate-700/50 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Brush Size: <span className="text-slate-300 font-bold">{lineWidth}px</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
                <div
                  className="rounded-full shadow-lg border-2 border-slate-600"
                  style={{
                    width: `${Math.max(lineWidth + 8, 16)}px`,
                    height: `${Math.max(lineWidth + 8, 16)}px`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <svg className="w-4 h-4 text-fuchsia-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-xs text-slate-400 font-semibold">Active: {tool === 'pen' ? 'Pen' : 'Eraser'}</span>
          </div>
          <button
            onClick={clearCanvas}
            className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 shadow-2xl flex items-center gap-2"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
            <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="relative z-10">Clear</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={1800}
            height={1000}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="bg-slate-900/50 backdrop-blur-xl border-2 border-slate-700/50 rounded-3xl shadow-2xl cursor-crosshair"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
          <div className="absolute bottom-8 right-8 bg-slate-900/90 backdrop-blur-xl px-6 py-3 rounded-2xl text-slate-300 text-sm shadow-2xl border border-slate-700/50 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-lg">
              <svg className="w-5 h-5 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold">Click and drag to draw</span>
          </div>
        </div>
      </div>
    </div>
  );
}
