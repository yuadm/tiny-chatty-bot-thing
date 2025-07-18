import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PersonalInformationStep } from './steps/PersonalInformationStep';
import { AvailabilityStep } from './steps/AvailabilityStep';
import { EmploymentHistoryStep } from './steps/EmploymentHistoryStep';
import { SkillsExperienceStep } from './steps/SkillsExperienceStep';
import { DeclarationsStep } from './steps/DeclarationsStep';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
}

interface ApplicationData {
  personalInfo: any;
  availability: any;
  employmentHistory: any;
  skillsExperience: any;
  declarations: any;
  positionId: string;
}

export const JobApplicationPortal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    personalInfo: {},
    availability: {},
    employmentHistory: {},
    skillsExperience: {},
    declarations: {},
    positionId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const steps = [
    { title: 'Personal Information', component: PersonalInformationStep },
    { title: 'Availability', component: AvailabilityStep },
    { title: 'Employment History', component: EmploymentHistoryStep },
    { title: 'Skills & Experience', component: SkillsExperienceStep },
    { title: 'Declarations', component: DeclarationsStep }
  ];

  useEffect(() => {
    fetchJobPositions();
  }, []);

  const fetchJobPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setJobPositions(data || []);
    } catch (error) {
      console.error('Error fetching job positions:', error);
      toast({
        title: "Error",
        description: "Failed to load job positions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepDataChange = (stepKey: keyof ApplicationData, data: any) => {
    setApplicationData(prev => ({
      ...prev,
      [stepKey]: data
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([{
          position_id: applicationData.positionId,
          personal_info: applicationData.personalInfo,
          availability: applicationData.availability,
          employment_history: applicationData.employmentHistory,
          skills_experience: applicationData.skillsExperience,
          declarations: applicationData.declarations,
          status: 'new'
        }]);

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully. We will contact you soon.",
      });

      // Reset form
      setApplicationData({
        personalInfo: {},
        availability: {},
        employmentHistory: {},
        skillsExperience: {},
        declarations: {},
        positionId: ''
      });
      setCurrentStep(0);

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Job Application Portal</h1>
          <p className="text-lg text-muted-foreground">Join our team and make a difference in people's lives</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</span>
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentStep 
                        ? 'bg-primary' 
                        : index < currentStep 
                        ? 'bg-primary/60' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <CurrentStepComponent
              data={applicationData}
              onDataChange={handleStepDataChange}
              jobPositions={jobPositions}
            />

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                >
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};