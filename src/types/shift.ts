export interface ShiftConfig {
  id: string;
  name: string;
  startTime: string; // Format: "HH:MM" in 24-hour
  endTime: string;
  icon: string;
  color: string;
}

export const SHIFT_CONFIGS: ShiftConfig[] = [
  {
    id: "early-morning",
    name: "الوردية المبكرة",
    startTime: "07:00",
    endTime: "15:00",
    icon: "☀️",
    color: "from-amber-400 to-orange-500"
  },
  {
    id: "morning",
    name: "الوردية الصباحية",
    startTime: "08:00",
    endTime: "17:00",
    icon: "🌅",
    color: "from-blue-400 to-cyan-500"
  },
  {
    id: "afternoon",
    name: "وردية الظهيرة",
    startTime: "12:00",
    endTime: "21:00",
    icon: "🌤️",
    color: "from-yellow-400 to-amber-500"
  },
  {
    id: "evening",
    name: "الوردية المسائية",
    startTime: "15:00",
    endTime: "00:00",
    icon: "🌙",
    color: "from-indigo-500 to-purple-600"
  },
  {
    id: "night",
    name: "الوردية الليلية",
    startTime: "22:00",
    endTime: "07:00",
    icon: "🌃",
    color: "from-purple-600 to-pink-600"
  }
];

export interface Break {
  time: string;
  duration: number;
}

export interface Employee {
  id: string;
  name: string;
  shiftId: string;
  breaks: Break[];
}

/**
 * Generate available break times for a shift starting 1 hour after shift start
 */
export function generateBreakTimes(shiftStartTime: string, shiftEndTime: string): Break[] {
  const breaks: Break[] = [];
  
  // Parse shift start time
  const [startHour, startMin] = shiftStartTime.split(':').map(Number);
  const [endHour, endMin] = shiftEndTime.split(':').map(Number);
  
  // Calculate start time for breaks (1 hour after shift start)
  let currentHour = startHour + 1;
  let currentMin = startMin;
  
  // Normalize if over 24 hours
  if (currentHour >= 24) currentHour -= 24;
  
  // Generate breaks every 15 or 30 minutes
  const durations = [15, 30];
  
  while (true) {
    // Check if we've reached the end time (leave at least 1 hour before shift ends)
    let effectiveEndHour = endHour;
    if (endHour < startHour) effectiveEndHour += 24; // Handle overnight shifts
    
    let currentEffectiveHour = currentHour;
    if (currentHour < startHour) currentEffectiveHour += 24;
    
    // Stop 1 hour before shift end
    if (currentEffectiveHour >= effectiveEndHour - 1) break;
    
    // Add breaks with different durations
    durations.forEach(duration => {
      const hour = currentHour % 24;
      const timeString = `${hour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      breaks.push({ time: timeString, duration });
    });
    
    // Increment by 15 minutes
    currentMin += 15;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour += 1;
    }
    
    // Safety break to avoid infinite loop
    if (breaks.length > 100) break;
  }
  
  return breaks;
}

/**
 * Format time from 24-hour to 12-hour with Arabic AM/PM
 */
export function formatTime(time24: string): string {
  const [hour, min] = time24.split(':').map(Number);
  
  if (hour === 0) return `12:${min.toString().padStart(2, '0')} ص`;
  if (hour < 12) return `${hour}:${min.toString().padStart(2, '0')} ص`;
  if (hour === 12) return `12:${min.toString().padStart(2, '0')} م`;
  return `${hour - 12}:${min.toString().padStart(2, '0')} م`;
}

/**
 * Parse Arabic formatted time back to 24-hour format
 */
export function parseArabicTime(timeAr: string): string {
  const isPM = timeAr.includes('م');
  const time = timeAr.replace(/[صم]/g, '').trim();
  const [hour, min] = time.split(':').map(Number);
  
  let hour24 = hour;
  if (isPM && hour !== 12) hour24 += 12;
  if (!isPM && hour === 12) hour24 = 0;
  
  return `${hour24.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}
