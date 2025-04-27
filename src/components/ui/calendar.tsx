"use client";

import { ChevronLeft, ChevronRight, Sun, Moon, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// Season-based themes for different months
const getSeasonTheme = (month: number) => {
  // Spring: March-May
  if (month >= 2 && month <= 4) return "spring";
  // Summer: June-August
  if (month >= 5 && month <= 7) return "summer";
  // Fall: September-November
  if (month >= 8 && month <= 10) return "fall";
  // Winter: December-February
  return "winter";
};

const seasonGradients = {
  spring: "bg-gradient-to-br from-pink-100 to-green-100",
  summer: "bg-gradient-to-br from-yellow-100 to-blue-100",
  fall: "bg-gradient-to-br from-orange-100 to-amber-50",
  winter: "bg-gradient-to-br from-blue-100 to-slate-100"
};

const seasonIcons = {
  spring: (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ delay: 0.3, type: "spring" }}
      className="absolute top-2 right-2 text-pink-400"
    >
      <Sun className="h-5 w-5" />
    </motion.div>
  ),
  summer: (
    <motion.div 
      initial={{ scale: 0, y: -20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
      className="absolute top-2 right-2 text-yellow-500"
    >
      <Sun className="h-5 w-5" />
    </motion.div>
  ),
  fall: (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute top-2 right-2 text-orange-400"
    >
      <Cloud className="h-5 w-5" />
    </motion.div>
  ),
  winter: (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="absolute top-2 right-2 text-blue-400"
    >
      <Moon className="h-5 w-5" />
    </motion.div>
  )
};

export default function CustomCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [lastInteraction, setLastInteraction] = useState<null | "prev" | "next">(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  
  const seasonTheme = getSeasonTheme(month);

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
    setDirection(-1);
    setLastInteraction("prev");
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    setDirection(1);
    setLastInteraction("next");
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
  };

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const handleDayClick = (date: Date) => {
    onSelect(date);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.03
      }
    }
  };
  
  const dayVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // Button hover variants
  const buttonHoverEffect = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      rotate: lastInteraction === "prev" ? -5 : 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Month name animation
  const monthNameVariants = {
    initial: { 
      x: direction * 50, 
      opacity: 0,
      rotateY: direction * 30
    },
    animate: { 
      x: 0, 
      opacity: 1,
      rotateY: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20 
      }
    },
    exit: { 
      x: direction * -50, 
      opacity: 0,
      rotateY: direction * -30,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className={cn(
        "p-4 w-full max-w-sm mx-auto space-y-4 select-none rounded-xl shadow-md relative overflow-hidden",
        seasonGradients[seasonTheme]
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {seasonIcons[seasonTheme]}
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition"
          variants={buttonHoverEffect}
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${month}-${year}`}
            variants={monthNameVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-lg font-semibold px-4 py-1 rounded-full bg-white/40 backdrop-blur-sm"
          >
            {currentDate.toLocaleString("default", { month: "long" })}{" "}
            {year}
          </motion.div>
        </AnimatePresence>
        
        <motion.button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition"
          variants={buttonHoverEffect}
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 text-xs font-medium bg-white/30 backdrop-blur-sm rounded-lg py-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Dates */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${month}-${year}-days`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="grid grid-cols-7 gap-1 py-2"
        >
          {daysArray.map((date, idx) => (
            <div key={idx} className="flex justify-center items-center">
              {date ? (
                <motion.button
                  onClick={() => handleDayClick(date)}
                  disabled={date < today}
                  variants={dayVariants}
                  whileHover={{ 
                    scale: 1.15, 
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ 
                    scale: 0.8,
                    rotate: Math.random() > 0.5 ? 5 : -5
                  }}
                  className={cn(
                    "w-9 h-9 rounded-full text-sm flex items-center justify-center transition-all",
                    isSameDay(date, today) && "bg-accent text-accent-foreground font-bold ring-2 ring-accent ring-offset-2",
                    isSameDay(date, selectedDate) && "bg-primary text-primary-foreground font-bold",
                    date < today ? "text-muted-foreground opacity-50" : ""
                  )}
                >
                  {date.getDate()}
                </motion.button>
              ) : (
                <div className="w-9 h-9" />
              )}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}