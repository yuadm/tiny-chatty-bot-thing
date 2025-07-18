import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ConsentStepProps {
  data: any;
  onDataChange: (stepKey: string, data: any) => void;
}

export const ConsentStep = ({ data, onDataChange }: ConsentStepProps) => {
  const consent = data.consent || {};

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...consent, [field]: value };
    onDataChange('consent', updatedData);
  };

  // Auto-fill today's date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consent & Signature</CardTitle>
          <CardDescription>Final declaration and consent to process your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              By submitting this application, I declare that all information provided is true and accurate to the best of my knowledge. 
              I understand that providing false information may lead to my application being rejected or, if discovered after employment, 
              may result in dismissal.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="declarationConsent"
              checked={consent.declarationConsent || false}
              onCheckedChange={(checked) => handleChange('declarationConsent', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="declarationConsent" className="text-sm font-medium cursor-pointer">
                Declaration of Accuracy *
              </Label>
              <p className="text-sm text-muted-foreground">
                I declare that the information given in this application is true and complete. I agree that any 
                false information may lead to the refusal of my application or cancellation of employment if employed.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="processingConsent"
              checked={consent.processingConsent || false}
              onCheckedChange={(checked) => handleChange('processingConsent', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="processingConsent" className="text-sm font-medium cursor-pointer">
                Data Processing Consent *
              </Label>
              <p className="text-sm text-muted-foreground">
                I consent to the processing of my personal data for the purposes of recruitment and employment. 
                I understand my data will be processed in accordance with applicable data protection laws.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="signature">Full Name (Digital Signature) *</Label>
              <Input
                id="signature"
                value={consent.signature || ''}
                onChange={(e) => handleChange('signature', e.target.value)}
                placeholder="Type your full name as digital signature"
              />
            </div>

            <div>
              <Label htmlFor="signatureDate">Date *</Label>
              <Input
                id="signatureDate"
                type="date"
                value={consent.signatureDate || today}
                onChange={(e) => handleChange('signatureDate', e.target.value)}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After submission, you will receive a confirmation email with your application reference number. 
              We will contact you within 5-7 business days regarding the status of your application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};