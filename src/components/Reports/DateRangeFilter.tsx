
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subDays, subWeeks } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  currentRange: { startDate: Date; endDate: Date };
  onRangeChange: (range: { startDate: Date; endDate: Date }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ currentRange, onRangeChange }) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: currentRange.startDate,
    to: currentRange.endDate
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const predefinedRanges = [
    { 
      label: 'Today', 
      getValue: () => ({ 
        startDate: new Date(), 
        endDate: new Date() 
      }) 
    },
    { 
      label: 'Yesterday', 
      getValue: () => ({ 
        startDate: subDays(new Date(), 1), 
        endDate: subDays(new Date(), 1) 
      }) 
    },
    { 
      label: 'This Week', 
      getValue: () => ({ 
        startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), 
        endDate: endOfWeek(new Date(), { weekStartsOn: 1 }) 
      }) 
    },
    { 
      label: 'Last Week', 
      getValue: () => ({ 
        startDate: startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 
        endDate: endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }) 
      }) 
    },
    { 
      label: 'This Month', 
      getValue: () => ({ 
        startDate: startOfMonth(new Date()), 
        endDate: endOfMonth(new Date()) 
      }) 
    },
    { 
      label: 'Last Month', 
      getValue: () => ({ 
        startDate: startOfMonth(subMonths(new Date(), 1)), 
        endDate: endOfMonth(subMonths(new Date(), 1)) 
      }) 
    },
    { 
      label: 'Last 3 Months', 
      getValue: () => ({ 
        startDate: subMonths(new Date(), 3), 
        endDate: new Date() 
      }) 
    },
    { 
      label: 'This Year', 
      getValue: () => ({ 
        startDate: new Date(new Date().getFullYear(), 0, 1), 
        endDate: new Date(new Date().getFullYear(), 11, 31) 
      }) 
    },
  ];

  const handleRangeSelect = (range: { startDate: Date; endDate: Date }) => {
    onRangeChange(range);
    setDate({
      from: range.startDate,
      to: range.endDate
    });
    // Close the popover after selection
    setIsCalendarOpen(false);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      setDate(range);
      if (range.to) {
        setIsCalendarOpen(false);
        onRangeChange({ 
          startDate: range.from, 
          endDate: range.to 
        });
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "MMM d, yyyy")} - {format(date.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(date.from, "MMM d, yyyy")
                )
              ) : (
                "Select dates"
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <span>Range</span>
            <ChevronDown size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          <div className="grid gap-1">
            {predefinedRanges.map((range) => (
              <Button
                key={range.label}
                variant="ghost"
                className="justify-start font-normal"
                onClick={() => handleRangeSelect(range.getValue())}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeFilter;
