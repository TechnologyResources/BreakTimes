import { Card } from "@/components/ui/card";
import { Employee } from "@/types/shift";
import { SHIFT_CONFIGS, parseArabicTime } from "@/types/shift";
import { Clock, Calendar } from "lucide-react";

interface ScheduleTableProps {
  employees: Employee[];
  currentTime: Date;
  maxBreaks: number;
  shiftId: string;
}

const timeToDate = (timeString: string): Date => {
  const time24 = parseArabicTime(timeString);
  const [hours, minutes] = time24.split(":").map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
};

const formatTimeDifference = (ms: number): string => {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number) => num.toString().padStart(2, "0");

  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (minutes > 0) return `${pad(minutes)}:${pad(seconds)}`;
  return `${pad(seconds)} ث`;
};

const BreakCell = ({ breakItem, currentTime }: { breakItem: any; currentTime: Date }) => {
  if (!breakItem) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm border-r-2 border-border/50">
        <span className="opacity-50">غير محجوز</span>
      </div>
    );
  }

  const breakStart = timeToDate(breakItem.time);
  const breakEnd = new Date(breakStart.getTime() + breakItem.duration * 60000);
  const now = currentTime;

  let status = "";
  let statusClass = "";

  if (now < breakStart) {
    const diff = breakStart.getTime() - now.getTime();
    status = `يبدأ بعد ${formatTimeDifference(diff)}`;
    statusClass = "text-secondary bg-secondary/10 px-3 py-1 rounded-full font-bold text-xs";
  } else if (now >= breakStart && now < breakEnd) {
    const diff = breakEnd.getTime() - now.getTime();
    status = `متبقي ${formatTimeDifference(diff)}`;
    statusClass = "text-white bg-gradient-to-r from-destructive to-warning px-3 py-2 rounded-full font-black text-xs animate-pulse shadow-luxury";
  } else {
    status = "انتهى ✓";
    statusClass = "text-muted-foreground text-xs opacity-60";
  }

  const durationClass = breakItem.duration === 30 
    ? "text-warning bg-warning/10 border-warning/30" 
    : "text-success bg-success/10 border-success/30";

  return (
    <div className={`p-4 text-center border-r-2 border-border/50 transition-all duration-300 ${breakItem.duration === 30 ? "bg-warning/5" : ""}`}>
      <div className="text-sm font-black mb-1">{breakItem.time}</div>
      <div className={`text-xs font-bold mb-2 inline-block px-3 py-1 rounded-full border ${durationClass}`}>
        {breakItem.duration} دقيقة
      </div>
      <div className={`text-xs ${statusClass} inline-block`}>
        {status}
      </div>
    </div>
  );
};

const ScheduleTable = ({ employees, currentTime, maxBreaks, shiftId }: ScheduleTableProps) => {
  const shift = SHIFT_CONFIGS.find(s => s.id === shiftId);
  
  const sortedEmployees = [...employees].sort((a, b) => {
    const timeA = a.breaks[0] ? timeToDate(a.breaks[0].time) : new Date(0);
    const timeB = b.breaks[0] ? timeToDate(b.breaks[0].time) : new Date(0);
    return timeA.getTime() - timeB.getTime();
  });

  return (
    <Card className="p-6 bg-card/90 backdrop-blur-xl shadow-deep border-2 border-primary/20 h-fit relative overflow-hidden animate-scale-in">
      <div className="absolute inset-0 bg-gradient-navy opacity-5" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-primary/20">
          <div className="p-2 rounded-xl bg-gradient-luxury/10">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black bg-gradient-luxury bg-clip-text text-transparent">
              جدول الحجوزات
            </h2>
            {shift && (
              <p className="text-xs text-muted-foreground">
                {shift.name} {shift.icon}
              </p>
            )}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6 font-medium">
          جميع الحجوزات في هذه الوردية مع مؤقتات مباشرة ⏱️
        </p>

        {sortedEmployees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">لا توجد حجوزات بعد</p>
            <p className="text-sm mt-2">ابدأ بحجز بريكك الآن!</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-primary/20 shadow-inner">
            <div className="min-w-[700px]">
              {/* Header */}
              <div className="grid grid-cols-12 text-sm font-black bg-gradient-luxury text-secondary rounded-t-xl p-3">
                <div className="col-span-3 p-2 border-r-2 border-secondary/30">الموظف</div>
                <div className="col-span-3 p-2 border-r-2 border-secondary/30">البريك الأول</div>
                <div className="col-span-3 p-2 border-r-2 border-secondary/30">البريك الثاني</div>
                <div className="col-span-3 p-2">البريك الثالث</div>
              </div>

              {/* Rows */}
              {sortedEmployees.map((emp, index) => {
                const rowClass = index % 2 === 0 ? "bg-card" : "bg-muted/30";
                const breaksArray = [...emp.breaks];
                while (breaksArray.length < maxBreaks) {
                  breaksArray.push(null);
                }

                return (
                  <div
                    key={emp.id}
                    className={`grid grid-cols-12 text-sm ${rowClass} hover:bg-gradient-luxury/5 transition-all duration-300 border-b border-border/30`}
                  >
                    <div className="col-span-3 p-4 font-black border-r-2 border-border/50 flex items-center text-base">
                      <span className="bg-gradient-luxury bg-clip-text text-transparent">
                        {emp.name}
                      </span>
                    </div>
                    {breaksArray.map((breakItem, idx) => (
                      <div key={idx} className="col-span-3">
                        <BreakCell breakItem={breakItem} currentTime={currentTime} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScheduleTable;
