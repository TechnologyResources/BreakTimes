import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, Sun, Moon, Clock, Sparkles } from "lucide-react";
import ShiftSelection from "@/components/ShiftSelection";
import BreakSelection from "@/components/BreakSelection";
import AdminModal from "@/components/AdminModal";
import ScheduleTable from "@/components/ScheduleTable";
import { Employee } from "@/types/shift";
import { SHIFT_CONFIGS } from "@/types/shift";

const Index = () => {
  const [isDark, setIsDark] = useState(false);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [selectedBreaks, setSelectedBreaks] = useState<{ time: string; duration: number }[]>([]);
  const [employeeName, setEmployeeName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [maxBreaks, setMaxBreaks] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  // Load max breaks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("maxBreaksCount");
    if (saved) setMaxBreaks(parseInt(saved));
  }, []);

  // Check employee lock
  useEffect(() => {
    const lockedName = localStorage.getItem("lockedEmployeeName");
    if (lockedName) {
      setEmployeeName(lockedName);
    }
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  const handleShiftSelect = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setSelectedBreaks([]);
  };

  const handleBreakToggle = (breakItem: { time: string; duration: number }) => {
    const index = selectedBreaks.findIndex(
      (b) => b.time === breakItem.time && b.duration === breakItem.duration
    );

    if (index !== -1) {
      if (index !== selectedBreaks.length - 1) {
        toast({
          title: "خطأ",
          description: "يجب إلغاء آخر بريك تم اختياره أولاً",
          variant: "destructive",
        });
        return;
      }
      setSelectedBreaks(selectedBreaks.slice(0, -1));
    } else {
      if (selectedBreaks.length >= maxBreaks) {
        toast({
          title: "تنبيه",
          description: `تم اختيار ${maxBreaks} بريكات بالفعل`,
          variant: "destructive",
        });
        return;
      }
      setSelectedBreaks([...selectedBreaks, breakItem]);
    }
  };

  const handleConfirmBooking = () => {
    if (!employeeName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الموظف",
        variant: "destructive",
      });
      return;
    }

    if (selectedBreaks.length !== maxBreaks) {
      toast({
        title: "خطأ",
        description: `يجب اختيار ${maxBreaks} بريكات`,
        variant: "destructive",
      });
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: employeeName.trim(),
      shiftId: selectedShiftId!,
      breaks: selectedBreaks,
    };

    setEmployees([...employees, newEmployee]);
    localStorage.setItem("lockedEmployeeName", employeeName.trim());

    toast({
      title: "نجح الحجز",
      description: "تم حجز البريكات بنجاح",
    });

    setSelectedBreaks([]);
  };

  const handleReset = () => {
    setSelectedShiftId(null);
    setSelectedBreaks([]);
  };

  const handleDeleteAllBookings = () => {
    setEmployees([]);
    toast({
      title: "تم المسح",
      description: "تم مسح جميع الحجوزات",
    });
  };

  const handleDeleteEmployee = (name: string) => {
    setEmployees(employees.filter((e) => e.name !== name));
    toast({
      title: "تم الحذف",
      description: `تم حذف سجل ${name}`,
    });
  };

  const handleClearDeviceLock = () => {
    localStorage.removeItem("lockedEmployeeName");
    setEmployeeName("");
    toast({
      title: "تم المسح",
      description: "تم مسح قفل الموظف",
    });
  };

  const handleSaveMaxBreaks = (newMax: number) => {
    setMaxBreaks(newMax);
    localStorage.setItem("maxBreaksCount", newMax.toString());
    toast({
      title: "تم الحفظ",
      description: "تم حفظ الحد الأقصى للبريكات",
    });
  };

  const selectedShift = SHIFT_CONFIGS.find(s => s.id === selectedShiftId);

  return (
    <div className="min-h-screen bg-gradient-elegant transition-colors duration-500" dir="rtl">
      {/* Luxury Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl relative z-10">
        {/* Luxury Header */}
        <header className="flex justify-between items-center mb-8 pb-6 border-b-2 border-primary/20 relative">
          <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gradient-luxury w-32" />
          
          <h1 className="text-4xl font-black flex items-center gap-3 group">
            <div className="p-3 rounded-2xl bg-gradient-luxury shadow-luxury group-hover:shadow-glow transition-all duration-300">
              <Sparkles className="w-8 h-8 text-secondary" />
            </div>
            <span className="bg-gradient-luxury bg-clip-text text-transparent">
              نظام حجز البريكات الفاخر
            </span>
          </h1>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAdminOpen(true)}
              className="rounded-full hover:bg-primary/10 hover:shadow-luxury transition-all duration-300 group"
            >
              <Settings className="w-5 h-5 text-primary group-hover:rotate-90 transition-transform duration-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-primary/10 hover:shadow-luxury transition-all duration-300"
            >
              {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
            </Button>
          </div>
        </header>

        {/* Luxury Time and Shift Display */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-card/80 backdrop-blur-xl p-6 rounded-2xl border-2 border-primary/20 shadow-deep relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-luxury opacity-5" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-gradient-luxury/10">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">الوقت الحالي</p>
              <span className="font-mono text-lg font-bold bg-gradient-luxury bg-clip-text text-transparent">
                {currentTime.toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            {selectedShift ? (
              <>
                <span className="text-2xl">{selectedShift.icon}</span>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الوردية الحالية</p>
                  <span className="text-lg font-bold text-foreground">{selectedShift.name}</span>
                </div>
              </>
            ) : (
              <span className="text-muted-foreground font-medium">لم يتم اختيار وردية بعد</span>
            )}
          </div>
        </div>

        {/* Main Content */}
        {!selectedShiftId ? (
          <ShiftSelection onSelectShift={handleShiftSelect} />
        ) : (
          <div className="space-y-8 animate-fade-in">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="mb-4 hover:bg-primary/10 hover:shadow-luxury transition-all duration-300 group"
            >
              <span className="group-hover:mr-2 transition-all duration-300">←</span>
              العودة لاختيار الوردية
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Break Selection */}
              <div className="lg:col-span-2">
                <BreakSelection
                  shiftId={selectedShiftId}
                  selectedBreaks={selectedBreaks}
                  maxBreaks={maxBreaks}
                  employees={employees}
                  currentTime={currentTime}
                  onBreakToggle={handleBreakToggle}
                  onConfirm={handleConfirmBooking}
                  employeeName={employeeName}
                  onEmployeeNameChange={setEmployeeName}
                  isNameLocked={!!localStorage.getItem("lockedEmployeeName")}
                />
              </div>

              {/* Schedule Table */}
              <div className="lg:col-span-1">
                <ScheduleTable
                  employees={employees.filter((e) => e.shiftId === selectedShiftId)}
                  currentTime={currentTime}
                  maxBreaks={maxBreaks}
                  shiftId={selectedShiftId}
                />
              </div>
            </div>
          </div>
        )}

        {/* Admin Modal */}
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          maxBreaks={maxBreaks}
          onSaveMaxBreaks={handleSaveMaxBreaks}
          onDeleteAllBookings={handleDeleteAllBookings}
          onDeleteEmployee={handleDeleteEmployee}
          onClearDeviceLock={handleClearDeviceLock}
          employees={employees}
        />
      </div>
    </div>
  );
};

export default Index;
