
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, parseISO, format } from "date-fns";

interface Employee {
  id: string;
  name: string;
  employee_code: string;
  branch?: string;
}

interface LeaveType {
  id: string;
  name: string;
  reduces_allowance: boolean;
}

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LeaveRequestDialog({ open, onOpenChange, onSuccess }: LeaveRequestDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchEmployeesAndLeaveTypes();
    }
  }, [open]);

  const fetchEmployeesAndLeaveTypes = async () => {
    try {
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, employee_code, branch')
        .order('name');

      if (employeesError) throw employeesError;

      // Fetch leave types
      const { data: leaveTypesData, error: leaveTypesError } = await supabase
        .from('leave_types')
        .select('id, name, reduces_allowance')
        .order('name');

      if (leaveTypesError) throw leaveTypesError;

      setEmployees(employeesData || []);
      setLeaveTypes(leaveTypesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Could not load employees and leave types",
        variant: "destructive",
      });
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.max(0, differenceInDays(endDate, startDate) + 1);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedLeaveType || !startDate || !endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const days = calculateDays();
      
      const { error } = await supabase
        .from('leaves')
        .insert({
          employee_id: selectedEmployee,
          leave_type_id: selectedLeaveType,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          days,
          notes: notes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });

      // Reset form
      setSelectedEmployee("");
      setSelectedLeaveType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setNotes("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast({
        title: "Error",
        description: "Could not submit leave request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.branch || 'No Branch'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-type">Leave Type *</Label>
            <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <DatePicker date={startDate} onDateChange={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <DatePicker date={endDate} onDateChange={setEndDate} />
            </div>
          </div>

          {startDate && endDate && (
            <div className="text-sm text-muted-foreground">
              Duration: {calculateDays()} day(s)
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about your leave request"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
