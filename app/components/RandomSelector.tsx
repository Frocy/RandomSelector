"use client";

import { log } from "console";
import { useState, useRef, useEffect, useCallback } from "react";

// ── Styles ─────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --bg: #ffffff;
    --surface: #f5f5f5;
    --border: #cccccc;
    --accent: #007bff;
    --accent2: #dc3545;
    --text: #333333;
    --muted: #666666;
    --winner-glow: 0 0 30px #007bff80, 0 0 60px #007bff30;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .rs-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Mono', monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px 60px;
    position: relative;
    overflow: hidden;
  }

  /* scanlines overlay */
  .rs-root::before {
    content: '';
    position: fixed; inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(0,0,0,0.02) 3px,
      rgba(0,0,0,0.02) 4px
    );
    pointer-events: none;
    z-index: 100;
  }

  .rs-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(42px, 8vw, 80px);
    letter-spacing: 0.06em;
    color: var(--accent);
    text-shadow: 0 0 20px #007bff60, 4px 4px 0 #0056b3;
    margin-bottom: 8px;
    text-align: center;
  }

  .rs-subtitle {
    font-size: 11px;
    letter-spacing: 0.25em;
    color: var(--muted);
    text-transform: uppercase;
    margin-bottom: 40px;
  }

  .rs-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  /* ── Input panel ── */
  .rs-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 80%;
    margin: 0 auto;
  }

  .rs-label {
    font-size: 10px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .rs-input-row {
    display: flex;
    gap: 8px;
  }

  .rs-input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .rs-input:focus { border-color: var(--accent); }
  .rs-input::placeholder { color: var(--muted); }

  .rs-btn {
    background: var(--accent);
    color: #000;
    border: none;
    border-radius: 3px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 0.08em;
    padding: 0 18px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  .rs-btn:hover { background: #0056b3; }
  .rs-btn:active { transform: scale(0.96); }

  .rs-item-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 220px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .rs-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 8px 12px;
    font-size: 13px;
    animation: slideIn 0.2s ease;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .rs-item-num {
    color: var(--muted);
    font-size: 10px;
    margin-right: 10px;
    min-width: 18px;
  }

  .rs-item-name { flex: 1; }

  .rs-del {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 16px;
    padding: 0 4px;
    line-height: 1;
    transition: color 0.15s;
  }
  .rs-del:hover { color: var(--accent2); }

  .rs-empty {
    color: var(--muted);
    font-size: 12px;
    text-align: center;
    padding: 24px 0;
    border: 1px dashed var(--border);
    border-radius: 3px;
  }

  /* ── Drum panel ── */
  .rs-drum-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .rs-drum-wrapper {
    width: 100%;
    height: 400px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 3px;
    background: var(--bg);
  }

  /* highlight strip */
  .rs-drum-wrapper::before,
  .rs-drum-wrapper::after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: var(--accent);
    z-index: 2;
    opacity: 0.6;
  }
  .rs-drum-wrapper::before { top: calc(50% - 24px); }
  .rs-drum-wrapper::after  { top: calc(50% + 24px); }

  .rs-drum-center-bg {
    position: absolute;
    left: 0; right: 0;
    top: calc(50% - 24px);
    height: 48px;
    background: rgba(0,123,255,0.06);
    z-index: 1;
    pointer-events: none;
  }

  /* fade edges */
  .rs-drum-fade-top,
  .rs-drum-fade-bot {
    position: absolute;
    left: 0; right: 0;
    height: 70px;
    z-index: 3;
    pointer-events: none;
  }
  .rs-drum-fade-top { top: 0; background: linear-gradient(to bottom, var(--bg), transparent); }
  .rs-drum-fade-bot { bottom: 0; background: linear-gradient(to top, var(--bg), transparent); }

  .rs-drum-track {
    position: absolute;
    left: 0; right: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    will-change: transform;
  }

  .rs-drum-item {
    height: 48px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-family: 'DM Mono', monospace;
    color: var(--muted);
    transition: color 0.2s;
    flex-shrink: 0;
    padding: 0 12px;
    text-align: center;
  }

  .rs-drum-item.active {
    color: var(--text);
    font-weight: 500;
  }

  .rs-spin-btn {
    width: 100%;
    background: linear-gradient(135deg, var(--accent) 0%, #0056b3 100%);
    color: #fff;
    border: none;
    border-radius: 3px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 0.12em;
    padding: 14px 0;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 20px #007bff30;
  }
  .rs-spin-btn:hover:not(:disabled) {
    opacity: 0.9;
    box-shadow: var(--winner-glow);
  }
  .rs-spin-btn:active:not(:disabled) { transform: scale(0.98); }
  .rs-spin-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .rs-result {
    width: 100%;
    border: 1px solid var(--accent);
    border-radius: 3px;
    padding: 14px;
    text-align: center;
    background: rgba(0,123,255,0.05);
    box-shadow: var(--winner-glow);
    animation: popIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes popIn {
    from { transform: scale(0.85); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  .rs-result-label {
    font-size: 9px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 6px;
  }
  .rs-result-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 0.05em;
    color: var(--accent);
    text-shadow: 0 0 12px #007bff80;
  }

  .rs-count {
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.15em;
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────
const ITEM_H = 48; // px — must match .rs-drum-item height

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// ── Component ──────────────────────────────────────────────────────────────
export default function RandomSelector() {
  const [items, setItems] = useState(["Test"]);
  const [input, setInput] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [offset, setOffset] = useState(0);           
  const [activeIdx, setActiveIdx] = useState(0);     

  const rafRef = useRef(null);
  const trackRef = useRef(null);

  const MIN_SLOTS = 9;
  const drumItems = items.length === 0
    ? []
    : Array.from({ length: Math.max(MIN_SLOTS, items.length * 100) }, (_, i) => items[i % items.length]);

  const centerBlock = Math.floor(drumItems.length / 3);
  const centeredAt = (idx) => -(idx * ITEM_H) + (400 / 2 - ITEM_H / 2);

  // ── Spin logic ─────────────────────────────────────────────────────────
  const spin = useCallback(() => {
    if (spinning || items.length < 2) return;
    setSpinning(true);

    const winnerIdx = Math.floor(Math.random() * items.length);
    // land on the winner in the middle block
    const targetSlot = centerBlock + winnerIdx;

    const startOffset = offset;
    const endOffset = centeredAt(targetSlot);

    // add extra spins for drama
    const extraSpins = (10 + Math.floor(Math.random() * 5)) * items.length * ITEM_H;
    console.log(winnerIdx);
    
    const totalDelta = endOffset - startOffset - extraSpins;

    const duration = 4000 + items.length * 100;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      const current = startOffset + totalDelta * eased;

      setOffset(current);
      // compute which drum slot is currently centered
      const centeredSlot = Math.round(-current / ITEM_H + (400 / 2 - ITEM_H / 2) / ITEM_H);
      setActiveIdx(((centeredSlot % drumItems.length) + drumItems.length) % drumItems.length);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setOffset(endOffset);
        setActiveIdx(targetSlot % drumItems.length);
        setSpinning(false);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [spinning, items, offset, centerBlock, drumItems.length]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Reset drum position when items change
  useEffect(() => {
    setOffset(centeredAt(centerBlock));
    setActiveIdx(centerBlock % Math.max(drumItems.length, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // ── Input handlers ─────────────────────────────────────────────────────
  const addItem = () => {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    setItems((p) => [...p, v]);
    setInput("");
  };

  const removeItem = (idx) => setItems((p) => p.filter((_, i) => i !== idx));

  const handleKey = (e) => { if (e.key === "Enter") addItem(); };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="rs-root">
        <div className="rs-title">RANDOM SCROLL</div>
        <div className="rs-subtitle">PHỎM</div>

        <div className="rs-layout">
          {/* ── Left: item input ── */}
          <div className="rs-panel">
            <div className="rs-label">THÊM MỤC</div>
            <div className="rs-input-row">
              <input
                className="rs-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type an option…"
                disabled={spinning}
              />
              <button className="rs-btn" onClick={addItem} disabled={spinning || !input.trim()}>
                THÊM
              </button>
            </div>

            <div className="rs-label">
              DANH MỤC&nbsp;
              <span className="rs-count">({items.length})</span>
            </div>

            {items.length === 0 ? (
              <div className="rs-empty">Không có mục nào</div>
            ) : (
              <div className="rs-item-list">
                {items.map((item, i) => (
                  <div key={item} className="rs-item">
                    <span className="rs-item-num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="rs-item-name">{item}</span>
                    <button className="rs-del" onClick={() => removeItem(i)} disabled={spinning}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: drum ── */}
          <div className="rs-drum-panel">
            <div className="rs-label">VÒNG QUAY</div>

            <div className="rs-drum-wrapper">
              <div className="rs-drum-center-bg" />
              <div className="rs-drum-fade-top" />
              <div className="rs-drum-fade-bot" />
              <div
                ref={trackRef}
                className="rs-drum-track"
                style={{ transform: `translateY(${offset}px)` }}
              >
                {drumItems.map((item, i) => (
                  <div
                    key={i}
                    className={`rs-drum-item${i === activeIdx ? " active" : ""}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              className="rs-spin-btn"
              onClick={spin}
              disabled={spinning || items.length < 2}
            >
              {spinning ? "ĐANG QUAY SỐ" : "QUAY"}
            </button>

            {items.length < 2 && (
              <div style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>
                THÊM ÍT NHẤT 2 MỤC ĐỂ MỞ VÒNG QUAY
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}