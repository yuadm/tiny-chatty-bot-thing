
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Leave, Employee, LeaveType } from "../types";

interface Branch {
  id: string;
  name: string;
}

export function useLeaveData() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch leaves with employee and leave type data
      const { data: leavesData, error: leavesError } = await supabase
        .from('leaves')
        .select(`
          *,
          employees!inner(id, name, email, employee_code, remaining_leave_days, leave_taken, branch, branch_id),
          leave_types!inner(id, name, reduces_balance)
        `)
        .order('created_at', { ascending: false });

      if (leavesError) throw leavesError;

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, email, employee_code, remaining_leave_days, leave_taken, branch, branch_id')
        .order('name');

      if (employeesError) throw employeesError;

      // Fetch leave types
      const { data: leaveTypesData, error: leaveTypesError } = await supabase
        .from('leave_types')
        .select('*')
        .order('name');

      if (leaveTypesError) throw leaveTypesError;

      // Fetch branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');

      if (branchesError) throw branchesError;

      console.log('Leave data fetched:', {
        leavesCount: leavesData?.length || 0,
        employeesCount: employeesData?.length || 0,
        leaveTypesCount: leaveTypesData?.length || 0,
        branchesCount: branchesData?.length || 0,
        sampleLeave: leavesData?.[0]
      });

      // Transform the data to match our interface
      const transformedLeaves = leavesData?.map(leave => ({
        ...leave,
        employee: leave.employees,
        leave_type: leave.leave_types,
        employee_name: leave.employees?.name || '',
        leave_type_name: leave.leave_types?.name || '',
        employee_branch_id: leave.employees?.branch_id || ''
      })) || [];

      setLeaves(transformedLeaves);
      setEmployees(employeesData || []);
      setLeaveTypes(leaveTypesData || []);
      setBranches(branchesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: "Could not fetch leave data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    leaves,
    employees,
    leaveTypes,
    branches,
    loading,
    refetchData: fetchData
  };
}
