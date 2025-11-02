import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/shift";
import { SHIFT_CONFIGS } from "@/types/shift";
import { Lock, Trash2, Settings, Download, Unlock, Shield } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxBreaks: number;
  onSaveMaxBreaks: (value: number) => void;
  onDeleteAllBookings: () => void;
  onDeleteEmployee: (name: string) => void;
  onClearDeviceLock: () => void;
  employees: Employee[];
}

const ADMIN_CODE = "12345";

const AdminModal = ({
  isOpen,
  onClose,
  maxBreaks,
  onSaveMaxBreaks,
  onDeleteAllBookings,
  onDeleteEmployee,
  onClearDeviceLock,
  employees,
}: AdminModalProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [tempMaxBreaks, setTempMaxBreaks] = useState(maxBreaks);
  const [deleteEmployeeName, setDeleteEmployeeName] = useState("");
  const { toast } = useToast();

  const handleLogin = () => {
    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      toast({
        title: "نجح تسجيل الدخول ✨",
        description: "مرحباً بك في لوحة التحكم الفاخرة",
      });
    } else {
      toast({
        title: "خطأ ❌",
        description: "الرمز السري غير صحيح",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setCode("");
    onClose();
  };

  const handleSaveMaxBreaks = () => {
    if (tempMaxBreaks >= 1 && tempMaxBreaks <= 5) {
      onSaveMaxBreaks(tempMaxBreaks);
    } else {
      toast({
        title: "خطأ",
        description: "القيمة يجب أن تكون بين 1 و 5",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = () => {
    if (deleteEmployeeName.trim()) {
      onDeleteEmployee(deleteEmployeeName.trim());
      setDeleteEmployeeName("");
    }
  };

  const handleExportCSV = () => {
    const headers = ["الموظف", "الوردية", "البريك 1", "البريك 2", "البريك 3"];
    const rows = employees.map((emp) => {
      const shift = SHIFT_CONFIGS.find(s => s.id === emp.shiftId);
      return [
        emp.name,
        shift?.name || emp.shiftId,
        emp.breaks[0] ? `${emp.breaks[0].time} (${emp.breaks[0].duration} دقيقة)` : "-",
        emp.breaks[1] ? `${emp.breaks[1].time} (${emp.breaks[1].duration} دقيقة)` : "-",
        emp.breaks[2] ? `${emp.breaks[2].time} (${emp.breaks[2].duration} دقيقة)` : "-",
      ];
    });

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "تم التصدير ✓",
      description: "تم تنزيل ملف CSV بنجاح",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-2 border-primary/20" dir="rtl">
        <div className="absolute inset-0 bg-gradient-navy opacity-5 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-3 text-3xl">
            <div className="p-2 rounded-xl bg-gradient-luxury">
              <Shield className="w-7 h-7 text-secondary" />
            </div>
            <span className="bg-gradient-luxury bg-clip-text text-transparent font-black">
              لوحة تحكم المدير
            </span>
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-6 py-6 relative z-10">
            <p className="text-muted-foreground text-lg font-medium">
              الرجاء إدخال الرمز السري للمتابعة 🔒
            </p>
            <div>
              <Label htmlFor="adminCode" className="text-base font-bold">الرمز السري</Label>
              <Input
                id="adminCode"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="أدخل الرمز السري"
                className="mt-2 h-14 text-lg border-2 border-primary/20 focus:border-primary bg-muted/30"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full h-14 text-lg font-black bg-gradient-luxury hover:shadow-luxury transition-all duration-300"
            >
              تسجيل الدخول 🚀
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-6 relative z-10">
            {/* Settings Section */}
            <Card className="p-6 bg-gradient-to-br from-card to-muted/30 border-2 border-primary/20 shadow-luxury">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-black text-primary">إعدادات النظام</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxBreaks" className="text-base font-bold">الحد الأقصى لعدد البريكات:</Label>
                  <div className="flex gap-3 mt-3">
                    <Input
                      id="maxBreaks"
                      type="number"
                      min="1"
                      max="5"
                      value={tempMaxBreaks}
                      onChange={(e) => setTempMaxBreaks(parseInt(e.target.value))}
                      className="w-28 h-12 text-center text-lg font-black border-2 border-primary/20"
                    />
                    <Button 
                      onClick={handleSaveMaxBreaks} 
                      className="flex-1 h-12 bg-success hover:bg-success/90 font-black"
                    >
                      حفظ التغييرات 💾
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Delete Operations */}
            <Card className="p-6 bg-gradient-to-br from-destructive/5 to-destructive/10 border-2 border-destructive/20 shadow-deep">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-destructive/10">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-black text-destructive">أدوات مسح البيانات</h3>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={onDeleteAllBookings}
                  variant="destructive"
                  className="w-full h-12 font-black text-base"
                >
                  مسح جميع الحجوزات بالكامل 🗑️
                </Button>

                <div className="flex gap-3">
                  <Input
                    value={deleteEmployeeName}
                    onChange={(e) => setDeleteEmployeeName(e.target.value)}
                    placeholder="اسم الموظف المراد حذف سجله"
                    className="flex-grow h-12 border-2 border-destructive/20"
                  />
                  <Button 
                    onClick={handleDeleteEmployee} 
                    variant="destructive"
                    className="h-12 px-6 font-black"
                  >
                    حذف
                  </Button>
                </div>

                <Button
                  onClick={onClearDeviceLock}
                  variant="outline"
                  className="w-full h-12 border-2 border-warning hover:bg-warning/10 font-black"
                >
                  <Unlock className="w-5 h-5 ml-2" />
                  مسح قفل حجز الموظف 🔓
                </Button>
              </div>
            </Card>

            {/* Export Section */}
            <Card className="p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-2 border-secondary/20 shadow-deep">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-secondary/10">
                  <Download className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-black text-secondary">تصدير البيانات</h3>
              </div>
              <Button 
                onClick={handleExportCSV} 
                className="w-full h-12 bg-secondary hover:bg-secondary/90 font-black text-base"
              >
                تنزيل جدول الحجوزات (CSV) 📊
              </Button>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminModal;
