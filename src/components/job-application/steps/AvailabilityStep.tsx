import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AvailabilityStepProps {
  data: any;
  onDataChange: (stepKey: string, data: any) => void;
}

export const AvailabilityStep = ({ data, onDataChange }: AvailabilityStepProps) => {
  const availability = data.availability || {};

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...availability, [field]: value };
    onDataChange('availability', updatedData);
  };

  const handleShiftChange = (shiftType: string, checked: boolean) => {
    const shifts = availability.shifts || [];
    const updatedShifts = checked 
      ? [...shifts, shiftType]
      : shifts.filter((shift: string) => shift !== shiftType);
    
    handleChange('shifts', updatedShifts);
  };

  const shiftOptions = [
    { id: 'early-morning', label: 'Early Mornings', time: '7:00 am - 10:00 am' },
    { id: 'late-morning', label: 'Late Mornings', time: '10:00 am - 12:00 pm' },
    { id: 'early-afternoon', label: 'Early Afternoons', time: '12:00 pm - 3:00 pm' },
    { id: 'late-afternoon', label: 'Late Afternoons', time: '3:00 pm - 6:00 pm' },
    { id: 'evening', label: 'Evenings', time: '6:00 pm - 10:00 pm' },
    { id: 'waking-nights', label: 'Waking Nights', time: '8:00 pm - 8:00 am' },
    { id: 'sleeping-nights', label: 'Sleeping Nights', time: '8:00 pm - 8:00 am' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Please specify what days and time you are available to work (you may choose more than one shift pattern).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-4 block">Available Shifts</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shiftOptions.map((shift) => (
                <div key={shift.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={shift.id}
                    checked={(availability.shifts || []).includes(shift.id)}
                    onCheckedChange={(checked) => handleShiftChange(shift.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={shift.id} className="font-medium cursor-pointer">
                      {shift.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{shift.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hoursPerWeek">How many hours per week are you willing to work? *</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                value={availability.hoursPerWeek || ''}
                onChange={(e) => handleChange('hoursPerWeek', e.target.value)}
                placeholder="40"
                min="1"
                max="48"
              />
            </div>

            <div>
              <Label htmlFor="rightToWork">Do you have current right to live and work in the UK? *</Label>
              <Select value={availability.rightToWork || ''} onValueChange={(value) => handleChange('rightToWork', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyName">Full Name *</Label>
              <Input
                id="emergencyName"
                value={availability.emergencyName || ''}
                onChange={(e) => handleChange('emergencyName', e.target.value)}
                placeholder="Enter emergency contact name"
              />
            </div>

            <div>
              <Label htmlFor="emergencyRelationship">Relationship *</Label>
              <Input
                id="emergencyRelationship"
                value={availability.emergencyRelationship || ''}
                onChange={(e) => handleChange('emergencyRelationship', e.target.value)}
                placeholder="e.g., Spouse, Parent, Friend"
              />
            </div>

            <div>
              <Label htmlFor="emergencyPhone">Contact number *</Label>
              <Input
                id="emergencyPhone"
                value={availability.emergencyPhone || ''}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                placeholder="Enter emergency contact number"
              />
            </div>

            <div>
              <Label htmlFor="howHeard">How did you hear about us? *</Label>
              <Select value={availability.howHeard || ''} onValueChange={(value) => handleChange('howHeard', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online-job-board">Online Job Board</SelectItem>
                  <SelectItem value="company-website">Company Website</SelectItem>
                  <SelectItem value="referral">Referral from Employee</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="recruitment-agency">Recruitment Agency</SelectItem>
                  <SelectItem value="newspaper">Newspaper</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};