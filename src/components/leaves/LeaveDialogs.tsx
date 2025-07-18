
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Leave, Employee, LeaveType } from "./types";

interface LeaveDialogsProps {
  selectedLeave: Leave | null;
  employees: Employee[];
  leaveTypes: LeaveType[];
  viewDialogOpen: boolean;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  onViewDialogClose: () => void;
  onEditDialogClose: () => void;
  onDeleteDialogClose: () => void;
  onUpdateLeave: (data: {
    employee_id: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days: number;
    notes: string;
    manager_notes: string;
  }) => void;
  onDeleteLeave: () => void;
}

export function LeaveDialogs({
  selectedLeave,
  employees,
  leaveTypes,
  viewDialogOpen,
  editDialogOpen,
  deleteDialogOpen,
  onViewDialogClose,
  onEditDialogClose,
  onDeleteDialogClose,
  onUpdateLeave,
  onDeleteLeave
}: LeaveDialogsProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [editData, setEditData] = useState({
    employee_id: "",
    leave_type_id: "",
    notes: "",
    manager_notes: ""
  });

  // Pre-populate form when edit dialog opens with selected leave data
  useEffect(() => {
    if (editDialogOpen && selectedLeave) {
      setEditData({
        employee_id: selectedLeave.employee_id,
        leave_type_id: selectedLeave.leave_type_id,
        notes: selectedLeave.notes || "",
        manager_notes: selectedLeave.manager_notes || ""
      });
      setStartDate(new Date(selectedLeave.start_date));
      setEndDate(new Date(selectedLeave.end_date));
    }
  }, [editDialogOpen, selectedLeave]);

  const calculateDays = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateLeave = () => {
    if (!startDate || !endDate) return;

    const days = calculateDays(startDate, endDate);
    
    onUpdateLeave({
      ...editData,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      days
    });
  };

  return (
    <>
      {/* View Leave Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={onViewDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employee</Label>
                  <p className="font-medium">{selectedLeave.employee?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Leave Type</Label>
                  <p className="font-medium">{selectedLeave.leave_type?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="font-medium">{format(new Date(selectedLeave.start_date), 'PPP')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="font-medium">{format(new Date(selectedLeave.end_date), 'PPP')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Days</Label>
                  <p className="font-medium">{selectedLeave.days} days</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedLeave.status)}>
                    {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                  </Badge>
                </div>
              </div>
              {selectedLeave.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm">{selectedLeave.notes}</p>
                </div>
              )}
              {selectedLeave.manager_notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Manager Notes</Label>
                  <p className="mt-1 text-sm">{selectedLeave.manager_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Leave Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={onEditDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
            <DialogDescription>
              Update the leave request details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select
                  value={editData.employee_id}
                  onValueChange={(value) => setEditData({...editData, employee_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.employee_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leave_type">Leave Type</Label>
                <Select
                  value={editData.leave_type_id}
                  onValueChange={(value) => setEditData({...editData, leave_type_id: value})}
                >
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editData.notes}
                onChange={(e) => setEditData({...editData, notes: e.target.value})}
                placeholder="Additional notes about the leave request..."
              />
            </div>

            {startDate && endDate && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Total days: <span className="font-medium">{calculateDays(startDate, endDate)}</span>
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onEditDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLeave} className="bg-gradient-primary hover:opacity-90">
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Leave Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={onDeleteDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leave request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onDeleteDialogClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteLeave}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
