import { Card } from "@/components/ui/card";
import { SHIFT_CONFIGS } from "@/types/shift";

interface ShiftSelectionProps {
  onSelectShift: (shiftId: string) => void;
}

const ShiftSelection = ({ onSelectShift }: ShiftSelectionProps) => {
  return (
    <div className="max-w-6xl mx-auto animate-scale-in">
      <Card className="p-8 bg-card/90 backdrop-blur-xl shadow-luxury border-2 border-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-luxury opacity-5" />
        
        <h2 className="text-3xl font-black mb-8 text-center relative z-10 bg-gradient-luxury bg-clip-text text-transparent">
          اختر وردية العمل
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {SHIFT_CONFIGS.map((shift) => (
            <Card
              key={shift.id}
              className="p-6 cursor-pointer transition-all duration-500 hover:shadow-luxury hover:scale-105 border-2 border-primary/10 hover:border-primary group bg-gradient-to-br from-card to-muted/20 relative overflow-hidden"
              onClick={() => onSelectShift(shift.id)}
            >
              <div className="absolute inset-0 bg-gradient-luxury opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="text-6xl mb-2 group-hover:scale-125 transition-transform duration-500">
                  {shift.icon}
                </div>
                
                <h3 className="text-xl font-black bg-gradient-luxury bg-clip-text text-transparent">
                  {shift.name}
                </h3>
                
                <div className="space-y-1 text-muted-foreground">
                  <p className="text-sm font-semibold">
                    من {shift.startTime.split(':')[0]}:{shift.startTime.split(':')[1]}
                  </p>
                  <p className="text-sm font-semibold">
                    إلى {shift.endTime.split(':')[0]}:{shift.endTime.split(':')[1]}
                  </p>
                </div>
                
                <div className="mt-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  البريكات متاحة بعد ساعة من البداية
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ShiftSelection;
