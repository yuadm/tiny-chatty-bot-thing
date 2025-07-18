
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Mail, Phone, MapPin, Calendar, Users, Building, Clock, User, Upload, Download, X, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  branch: string;
  employee_code: string;
  job_title?: string;
  employee_type?: string;
  working_hours?: number;
  leave_allowance?: number;
  leave_taken?: number;
  remaining_leave_days?: number;
  hours_restriction?: string;
  created_at?: string;
}

interface ImportEmployee {
  name: string;
  employee_code: string;
  branch: string;
  email?: string;
  phone?: string;
  job_title?: string;
  employee_type?: string;
  working_hours?: number;
  leave_allowance?: number;
  leave_taken?: number;
  remaining_leave_days?: number;
  days_taken?: number;
  days_remaining?: number;
  error?: string;
}

export function EmployeesContent() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [importData, setImportData] = useState<ImportEmployee[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    employee_code: "",
    job_title: "",
    employee_type: "regular",
    working_hours: 40,
    leave_allowance: 28,
    hours_restriction: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;

      // Fetch branches for the form
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');

      if (branchesError) throw branchesError;

      setEmployees(employeesData || []);
      setBranches(branchesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: "Could not fetch employee data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async () => {
    try {
      if (!newEmployee.name || !newEmployee.email || !newEmployee.branch || !newEmployee.employee_code) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('employees')
        .insert([{
          name: newEmployee.name,
          email: newEmployee.email,
          phone: newEmployee.phone || null,
          branch: newEmployee.branch,
          employee_code: newEmployee.employee_code,
          job_title: newEmployee.job_title || null,
          employee_type: newEmployee.employee_type,
          working_hours: newEmployee.working_hours,
          leave_allowance: newEmployee.leave_allowance,
          leave_taken: 0,
          remaining_leave_days: newEmployee.leave_allowance,
          hours_restriction: newEmployee.hours_restriction || null
        }]);

      if (error) throw error;

      toast({
        title: "Employee added",
        description: "The employee has been added successfully.",
      });

      setDialogOpen(false);
      setNewEmployee({
        name: "",
        email: "",
        phone: "",
        branch: "",
        employee_code: "",
        job_title: "",
        employee_type: "regular",
        working_hours: 40,
        leave_allowance: 28,
        hours_restriction: ""
      });
      fetchData();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error adding employee",
        description: "Could not add employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Import functionality
  const downloadTemplate = () => {
    const template = [
      {
        'Name': 'John Doe',
        'Employee Code': 'EMP001',
        'Branch': 'Main Office',
        
        'Phone': '+1234567890',
        'Job Title': 'Software Engineer',
        'Employee Type': 'regular',
        'Working Hours': 40,
        'Days Taken': 5,
        'Days Remaining': 23
      }
    ];

    const csvContent = Papa.unparse(template);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template downloaded",
      description: "Employee import template has been downloaded.",
    });
  };

  const processFileData = (data: any[]): ImportEmployee[] => {
    return data.map((row, index) => {
      const employee: ImportEmployee = {
        name: '',
        employee_code: '',
        branch: '',
        error: ''
      };

      // Map column names (case-insensitive)
      Object.keys(row).forEach(key => {
        const lowerKey = key.toLowerCase().replace(/\s+/g, '_');
        const value = row[key];

        if (lowerKey.includes('name')) {
          employee.name = value?.toString().trim() || '';
        } else if (lowerKey.includes('employee') && lowerKey.includes('code')) {
          employee.employee_code = value?.toString().trim() || '';
        } else if (lowerKey.includes('branch')) {
          employee.branch = value?.toString().trim() || '';
        } else if (lowerKey.includes('email')) {
          // Skip email processing during import
          // employee.email = value?.toString().trim() || '';
        } else if (lowerKey.includes('phone')) {
          employee.phone = value?.toString().trim() || '';
        } else if (lowerKey.includes('job') && lowerKey.includes('title')) {
          employee.job_title = value?.toString().trim() || '';
        } else if (lowerKey.includes('employee') && lowerKey.includes('type')) {
          employee.employee_type = value?.toString().trim() || 'regular';
        } else if (lowerKey.includes('working') && lowerKey.includes('hours')) {
          employee.working_hours = value ? parseInt(value) : undefined;
        } else if (lowerKey.includes('days') && lowerKey.includes('taken')) {
          employee.days_taken = parseInt(value) || 0;
        } else if (lowerKey.includes('days') && lowerKey.includes('remaining')) {
          employee.days_remaining = parseInt(value) || 28;
        }
      });

      // Validate required fields
      const errors = [];
      if (!employee.name) errors.push('Name is required');
      if (!employee.employee_code) errors.push('Employee Code is required');
      if (!employee.branch) errors.push('Branch is required');

      // Set defaults for leave days if not provided
      if (employee.days_taken === undefined && employee.days_remaining === undefined) {
        employee.leave_taken = 0;
        employee.remaining_leave_days = 28;
        employee.leave_allowance = 28;
      } else {
        employee.leave_taken = employee.days_taken || 0;
        employee.remaining_leave_days = employee.days_remaining || 28;
        employee.leave_allowance = (employee.leave_taken || 0) + (employee.remaining_leave_days || 28);
      }

      employee.error = errors.join(', ');
      return employee;
    });
  };

  const handleFileUpload = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processedData = processFileData(results.data);
          setImportData(processedData);
          setPreviewDialogOpen(true);
          setImportDialogOpen(false);
        },
        error: (error) => {
          toast({
            title: "Error parsing CSV",
            description: error.message,
            variant: "destructive",
          });
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          const processedData = processFileData(jsonData);
          setImportData(processedData);
          setPreviewDialogOpen(true);
          setImportDialogOpen(false);
        } catch (error) {
          toast({
            title: "Error parsing Excel file",
            description: "Failed to read the Excel file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({
        title: "Unsupported file format",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleImportEmployees = async () => {
    setImporting(true);
    
    try {
      const validEmployees = importData.filter(emp => !emp.error);
      
      if (validEmployees.length === 0) {
        toast({
          title: "No valid employees",
          description: "Please fix all errors before importing.",
          variant: "destructive",
        });
        return;
      }

      const employeesToInsert = validEmployees.map(emp => ({
        name: emp.name,
        email: null,
        phone: emp.phone || null,
        branch: emp.branch,
        employee_code: emp.employee_code,
        job_title: emp.job_title || null,
        employee_type: emp.employee_type || 'regular',
        working_hours: emp.working_hours || null,
        leave_allowance: emp.leave_allowance || 28,
        leave_taken: emp.leave_taken || 0,
        remaining_leave_days: emp.remaining_leave_days || 28,
      }));

      const { error } = await supabase
        .from('employees')
        .insert(employeesToInsert);

      if (error) throw error;

      toast({
        title: "Import successful",
        description: `Successfully imported ${validEmployees.length} employees.`,
      });

      setPreviewDialogOpen(false);
      setImportData([]);
      fetchData();
    } catch (error) {
      console.error('Error importing employees:', error);
      toast({
        title: "Import failed",
        description: "Failed to import employees. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const getEmployeeTypeColor = (type: string) => {
    switch (type) {
      case 'regular':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'part-time':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'contract':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'intern':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getHoursRestrictionBadge = (restriction: string | null | undefined) => {
    if (!restriction) return null;
    
    return (
      <Badge variant="outline" className="text-xs">
        <Clock className="w-3 h-3 mr-1" />
        {restriction}
      </Badge>
    );
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.job_title && employee.job_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesBranch = branchFilter === 'all' || employee.branch === branchFilter;
    
    return matchesSearch && matchesBranch;
  });

  // Calculate stats
  const totalEmployees = employees.length;
  const regularEmployees = employees.filter(emp => emp.employee_type === 'regular').length;
  const partTimeEmployees = employees.filter(emp => emp.employee_type === 'part-time').length;
  const contractEmployees = employees.filter(emp => emp.employee_type === 'contract').length;

  // Calculate leave stats
  const totalLeaveAllowance = employees.reduce((sum, emp) => sum + (emp.leave_allowance || 0), 0);
  const totalLeaveTaken = employees.reduce((sum, emp) => sum + (Number(emp.leave_taken) || 0), 0);
  const avgLeaveUsage = totalEmployees > 0 ? Math.round((totalLeaveTaken / totalLeaveAllowance) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Employee Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your team members and their information
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-input-border"
          />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {Array.from(new Set(employees.map(emp => emp.branch))).map(branch => (
              <SelectItem key={branch} value={branch}>{branch}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up">
        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regular Staff</p>
                <p className="text-2xl font-bold">{regularEmployees}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Part-time</p>
                <p className="text-2xl font-bold">{partTimeEmployees}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contract</p>
                <p className="text-2xl font-bold">{contractEmployees}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Building className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card className="card-premium animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Directory ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No employees found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || branchFilter !== 'all' 
                  ? "Try adjusting your search or filter criteria." 
                  : "Get started by adding an employee."
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee Code</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Working Hours</TableHead>
                    <TableHead>Leave Balance</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {employee.email}
                          </div>
                          {employee.hours_restriction && getHoursRestrictionBadge(employee.hours_restriction)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {employee.employee_code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.job_title || 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEmployeeTypeColor(employee.employee_type || 'regular')}>
                          {employee.employee_type || 'regular'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Building className="w-3 h-3" />
                          {employee.branch}
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="text-sm">
                           {employee.working_hours ? `${employee.working_hours}h/week` : 'N/A'}
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {(employee.remaining_leave_days || 0)} / {(employee.leave_allowance || 0)} days
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Used: {String(employee.leave_taken || 0)} days
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{employee.email}</span>
                          </div>
                          {employee.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_code">Employee Code *</Label>
                <Input
                  id="employee_code"
                  value={newEmployee.employee_code}
                  onChange={(e) => setNewEmployee({...newEmployee, employee_code: e.target.value})}
                  placeholder="e.g., EMP001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={newEmployee.branch}
                  onValueChange={(value) => setNewEmployee({...newEmployee, branch: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch: any) => (
                      <SelectItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={newEmployee.job_title}
                  onChange={(e) => setNewEmployee({...newEmployee, job_title: e.target.value})}
                  placeholder="Enter job title"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_type">Employee Type</Label>
                <Select
                  value={newEmployee.employee_type}
                  onValueChange={(value) => setNewEmployee({...newEmployee, employee_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="working_hours">Working Hours/Week</Label>
                <Input
                  id="working_hours"
                  type="number"
                  value={newEmployee.working_hours}
                  onChange={(e) => setNewEmployee({...newEmployee, working_hours: parseInt(e.target.value) || 40})}
                  placeholder="40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leave_allowance">Annual Leave Allowance (days)</Label>
                <Input
                  id="leave_allowance"
                  type="number"
                  value={newEmployee.leave_allowance}
                  onChange={(e) => setNewEmployee({...newEmployee, leave_allowance: parseInt(e.target.value) || 28})}
                  placeholder="28"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours_restriction">Hours Restriction</Label>
                <Input
                  id="hours_restriction"
                  value={newEmployee.hours_restriction}
                  onChange={(e) => setNewEmployee({...newEmployee, hours_restriction: e.target.value})}
                  placeholder="e.g., 20 hours max"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addEmployee} className="bg-gradient-primary hover:opacity-90">
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Employees</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to import multiple employees at once.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Download */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm font-medium">Download Template</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Required Fields Info */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required columns:</strong> Name, Employee Code, Branch<br/>
                <strong>Optional:</strong> Phone, Job Title, Employee Type, Working Hours, Days Taken, Days Remaining
              </AlertDescription>
            </Alert>

            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {dragActive ? 'Drop your file here' : 'Drop your file here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports CSV and Excel files (.csv, .xlsx, .xls)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Import Preview</DialogTitle>
            <DialogDescription>
              Review the data before importing. Rows with errors will be skipped.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {importData.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {importData.filter(emp => !emp.error).length} valid / {importData.length} total employees
                </div>
                {importData.some(emp => emp.error) && (
                  <Badge variant="destructive">
                    {importData.filter(emp => emp.error).length} errors found
                  </Badge>
                )}
              </div>
            )}

            <div className="border rounded-lg max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee Code</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Leave Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.map((employee, index) => (
                    <TableRow key={index} className={employee.error ? 'bg-destructive/10' : 'bg-success/10'}>
                      <TableCell>
                        {employee.error ? (
                          <div className="flex items-center gap-1 text-destructive">
                            <X className="w-4 h-4" />
                            <span className="text-xs">Error</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <span className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </span>
                            <span className="text-xs">Valid</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{employee.name || 'Missing'}</div>
                          {employee.error && (
                            <div className="text-xs text-destructive">{employee.error}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {employee.employee_code || 'Missing'}
                      </TableCell>
                      <TableCell>{employee.branch || 'Missing'}</TableCell>
                      <TableCell className="text-sm">
                        {employee.email || 'Not provided'}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <div>
                            {employee.remaining_leave_days || 28} / {employee.leave_allowance || 28}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Used: {employee.leave_taken || 0}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImportEmployees}
              disabled={importing || importData.filter(emp => !emp.error).length === 0}
              className="bg-gradient-primary hover:opacity-90"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                `Import ${importData.filter(emp => !emp.error).length} Employees`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
