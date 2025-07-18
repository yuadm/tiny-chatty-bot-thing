
import { useState } from "react";
import { Plus, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeaveRequestDialog } from "./LeaveRequestDialog";
import { LeaveTable } from "./LeaveTable";
import { LeaveStats } from "./LeaveStats";
import { LeaveDialogs } from "./LeaveDialogs";
import { useLeaveData } from "./hooks/useLeaveData";
import { useLeaveActions } from "./hooks/useLeaveActions";
import { Leave } from "./types";

export function LeavesContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Dialog states
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Sorting states
  const [sortField, setSortField] = useState<'employee_name' | 'leave_type' | 'start_date' | 'days' | 'status' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { 
    leaves, 
    loading, 
    branches,
    leaveTypes,
    employees,
    refetchData 
  } = useLeaveData();

  const {
    updateLeaveStatus,
    updateLeave,
    deleteLeave
  } = useLeaveActions({ leaves, employees, leaveTypes, refetchData });

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.leave_type_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || leave.employee_branch_id === branchFilter;
    const matchesLeaveType = leaveTypeFilter === 'all' || leave.leave_type_id === leaveTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBranch && matchesLeaveType;
  });

  // Sort leaves
  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'employee_name') {
      aValue = a.employee?.name || '';
      bValue = b.employee?.name || '';
    } else if (sortField === 'leave_type') {
      aValue = a.leave_type?.name || '';
      bValue = b.leave_type?.name || '';
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setViewDialogOpen(true);
  };

  const handleEditLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setEditDialogOpen(true);
  };

  const handleDeleteLeave = (leave: Leave) => {
    setSelectedLeave(leave);
    setDeleteDialogOpen(true);
  };

  const handleUpdateStatus = async (leaveId: string, status: 'approved' | 'rejected', managerNotes?: string) => {
    await updateLeaveStatus(leaveId, status, managerNotes);
    refetchData();
  };

  const handleUpdateLeave = async (data: {
    employee_id: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days: number;
    notes: string;
    manager_notes: string;
  }) => {
    if (selectedLeave) {
      await updateLeave(selectedLeave.id, data);
      setEditDialogOpen(false);
      refetchData();
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedLeave) {
      await deleteLeave(selectedLeave.id);
      setDeleteDialogOpen(false);
      refetchData();
    }
  };

  const handleStatusFilter = (status: 'all' | 'pending' | 'approved' | 'rejected') => {
    setStatusFilter(status);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-muted rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Leave Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage employee leave requests and time off
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Leave
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leaves..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-input-border"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {leaveTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <LeaveStats leaves={leaves} onStatusFilter={handleStatusFilter} />

      {/* Leave Table */}
      <LeaveTable 
        leaves={sortedLeaves}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onViewLeave={handleViewLeave}
        onEditLeave={handleEditLeave}
        onDeleteLeave={handleDeleteLeave}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Leave Request Dialog */}
      <LeaveRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={refetchData}
      />

      {/* Leave Dialogs */}
      <LeaveDialogs
        selectedLeave={selectedLeave}
        employees={employees}
        leaveTypes={leaveTypes}
        viewDialogOpen={viewDialogOpen}
        editDialogOpen={editDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        onViewDialogClose={() => setViewDialogOpen(false)}
        onEditDialogClose={() => setEditDialogOpen(false)}
        onDeleteDialogClose={() => setDeleteDialogOpen(false)}
        onUpdateLeave={handleUpdateLeave}
        onDeleteLeave={handleDeleteConfirm}
      />
    </div>
  );
}
