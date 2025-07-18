import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SkillsExperienceStepProps {
  data: any;
  onDataChange: (stepKey: string, data: any) => void;
}

export const SkillsExperienceStep = ({ data, onDataChange }: SkillsExperienceStepProps) => {
  const skillsExperience = data.skillsExperience || {};

  const handleSkillChange = (skill: string, level: string) => {
    const updatedData = { ...skillsExperience, [skill]: level };
    onDataChange('skillsExperience', updatedData);
  };

  const skills = [
    'ADHD',
    'Administration of medicine',
    'Alzheimers',
    'Assisting with immobility',
    'Autism',
    'Cancer care',
    'Catheter care',
    'Cerebral Palsy',
    'Challenging behaviour',
    'Dementia care',
    'Diabetes',
    'Down syndrome',
    'Frail elderly',
    'Hoists',
    'Incontinence',
    'Learning disabilities',
    'Lewy-Body dementia',
    'Mental health',
    'Multiple sclerosis',
    'Parkinson\'s disease',
    'Special need children',
    'Stroke care',
    'Terminally ill',
    'Tube feeding'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Skills & Experience</CardTitle>
          <CardDescription>Please indicate if you have skills and experience in the following areas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <div key={skill} className="space-y-2">
                <Label htmlFor={skill}>{skill}</Label>
                <Select 
                  value={skillsExperience[skill] || ''} 
                  onValueChange={(value) => handleSkillChange(skill, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};