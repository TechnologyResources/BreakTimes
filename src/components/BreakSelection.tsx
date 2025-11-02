import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee } from "@/types/shift";
import { generateBreakTimes, formatTime, SHIFT_CONFIGS } from "@/types/shift";
import TimeSlot from "./TimeSlot";

interface BreakSelectionProps {
  shiftId: string;
  selectedBreaks: { time: string; duration: number }[];
  maxBreaks: number;
  employees: Employee[];
  currentTime: Date;
  onBreakToggle: (breakItem: { time: string; duration: number }) => void;
  onConfirm: () => void;
  employeeName: string;
  onEmployeeNameChange: (name: string) => void;
  isNameLocked: boolean;
}

const REQUIRED_ORDER = [15, 30, 15];

const BreakSelection = ({
  shiftId,
  selectedBreaks,
  maxBreaks,
  employees,
  currentTime,
  onBreakToggle,
  onConfirm,
  employeeName,
  onEmployeeNameChange,
  isNameLocked,
}: BreakSelectionProps) => {
  const shift = SHIFT_CONFIGS.find(s => s.id === shiftId);
  if (!shift) return null;

  const breakTimes = generateBreakTimes(shift.startTime, shift.endTime);
  const slots = breakTimes.map(b => ({ time: formatTime(b.time), duration: b.duration }));

  const bookedSlots = employees
    .flatMap((e) => e.breaks)
    .map((b) => `${b.time}-${b.duration}`);

  const currentIndex = selectedBreaks.length;
  const requiredDuration = currentIndex < maxBreaks ? REQUIRED_ORDER[currentIndex] : null;

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-xl shadow-deep border-2 border-primary/20 relative overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-gradient-luxury opacity-5" />
      
      <div className="relative z-10">
        <h2 className="text-2xl font-black mb-6 bg-gradient-luxury bg-clip-text text-transparent">
          اختر فترات الراحة
          <span className="block text-sm text-muted-foreground mt-2 font-normal">
            يجب اختيار <span className="text-destructive font-bold">{maxBreaks}</span> بريكات بالترتيب: 15، 30، 15 دقيقة
          </span>
        </h2>

        {/* Selected Count */}
        <div className="bg-gradient-luxury/10 p-5 rounded-2xl flex justify-between items-center mb-6 border-2 border-primary/20 shadow-glow">
          <span className="font-black text-primary text-lg">البريكات المختارة:</span>
          <span className="text-4xl font-black bg-gradient-luxury bg-clip-text text-transparent">
            {selectedBreaks.length} / {maxBreaks}
          </span>
        </div>

        {/* Time Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 max-h-[500px] overflow-y-auto p-2">
          {slots.map((slot) => (
            <TimeSlot
              key={`${slot.time}-${slot.duration}`}
              slot={slot}
              isBooked={bookedSlots.includes(`${slot.time}-${slot.duration}`)}
              isSelected={selectedBreaks.some(
                (b) => b.time === slot.time && b.duration === slot.duration
              )}
              currentTime={currentTime}
              requiredDuration={requiredDuration}
              onToggle={onBreakToggle}
            />
          ))}
        </div>

        {/* Employee Name Input */}
        <div className="space-y-4 border-t-2 border-primary/10 pt-6">
          <div>
            <Label htmlFor="employeeName" className="text-lg font-bold mb-3 block text-foreground">
              اسم الموظف الثلاثي:
            </Label>
            <Input
              id="employeeName"
              type="text"
              value={employeeName}
              onChange={(e) => onEmployeeNameChange(e.target.value)}
              disabled={isNameLocked}
              placeholder="أدخل اسمك هنا"
              className="text-lg bg-muted/30 border-2 border-primary/20 focus:border-primary h-14"
            />
            {isNameLocked && (
              <p className="text-sm text-warning mt-2 font-semibold">
                🔒 تم قفل الاسم على هذا الجهاز. للتغيير، استخدم لوحة المدير.
              </p>
            )}
          </div>

          <Button
            onClick={onConfirm}
            disabled={selectedBreaks.length !== maxBreaks || !employeeName.trim()}
            className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-black py-7 text-xl shadow-luxury hover:shadow-glow transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-success/30"
          >
            تأكيد الحجز ✨
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BreakSelection;
