
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ComplianceType {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  created_at: string;
  updated_at: string;
}

const FREQUENCY_OPTIONS = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "bi-annual", label: "Bi-Annual" },
  { value: "weekly", label: "Weekly" },
];

// Enhanced notification system
const notifyCompliancePageUpdate = () => {
  const timestamp = Date.now().toString();
  
  // Set a flag in localStorage for cross-tab communication
  localStorage.setItem('compliance-types-updated', timestamp);
  
  // Dispatch a custom event for same-tab communication
  const event = new CustomEvent('compliance-types-updated', {
    detail: { timestamp }
  });
  window.dispatchEvent(event);
  
  // Also trigger a storage event manually for same-tab updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'compliance-types-updated',
    newValue: timestamp,
    storageArea: localStorage
  }));
  
  console.log('Notified compliance page of update at:', timestamp);
};

export function ComplianceTypeManagement() {
  const [complianceTypes, setComplianceTypes] = useState<ComplianceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComplianceType, setEditingComplianceType] = useState<ComplianceType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complianceTypeToDelete, setComplianceTypeToDelete] = useState<ComplianceType | null>(null);
  const [newComplianceType, setNewComplianceType] = useState({
    name: "",
    description: "",
    frequency: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchComplianceTypes();
  }, []);

  const fetchComplianceTypes = async () => {
    try {
      console.log('Fetching compliance types in management...');
      const { data, error } = await supabase
        .from('compliance_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching compliance types:', error);
        toast({
          title: "Error",
          description: `Failed to fetch compliance types: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Compliance types fetched in management:', data);
      setComplianceTypes(data || []);
    } catch (error) {
      console.error('Error fetching compliance types:', error);
      toast({
        title: "Error",
        description: "Failed to fetch compliance types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplianceType = async () => {
    if (!newComplianceType.name.trim() || !newComplianceType.frequency) return;

    try {
      console.log('Adding compliance type:', newComplianceType);
      const { data, error } = await supabase
        .from('compliance_types')
        .insert([{
          name: newComplianceType.name,
          description: newComplianceType.description || null,
          frequency: newComplianceType.frequency
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding compliance type:', error);
        toast({
          title: "Error",
          description: `Failed to add compliance type: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Compliance type added successfully:', data);
      setComplianceTypes([...complianceTypes, data]);
      setNewComplianceType({ name: "", description: "", frequency: "" });
      setIsAddDialogOpen(false);
      
      // Notify compliance page of the change
      notifyCompliancePageUpdate();
      
      toast({
        title: "Success",
        description: "Compliance type added successfully",
      });
    } catch (error) {
      console.error('Error adding compliance type:', error);
      toast({
        title: "Error",
        description: "Failed to add compliance type",
        variant: "destructive",
      });
    }
  };

  const handleEditComplianceType = async () => {
    if (!editingComplianceType || !editingComplianceType.name.trim() || !editingComplianceType.frequency) return;

    try {
      console.log('Updating compliance type:', editingComplianceType);
      const { error } = await supabase
        .from('compliance_types')
        .update({
          name: editingComplianceType.name,
          description: editingComplianceType.description || null,
          frequency: editingComplianceType.frequency
        })
        .eq('id', editingComplianceType.id);

      if (error) {
        console.error('Error updating compliance type:', error);
        toast({
          title: "Error",
          description: `Failed to update compliance type: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Compliance type updated successfully');
      setComplianceTypes(complianceTypes.map(type => 
        type.id === editingComplianceType.id ? editingComplianceType : type
      ));
      setEditingComplianceType(null);
      setIsEditDialogOpen(false);
      
      // Notify compliance page of the change
      notifyCompliancePageUpdate();
      
      toast({
        title: "Success",
        description: "Compliance type updated successfully",
      });
    } catch (error) {
      console.error('Error updating compliance type:', error);
      toast({
        title: "Error",
        description: "Failed to update compliance type",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (complianceType: ComplianceType) => {
    setComplianceTypeToDelete(complianceType);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complianceTypeToDelete) return;

    try {
      console.log('Deleting compliance type:', complianceTypeToDelete);
      const { error } = await supabase
        .from('compliance_types')
        .delete()
        .eq('id', complianceTypeToDelete.id);

      if (error) {
        console.error('Error deleting compliance type:', error);
        toast({
          title: "Error",
          description: `Failed to delete compliance type: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Compliance type deleted successfully');
      setComplianceTypes(complianceTypes.filter(type => type.id !== complianceTypeToDelete.id));
      
      // Notify compliance page of the change
      notifyCompliancePageUpdate();
      
      toast({
        title: "Success",
        description: "Compliance type deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting compliance type:', error);
      toast({
        title: "Error",
        description: "Failed to delete compliance type",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setComplianceTypeToDelete(null);
    }
  };

  if (loading) {
    return <div>Loading compliance types...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Compliance Types</h4>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-primary hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Add Compliance Type
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceTypes.length > 0 ? (
            complianceTypes.map((complianceType) => (
              <div key={complianceType.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">{complianceType.name}</h5>
                </div>
                {complianceType.description && (
                  <p className="text-sm text-muted-foreground">{complianceType.description}</p>
                )}
                <div className="text-sm">
                  <span className="font-medium">Frequency:</span> {
                    FREQUENCY_OPTIONS.find(opt => opt.value === complianceType.frequency)?.label || complianceType.frequency
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditingComplianceType(complianceType);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteClick(complianceType)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No compliance types found. Add your first compliance type to get started.
            </div>
          )}
        </div>
      </div>

      {/* Add Compliance Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Compliance Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="compliance-type-name">Compliance Type Name</Label>
              <Input
                id="compliance-type-name"
                value={newComplianceType.name}
                onChange={(e) => setNewComplianceType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter compliance type name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compliance-type-description">Description (Optional)</Label>
              <Textarea
                id="compliance-type-description"
                value={newComplianceType.description}
                onChange={(e) => setNewComplianceType(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compliance-type-frequency">Frequency</Label>
              <Select 
                value={newComplianceType.frequency} 
                onValueChange={(value) => setNewComplianceType(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddComplianceType} 
                disabled={!newComplianceType.name.trim() || !newComplianceType.frequency}
              >
                Add Compliance Type
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Compliance Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Compliance Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-compliance-type-name">Compliance Type Name</Label>
              <Input
                id="edit-compliance-type-name"
                value={editingComplianceType?.name || ""}
                onChange={(e) => setEditingComplianceType(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Enter compliance type name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-compliance-type-description">Description (Optional)</Label>
              <Textarea
                id="edit-compliance-type-description"
                value={editingComplianceType?.description || ""}
                onChange={(e) => setEditingComplianceType(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-compliance-type-frequency">Frequency</Label>
              <Select 
                value={editingComplianceType?.frequency || ""} 
                onValueChange={(value) => setEditingComplianceType(prev => prev ? { ...prev, frequency: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditComplianceType} 
                disabled={!editingComplianceType?.name.trim() || !editingComplianceType?.frequency}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Compliance Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the compliance type "{complianceTypeToDelete?.name}"? 
              This action cannot be undone and may affect existing compliance records using this type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Compliance Type
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
