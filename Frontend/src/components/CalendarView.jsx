import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Award } from "lucide-react";

export const CalendarView = ({ exams, title = "Assessment Calendar" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfMonth(year, month);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  // Generate grid cells
  const gridCells = [];
  
  // Empty slots for offset
  for (let i = 0; i < firstDayOffset; i++) {
    gridCells.push({ type: "empty", key: `empty-${i}` });
  }

  // Day slots
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    
    // Filter exams scheduled on this date
    const dayExams = exams.filter(exam => {
      if (!exam.scheduledDateTime) return false;
      return isSameDay(new Date(exam.scheduledDateTime), cellDate);
    });

    gridCells.push({
      type: "day",
      day: d,
      date: cellDate,
      exams: dayExams,
      key: `day-${d}`
    });
  }

  // Determine exams for selected day
  const activeExams = selectedDate 
    ? gridCells.find(c => c.type === "day" && isSameDay(c.date, selectedDate))?.exams || []
    : [];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 backdrop-blur-md space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 min-w-0">
          <CalendarIcon className="h-4 w-4 text-indigo-400 shrink-0" />
          <h3 className="text-xs font-bold text-white truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={prevMonth}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <span className="text-[10px] font-bold text-white uppercase tracking-wider w-16 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Week Days header */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-black text-slate-500 uppercase tracking-wider">
        {daysOfWeek.map((day, idx) => (
          <div key={idx} className="py-0.5">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {gridCells.map((cell) => {
          if (cell.type === "empty") {
            return <div key={cell.key} className="aspect-square" />;
          }

          const hasExams = cell.exams.length > 0;
          const isSelected = selectedDate && isSameDay(cell.date, selectedDate);
          const isToday = isSameDay(cell.date, new Date());

          return (
            <button
              key={cell.key}
              onClick={() => setSelectedDate(cell.date)}
              className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-0.5 relative transition-all cursor-pointer ${
                isSelected 
                  ? "border-indigo-500 bg-indigo-600/10 text-white font-bold" 
                  : isToday
                  ? "border-slate-700 bg-slate-800/30 text-white font-bold"
                  : hasExams
                  ? "border-indigo-900 bg-indigo-950/10 hover:border-indigo-500/50 text-indigo-400"
                  : "border-slate-850 bg-slate-950/10 hover:border-slate-750 text-slate-400"
              }`}
            >
              <span className="text-[9px]">{cell.day}</span>

              {/* Indicator dot */}
              {hasExams && (
                <span className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                  isSelected ? "bg-indigo-400" : "bg-indigo-500 animate-pulse"
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Day Details Panel */}
      {selectedDate && (
        <div className="rounded-lg border border-slate-850 bg-slate-955/40 p-2.5 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
            <span className="text-[9px] text-slate-500 uppercase font-semibold">
              {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} Schedule
            </span>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-slate-500 hover:text-slate-350 text-[9px] cursor-pointer"
            >
              Clear
            </button>
          </div>

          {activeExams.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic py-0.5">No exams scheduled.</p>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5">
              {activeExams.map((exam, idx) => (
                <div 
                  key={exam._id || idx} 
                  className="rounded border border-slate-850 bg-slate-900/50 p-2 flex items-center justify-between text-[10px]"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-white truncate">{exam.title}</p>
                    <div className="flex items-center space-x-2 text-[8px] text-slate-400">
                      <span className="flex items-center">
                        <Clock className="mr-0.5 h-2.5 w-2.5 text-indigo-400" />
                        {new Date(exam.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center">
                        <Award className="mr-0.5 h-2.5 w-2.5 text-purple-400" />
                        {exam.totalMarks}M
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono bg-slate-950 px-1 rounded border border-slate-850 shrink-0 ml-1">
                    {exam.code}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
