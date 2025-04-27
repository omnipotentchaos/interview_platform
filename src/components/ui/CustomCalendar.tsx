"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CustomCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const daysArray = [];

  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null); // empty spots before month starts
  }

  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(new Date(year, month, day));
  }

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
  };

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  return (
    <div className="p-4 w-full max-w-sm mx-auto space-y-4 select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-accent transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-lg font-semibold">
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {year}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-accent transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-xs text-muted-foreground font-medium">
        {DAYS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((date, idx) => (
          <div key={idx} className="flex justify-center items-center">
            {date ? (
              <button
                onClick={() => onSelect(date)}
                disabled={date < today}
                className={cn(
                  "w-9 h-9 rounded-full text-sm flex items-center justify-center transition-colors",
                  isSameDay(date, today) && "bg-accent text-accent-foreground font-bold",
                  isSameDay(date, selectedDate) && "bg-primary text-primary-foreground font-bold",
                  date < today ? "text-muted-foreground opacity-50" : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {date.getDate()}
              </button>
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
