import { Button } from "@/components/ui/button";
import { parseArabicTime } from "@/types/shift";

interface TimeSlotProps {
  slot: { time: string; duration: number };
  isBooked: boolean;
  isSelected: boolean;
  currentTime: Date;
  requiredDuration: number | null;
  onToggle: (slot: { time: string; duration: number }) => void;
}

const timeToDate = (timeString: string): Date => {
  const time24 = parseArabicTime(timeString);
  const [hours, minutes] = time24.split(":").map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
};

const getBreakEndString = (startTime: string, duration: number): string => {
  const start = timeToDate(startTime);
  const end = new Date(start.getTime() + duration * 60000);
  return end
    .toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true })
    .replace(/ /g, "")
    .replace("AM", "ص")
    .replace("PM", "م");
};

const TimeSlot = ({
  slot,
  isBooked,
  isSelected,
  currentTime,
  requiredDuration,
  onToggle,
}: TimeSlotProps) => {
  const breakEnd = new Date(timeToDate(slot.time).getTime() + slot.duration * 60000);
  const isPastTime = breakEnd.getTime() < currentTime.getTime();
  const isWrongDuration = requiredDuration !== null && slot.duration !== requiredDuration;
  const isDisabled = isBooked || isPastTime || isWrongDuration;

  let statusText = "";
  let variantClass = "";

  if (isPastTime) {
    statusText = "انتهت ⌛";
    variantClass = "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60";
  } else if (isBooked) {
    statusText = "محجوزة ❌";
    variantClass = "bg-destructive/10 text-destructive cursor-not-allowed border-destructive/30";
  } else if (isSelected) {
    statusText = "مختارة ✓";
    variantClass = "bg-gradient-luxury text-white shadow-luxury ring-4 ring-primary/30 scale-105 font-black";
  } else if (isWrongDuration) {
    statusText = `يجب ${requiredDuration} دقيقة ⚠️`;
    variantClass = "bg-warning/10 text-warning cursor-not-allowed border-warning/30";
  } else {
    statusText = "متاحة ✨";
    variantClass = "bg-card hover:bg-gradient-luxury/10 border-primary/20 hover:border-primary hover:shadow-luxury hover:scale-105";
  }

  return (
    <Button
      onClick={() => !isDisabled && onToggle(slot)}
      disabled={isDisabled && !isSelected}
      className={`h-auto flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-500 ${variantClass}`}
      variant="outline"
    >
      <span className="text-xs font-bold mb-2 opacity-90">
        ({slot.duration} دقيقة)
      </span>
      <span className="font-black text-sm mb-2">
        {slot.time}
      </span>
      <span className="text-xs opacity-80">
        {getBreakEndString(slot.time, slot.duration)}
      </span>
      <span className="text-xs font-bold mt-3 px-3 py-1 rounded-full bg-background/50">
        {statusText}
      </span>
    </Button>
  );
};

export default TimeSlot;
