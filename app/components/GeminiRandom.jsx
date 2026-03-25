"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';

const ITEM_HEIGHT = 60; // Height of each item in pixels

export default function RandomSelector() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState([]);
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const controls = useAnimation();

  const handleSpin = async () => {
    const list = input.split('\n').filter(i => i.trim() !== "");
    if (list.length < 2) return alert("Please enter at least 2 items!");

    setItems(list);
    setWinner(null);
    setIsSpinning(true);

    // Pick a random index
    const randomIndex = Math.floor(Math.random() * list.length);
    
    // We want to "spin" through the list multiple times for effect
    // Total distance = (Number of full rotations * list height) + (Winning index height)
    const rotations = 5; 
    const totalDistance = (rotations * list.length * ITEM_HEIGHT) + (randomIndex * ITEM_HEIGHT);

    await controls.start({
      y: -totalDistance,
      transition: { 
        duration: 4, 
        ease: [0.45, 0.05, 0.55, 0.95] // Custom cubic-bezier for "braking" effect
      }
    });

    setWinner(list[randomIndex]);
    setIsSpinning(false);
  };

  const reset = () => {
    controls.set({ y: 0 });
    setWinner(null);
    setItems([]);
  };

  return (
    <div className="flex flex-col items-center p-8 max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Sparkles className="text-yellow-500" /> Random Choice
      </h2>

      {/* Input Section */}
      {!isSpinning && !winner && (
        <textarea
          className="w-full h-40 p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter items (one per line)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      )}

      {/* Animation Window */}
      {(items.length > 0 || isSpinning) && (
        <div className="relative w-full border-2 border-blue-500 rounded-xl overflow-hidden bg-white shadow-inner" 
             style={{ height: ITEM_HEIGHT }}>
          
          {/* Visual Indicator (Center Line) */}
          <div className="absolute inset-0 pointer-events-none border-y-4 border-yellow-400/30 z-10" />

          <motion.div animate={controls} className="flex flex-col">
            {/* We repeat the list to create the infinite scroll illusion */}
            {[...Array(10)].map((_, i) => (
              items.map((item, idx) => (
                <div 
                  key={`${i}-${idx}`} 
                  className="flex items-center justify-center font-medium text-lg text-slate-700"
                  style={{ height: ITEM_HEIGHT }}
                >
                  {item}
                </div>
              ))
            ))}
          </motion.div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4">
        {!winner ? (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSpinning ? "Selecting..." : "Spin the Wheel"}
          </button>
        ) : (
          <button
            onClick={reset}
            className="px-8 py-3 bg-slate-200 text-slate-700 rounded-full font-semibold flex items-center gap-2 hover:bg-slate-300 transition-all"
          >
            <RotateCcw size={18} /> Reset
          </button>
        )}
      </div>

      {/* Result Display */}
      {winner && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1.1 }} 
          className="text-center"
        >
          <p className="text-sm text-slate-500 uppercase tracking-widest">The Winner Is</p>
          <h1 className="text-4xl font-black text-blue-600 mt-2">{winner}</h1>
        </motion.div>
      )}
    </div>
  );
}