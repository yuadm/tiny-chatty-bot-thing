import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from 'lucide-react';

interface EmploymentHistoryStepProps {
  data: any;
  onDataChange: (stepKey: string, data: any) => void;
}

export const EmploymentHistoryStep = ({ data, onDataChange }: EmploymentHistoryStepProps) => {
  const employmentHistory = data.employmentHistory || {};

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...employmentHistory, [field]: value };
    onDataChange('employmentHistory', updatedData);
  };

  const handleEmploymentChange = (index: number, field: string, value: any) => {
    const employments = employmentHistory.employments || [];
    const updatedEmployments = [...employments];
    updatedEmployments[index] = {
      ...updatedEmployments[index],
      [field]: value
    };
    handleChange('employments', updatedEmployments);
  };

  const addEmployment = () => {
    const employments = employmentHistory.employments || [];
    const newEmployment = {
      company: '',
      email: '',
      position: '',
      address: '',
      address2: '',
      town: '',
      postcode: '',
      telephone: '',
      fromDate: '',
      toDate: '',
      reasonForLeaving: '',
      keyTasks: ''
    };
    handleChange('employments', [...employments, newEmployment]);
  };

  const removeEmployment = (index: number) => {
    const employments = employmentHistory.employments || [];
    const updatedEmployments = employments.filter((_: any, i: number) => i !== index);
    handleChange('employments', updatedEmployments);
  };

  const employments = employmentHistory.employments || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employment History</CardTitle>
          <CardDescription>Your complete employment experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="previouslyEmployed">Were you previously employed? *</Label>
            <Select value={employmentHistory.previouslyEmployed || ''} onValueChange={(value) => handleChange('previouslyEmployed', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {employmentHistory.previouslyEmployed === 'yes' && (
            <div className="space-y-6">
              {employments.map((employment: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Employment {index + 1}</span>
                      {index > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEmployment(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                    {index === 0 && <CardDescription>Most Recent Employer</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`company-${index}`}>Company *</Label>
                        <Input
                          id={`company-${index}`}
                          value={employment.company || ''}
                          onChange={(e) => handleEmploymentChange(index, 'company', e.target.value)}
                          placeholder="Name of the employer"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`email-${index}`}>Email *</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={employment.email || ''}
                          onChange={(e) => handleEmploymentChange(index, 'email', e.target.value)}
                          placeholder="Employer's email"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`position-${index}`}>Position Held *</Label>
                        <Input
                          id={`position-${index}`}
                          value={employment.position || ''}
                          onChange={(e) => handleEmploymentChange(index, 'position', e.target.value)}
                          placeholder="Position of the person being used for the reference"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`address-${index}`}>Address *</Label>
                        <Input
                          id={`address-${index}`}
                          value={employment.address || ''}
                          onChange={(e) => handleEmploymentChange(index, 'address', e.target.value)}
                          placeholder="Company address"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`address2-${index}`}>Address 2</Label>
                        <Input
                          id={`address2-${index}`}
                          value={employment.address2 || ''}
                          onChange={(e) => handleEmploymentChange(index, 'address2', e.target.value)}
                          placeholder="Additional address info"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`town-${index}`}>Town *</Label>
                        <Input
                          id={`town-${index}`}
                          value={employment.town || ''}
                          onChange={(e) => handleEmploymentChange(index, 'town', e.target.value)}
                          placeholder="Town/City"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`postcode-${index}`}>Postcode *</Label>
                        <Input
                          id={`postcode-${index}`}
                          value={employment.postcode || ''}
                          onChange={(e) => handleEmploymentChange(index, 'postcode', e.target.value)}
                          placeholder="Postcode"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`telephone-${index}`}>Telephone Number *</Label>
                        <Input
                          id={`telephone-${index}`}
                          value={employment.telephone || ''}
                          onChange={(e) => handleEmploymentChange(index, 'telephone', e.target.value)}
                          placeholder="Contact number"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`fromDate-${index}`}>From Date *</Label>
                        <Input
                          id={`fromDate-${index}`}
                          type="date"
                          value={employment.fromDate || ''}
                          onChange={(e) => handleEmploymentChange(index, 'fromDate', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`toDate-${index}`}>To Date</Label>
                        <Input
                          id={`toDate-${index}`}
                          type="date"
                          value={employment.toDate || ''}
                          onChange={(e) => handleEmploymentChange(index, 'toDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`reasonForLeaving-${index}`}>Reason for leaving *</Label>
                      <Textarea
                        id={`reasonForLeaving-${index}`}
                        value={employment.reasonForLeaving || ''}
                        onChange={(e) => handleEmploymentChange(index, 'reasonForLeaving', e.target.value)}
                        placeholder="Explain why you left this position"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`keyTasks-${index}`}>Key Tasks/Responsibilities</Label>
                      <Textarea
                        id={`keyTasks-${index}`}
                        value={employment.keyTasks || ''}
                        onChange={(e) => handleEmploymentChange(index, 'keyTasks', e.target.value)}
                        placeholder="Describe your main responsibilities"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addEmployment}
                className="w-full flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Employment</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};