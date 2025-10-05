import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExtensionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (newDueDate: Date, reason: string) => void;
  currentDueDate: string;
}

export function ExtensionRequestDialog({ 
  open, 
  onOpenChange, 
  onSubmit,
  currentDueDate 
}: ExtensionRequestDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [time, setTime] = useState('10:00'); // HH:MM
  const [suppressBlur, setSuppressBlur] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const timeInputRef = useState<HTMLInputElement | null>(null)[0];

  // Focus the reason textarea when dialog opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const reasonTextarea = document.getElementById('reason') as HTMLTextAreaElement;
        if (reasonTextarea) {
          reasonTextarea.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!selectedDate) return;
    // Merge selected date with chosen time if provided
    const dateWithTime = new Date(selectedDate);
    if (!time) return;
    const [hh, mm] = time.split(':').map((v) => parseInt(v, 10));
    dateWithTime.setHours(hh || 0, mm || 0, 0, 0);
    onSubmit(dateWithTime, reason);
    setSelectedDate(undefined);
    setReason('');
    setTime('');
    onOpenChange(false);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  // Validate currentDueDate and provide fallback
  const getCurrentDueDate = () => {
    if (!currentDueDate || currentDueDate === '') {
      return new Date(); // Fallback to current date
    }
    const date = new Date(currentDueDate);
    return isNaN(date.getTime()) ? new Date() : date; // Fallback if invalid
  };

  const minDate = new Date(getCurrentDueDate());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Extension</DialogTitle>
          <DialogDescription>
            Request an extension for your loan repayment date.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Due Date</Label>
            <p className="text-sm text-muted-foreground">
              {format(getCurrentDueDate(), 'PPP')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-date">New Due Date *</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="new-date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? selectedDate.toDateString() : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setDateOpen(false);
                    setTimeout(() => {
                      const input = document.getElementById('new-time') as HTMLInputElement | null;
                      input?.focus();
                    }, 0);
                  }}
                  disabled={(date) => date < minDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-time">Time *</Label>
            <div
              className="w-full rounded-md border bg-background px-3 py-2 text-sm cursor-text"
              onClick={() => {
                setTimePickerOpen(true);
                const input = document.getElementById('new-time') as HTMLInputElement | null;
                setTimeout(() => {
                  input?.showPicker?.();
                  input?.focus();
                }, 100);
              }}
            >
              <input
                id="new-time"
                type="time"
                value={time}
                onFocus={() => {
                  setTimePickerOpen(true);
                  setSuppressBlur(true);
                }}
                onChange={(e) => {
                  setTime(e.target.value);
                  // Don't auto-close, let user finish selecting AM/PM
                }}
                onBlur={(e) => {
                  if (suppressBlur) {
                    e.preventDefault();
                    e.stopPropagation();
                    (e.target as HTMLInputElement).focus();
                  } else {
                    setTimePickerOpen(false);
                  }
                }}
                className="w-full bg-transparent outline-none"
                required
              />
            </div>
            {timePickerOpen && (
              <p className="text-xs text-muted-foreground">
                Select time and AM/PM, then click outside to close
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Extension</Label>
            <div className="relative">
              <Textarea
                id="reason"
                placeholder="Explain why you need an extension..."
                value={reason}
                onChange={handleReasonChange}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                rows={3}
                className="resize-none focus:ring-2 focus:ring-primary focus:border-primary w-full"
                disabled={false}
                autoFocus={false}
                tabIndex={0}
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedDate}>
            Request Extension
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}