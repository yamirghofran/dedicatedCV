"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
};

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  triggerClassName,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsed = value ? parseISO(value) : undefined;
  const display = parsed ? format(parsed, "PPP") : placeholder;

  return (
    <div className="space-y-1">
      {label && <Label className="text-xs">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground",
              triggerClassName,
            )}
            data-empty={!parsed}
          >
            <span className="inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {display}
            </span>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <Calendar
            mode="single"
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear() + 10}
            selected={parsed}
            onSelect={(date) => {
              if (date && onChange) {
                onChange(format(date, "yyyy-MM-dd"));
              }
              setOpen(false);
            }}
            className="rounded-md border min-w-[280px]"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
