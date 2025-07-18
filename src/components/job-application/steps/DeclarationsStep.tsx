import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DeclarationsStepProps {
  data: any;
  onDataChange: (stepKey: string, data: any) => void;
}

export const DeclarationsStep = ({ data, onDataChange }: DeclarationsStepProps) => {
  const declarations = data.declarations || {};

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...declarations, [field]: value };
    onDataChange('declarations', updatedData);
  };

  const declarationQuestions = [
    {
      id: 'socialServiceEnquiry',
      question: 'Has any Social Service Department or Police Service ever conducted an enquiry or investigation into any allegations or concerns that you may pose an actual or potential risk to children or vulnerable adults?'
    },
    {
      id: 'criminalConvictions',
      question: 'Have you ever been convicted of any offence relating to children or vulnerable adults?'
    },
    {
      id: 'safeguardingInvestigation',
      question: 'Have you ever been subject to any safeguarding investigation, criminal investigation or any investigations by previous employer?'
    },
    {
      id: 'criminalConvictionsGeneral',
      question: 'Do you have any criminal convictions spent or unspent?'
    },
    {
      id: 'healthConditions',
      question: 'Do you have any physical or mental health conditions which may hinder your ability to carry on or work for the purpose of care activities?'
    },
    {
      id: 'cautionsReprimands',
      question: 'Have you received cautions, reprimands or final warnings which are spent or unspent?'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Applicant Declaration</CardTitle>
          <CardDescription>Protection of Children, Vulnerable Adults and criminal convictions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              United Kingdom legislation and guidance relating to the welfare of children and vulnerable adults has at its core, 
              the principle that the welfare of vulnerable persons must be the paramount consideration. Our care Agency fully 
              supports this principle and therefore, we require that everyone who may come into contact with children and 
              vulnerable persons or have access to their personal details, complete and sign this declaration.
            </p>
          </div>

          <div className="space-y-6">
            <p className="font-medium">If you answered "Yes" to any of the below questions please state details.</p>
            
            {declarationQuestions.map((question) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-sm font-medium">{question.question} *</Label>
                <div className="flex items-center space-x-4">
                  <Select 
                    value={declarations[question.id] || ''} 
                    onValueChange={(value) => handleChange(question.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {declarations[question.id] === 'yes' && (
                    <Textarea
                      placeholder="Please provide details..."
                      value={declarations[`${question.id}Details`] || ''}
                      onChange={(e) => handleChange(`${question.id}Details`, e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataProcessingConsent"
                checked={declarations.dataProcessingConsent || false}
                onCheckedChange={(checked) => handleChange('dataProcessingConsent', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="dataProcessingConsent" className="text-sm font-medium cursor-pointer">
                  I declare that to the best of my knowledge the above information, and that submitted in any accompanying documents, is correct, and: *
                </Label>
                <p className="text-sm text-muted-foreground">
                  I give permission for any enquiries that need to be made to confirm such matters as qualifications, 
                  experience and dates of employment and for the release by other people or organisations of such 
                  information as may be necessary for that purpose.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="personalDataConsent"
                checked={declarations.personalDataConsent || false}
                onCheckedChange={(checked) => handleChange('personalDataConsent', checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="personalDataConsent" className="text-sm font-medium cursor-pointer">
                  Personal Data Processing Consent *
                </Label>
                <p className="text-sm text-muted-foreground">
                  I confirm that the above information given by me is correct and that I consent to my personal data 
                  being processed and kept for the purpose described above in accordance with the Data Protection Act 1998.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Terms & Policy</CardTitle>
          <CardDescription>Consent to the terms of the Data Protection.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              We process the information you provide on this form as necessary to aid the Recruitment Process to 
              progress your application for employment and, if your application is successful, to administer your 
              personnel record. Please read our Data Protection & Privacy Statement that sets out the terms of use 
              of the site. This contains details of our data collection policies and use of personal data.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAcceptance"
              checked={declarations.termsAcceptance || false}
              onCheckedChange={(checked) => handleChange('termsAcceptance', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="termsAcceptance" className="text-sm font-medium cursor-pointer">
                Terms & Policy Agreement *
              </Label>
              <p className="text-sm text-muted-foreground">
                I declare that, to the best of my knowledge, all parts of this form have been completed and are 
                accurate and apply for the position conditionally upon this declaration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};