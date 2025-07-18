
import { useState, useEffect, ReactNode } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddComplianceRecordModalProps {
  employeeId?: string;
  employeeName?: string;
  complianceTypeId: string;
  complianceTypeName: string;
  frequency: string;
  periodIdentifier?: string;
  onRecordAdded: () => void;
  trigger?: ReactNode;
}

export function AddComplianceRecordModal({
  employeeId,
  employeeName,
  complianceTypeId,
  complianceTypeName,
  frequency,
  periodIdentifier,
  onRecordAdded,
  trigger
}: AddComplianceRecordModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completionDate, setCompletionDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [recordType, setRecordType] = useState<'date' | 'new'>('date');
  const [newText, setNewText] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId || '');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState(employeeName || '');
  const [selectedPeriod, setSelectedPeriod] = useState(periodIdentifier || getCurrentPeriodIdentifier(frequency));
  const [employees, setEmployees] = useState<Array<{id: string, name: string}>>([]);
  const { toast } = useToast();

  // Fetch employees if not provided
  useEffect(() => {
    if (!employeeId) {
      fetchEmployees();
    }
  }, [employeeId]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  function getCurrentPeriodIdentifier(freq: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.ceil(month / 3);

    switch (freq?.toLowerCase()) {
      case 'annual':
        return year.toString();
      case 'monthly':
        return `${year}-${month.toString().padStart(2, '0')}`;
      case 'quarterly':
        return `${year}-Q${quarter}`;
      case 'bi-annual':
        return `${year}-H${month <= 6 ? '1' : '2'}`;
      default:
        return year.toString();
    }
  }

  // Calculate valid date range based on period and frequency
  const getValidDateRange = () => {
    const now = new Date();
    const period = selectedPeriod;
    
    // Add null check for frequency and period
    if (!frequency || !period) {
      console.warn('Frequency or period is undefined, using default year range');
      const currentYear = now.getFullYear();
      return {
        minDate: new Date(currentYear, 0, 1),
        maxDate: now
      };
    }
    
    let minDate: Date;
    let maxDate: Date;
    
    try {
      if (frequency.toLowerCase() === 'annual') {
        // For annual: entire year is selectable
        const year = parseInt(period);
        if (isNaN(year)) throw new Error('Invalid year');
        minDate = new Date(year, 0, 1); // January 1st
        maxDate = new Date(year, 11, 31); // December 31st
      } else if (frequency.toLowerCase() === 'monthly') {
        // For monthly: only that specific month
        const [year, month] = period.split('-');
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        if (isNaN(yearNum) || isNaN(monthNum)) throw new Error('Invalid date components');
        const monthIndex = monthNum - 1; // Month is 0-indexed
        minDate = new Date(yearNum, monthIndex, 1);
        maxDate = new Date(yearNum, monthIndex + 1, 0); // Last day of month
      } else if (frequency.toLowerCase() === 'quarterly') {
        // For quarterly: only that specific quarter
        const [year, quarterStr] = period.split('-Q');
        const yearNum = parseInt(year);
        const quarter = parseInt(quarterStr);
        if (isNaN(yearNum) || isNaN(quarter)) throw new Error('Invalid date components');
        const startMonth = (quarter - 1) * 3;
        const endMonth = startMonth + 2;
        minDate = new Date(yearNum, startMonth, 1);
        maxDate = new Date(yearNum, endMonth + 1, 0); // Last day of quarter
      } else if (frequency.toLowerCase() === 'bi-annual') {
        // For bi-annual: the specific half year
        const [year, halfStr] = period.split('-H');
        const yearNum = parseInt(year);
        const half = parseInt(halfStr);
        if (isNaN(yearNum) || isNaN(half)) throw new Error('Invalid date components');
        const startMonth = half === 1 ? 0 : 6;
        const endMonth = half === 1 ? 5 : 11;
        minDate = new Date(yearNum, startMonth, 1);
        maxDate = new Date(yearNum, endMonth + 1, 0); // Last day of half
      } else {
        // Default fallback
        const year = parseInt(period) || now.getFullYear();
        minDate = new Date(year, 0, 1);
        maxDate = new Date(year, 11, 31);
      }
      
      // Validate the dates
      if (!isValid(minDate) || !isValid(maxDate)) {
        throw new Error('Invalid calculated dates');
      }
      
      return { minDate, maxDate };
    } catch (error) {
      console.error('Error calculating date range:', error);
      // Fallback to current year
      const currentYear = now.getFullYear();
      return {
        minDate: new Date(currentYear, 0, 1),
        maxDate: now
      };
    }
  };

  const { minDate, maxDate } = getValidDateRange();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!selectedEmployeeId || !selectedPeriod) {
      toast({
        title: "Missing information",
        description: "Please select an employee and period.",
        variant: "destructive",
      });
      return;
    }
    
    if (recordType === 'date') {
      // Validate date is within the allowed range
      if (!isValid(completionDate) || completionDate < minDate || completionDate > maxDate) {
        const minDateStr = isValid(minDate) ? format(minDate, 'dd/MM/yyyy') : 'Invalid';
        const maxDateStr = isValid(maxDate) ? format(maxDate, 'dd/MM/yyyy') : 'Invalid';
        toast({
          title: "Invalid date",
          description: `Please select a valid date between ${minDateStr} and ${maxDateStr} for this ${frequency?.toLowerCase() || 'compliance'} period.`,
          variant: "destructive",
        });
        return;
      }
    } else {
      // For "new" type, validate that text is entered
      if (!newText.trim()) {
        toast({
          title: "Text required",
          description: "Please enter text for the new record type.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const recordData = {
        employee_id: selectedEmployeeId,
        compliance_type_id: complianceTypeId,
        period_identifier: selectedPeriod,
        // For "new" records, store the text directly in completion_date
        completion_date: recordType === 'date' 
          ? format(completionDate, 'yyyy-MM-dd') 
          : newText, // Store text directly in completion_date
        notes: notes.trim() || null,
        status: recordType === 'new' ? 'compliant' : 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('compliance_period_records')
        .insert(recordData);

      if (error) throw error;

      toast({
        title: "Record added successfully",
        description: `Compliance record for ${selectedEmployeeName || 'employee'} has been added.`,
      });

      setIsOpen(false);
      setCompletionDate(new Date());
      setNotes('');
      setRecordType('date');
      setNewText('');
      onRecordAdded();
    } catch (error) {
      console.error('Error adding compliance record:', error);
      toast({
        title: "Error adding record",
        description: "Could not add compliance record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      Add Compliance Record
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Compliance Record</DialogTitle>
          <DialogDescription>
            Add a new compliance record for {complianceTypeName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!employeeId && (
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={(value) => {
                setSelectedEmployeeId(value);
                const employee = employees.find(emp => emp.id === value);
                setSelectedEmployeeName(employee?.name || '');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {employeeId && (
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Input
                id="employee"
                value={selectedEmployeeName}
                disabled
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              placeholder="Enter period identifier"
            />
          </div>

          <div className="space-y-2">
            <Label>Record Type</Label>
            <Select value={recordType} onValueChange={(value: 'date' | 'new') => setRecordType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="new">New (before employee joined)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recordType === 'date' ? (
            <div className="space-y-2">
              <Label>Completion Date</Label>
              {isValid(minDate) && isValid(maxDate) && (
                <p className="text-sm text-muted-foreground mb-2">
                  Valid range for {frequency?.toLowerCase() || 'compliance'} period: {format(minDate, 'dd/MM/yyyy')} - {format(maxDate, 'dd/MM/yyyy')}
                </p>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !completionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {completionDate && isValid(completionDate) ? format(completionDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={completionDate}
                    onSelect={(date) => date && setCompletionDate(date)}
                    disabled={(date) => !isValid(minDate) || !isValid(maxDate) || date < minDate || date > maxDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="newText">Text</Label>
              <Input
                id="newText"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Enter text (e.g., 'new', 'N/A', etc.)"
              />
              <p className="text-sm text-muted-foreground">
                This text will be stored as the completion date.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
