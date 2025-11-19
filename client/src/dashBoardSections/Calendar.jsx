import React, { useState, useEffect } from 'react';

function Calendar() {
  const [daysInMonth] = useState(30); // November 2025 has 30 days

  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="bg-[radial-gradient(circle_at_center,_#38bdf8,_#1e40af)] rounded-xl p-5 text-white mb-5">
      <div className="text-sm font-bold mb-4">NOVEMBER 2025</div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-xs">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="text-center opacity-70 text-[10px]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: 4 }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square flex items-center justify-center rounded-md text-xs opacity-40"></div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day) => (
          <div
            key={day}
            className="aspect-square flex items-center justify-center rounded-md text-xs cursor-pointer transition-all duration-200 hover:bg-amber-200 hover:text-blue-600 hover:scale-110 hover:font-bold"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;
