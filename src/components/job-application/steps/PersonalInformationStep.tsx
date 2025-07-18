import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalInformationStepProps {
  data: any;
  onDataChange: (stepKey: string, data: any) => void;
  jobPositions: any[];
}

export const PersonalInformationStep = ({ data, onDataChange, jobPositions }: PersonalInformationStepProps) => {
  const personalInfo = data.personalInfo || {};

  const handleChange = (field: string, value: any) => {
    const updatedData = { ...personalInfo, [field]: value };
    onDataChange('personalInfo', updatedData);
  };

  const handlePositionChange = (positionId: string) => {
    onDataChange('positionId', positionId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Fill your personal information and continue to the next step.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Select value={personalInfo.title || ''} onValueChange={(value) => handleChange('title', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mr">Mr</SelectItem>
                  <SelectItem value="mrs">Mrs</SelectItem>
                  <SelectItem value="ms">Ms</SelectItem>
                  <SelectItem value="miss">Miss</SelectItem>
                  <SelectItem value="dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={personalInfo.firstName || ''}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={personalInfo.lastName || ''}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="confirmEmail">Confirm Email *</Label>
              <Input
                id="confirmEmail"
                type="email"
                value={personalInfo.confirmEmail || ''}
                onChange={(e) => handleChange('confirmEmail', e.target.value)}
                placeholder="Confirm your email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telephone/Mobile *</Label>
              <Input
                id="phone"
                value={personalInfo.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={personalInfo.dateOfBirth || ''}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input
                id="streetAddress"
                value={personalInfo.streetAddress || ''}
                onChange={(e) => handleChange('streetAddress', e.target.value)}
                placeholder="Enter your street address"
              />
            </div>

            <div>
              <Label htmlFor="streetAddress2">Street Address Second Line</Label>
              <Input
                id="streetAddress2"
                value={personalInfo.streetAddress2 || ''}
                onChange={(e) => handleChange('streetAddress2', e.target.value)}
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div>
              <Label htmlFor="town">Town *</Label>
              <Input
                id="town"
                value={personalInfo.town || ''}
                onChange={(e) => handleChange('town', e.target.value)}
                placeholder="Enter your town"
              />
            </div>

            <div>
              <Label htmlFor="borough">Borough *</Label>
              <Select value={personalInfo.borough || ''} onValueChange={(value) => handleChange('borough', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Borough" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="barking-dagenham">Barking and Dagenham</SelectItem>
                  <SelectItem value="barnet">Barnet</SelectItem>
                  <SelectItem value="bexley">Bexley</SelectItem>
                  <SelectItem value="brent">Brent</SelectItem>
                  <SelectItem value="bromley">Bromley</SelectItem>
                  <SelectItem value="camden">Camden</SelectItem>
                  <SelectItem value="croydon">Croydon</SelectItem>
                  <SelectItem value="ealing">Ealing</SelectItem>
                  <SelectItem value="enfield">Enfield</SelectItem>
                  <SelectItem value="greenwich">Greenwich</SelectItem>
                  <SelectItem value="hackney">Hackney</SelectItem>
                  <SelectItem value="hammersmith-fulham">Hammersmith and Fulham</SelectItem>
                  <SelectItem value="haringey">Haringey</SelectItem>
                  <SelectItem value="harrow">Harrow</SelectItem>
                  <SelectItem value="havering">Havering</SelectItem>
                  <SelectItem value="hillingdon">Hillingdon</SelectItem>
                  <SelectItem value="hounslow">Hounslow</SelectItem>
                  <SelectItem value="islington">Islington</SelectItem>
                  <SelectItem value="kensington-chelsea">Kensington and Chelsea</SelectItem>
                  <SelectItem value="kingston">Kingston upon Thames</SelectItem>
                  <SelectItem value="lambeth">Lambeth</SelectItem>
                  <SelectItem value="lewisham">Lewisham</SelectItem>
                  <SelectItem value="merton">Merton</SelectItem>
                  <SelectItem value="newham">Newham</SelectItem>
                  <SelectItem value="redbridge">Redbridge</SelectItem>
                  <SelectItem value="richmond">Richmond upon Thames</SelectItem>
                  <SelectItem value="southwark">Southwark</SelectItem>
                  <SelectItem value="sutton">Sutton</SelectItem>
                  <SelectItem value="tower-hamlets">Tower Hamlets</SelectItem>
                  <SelectItem value="waltham-forest">Waltham Forest</SelectItem>
                  <SelectItem value="wandsworth">Wandsworth</SelectItem>
                  <SelectItem value="westminster">Westminster</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                value={personalInfo.postcode || ''}
                onChange={(e) => handleChange('postcode', e.target.value)}
                placeholder="Enter your postcode"
              />
            </div>

            <div>
              <Label htmlFor="password">Create Password *</Label>
              <Input
                id="password"
                type="password"
                value={personalInfo.password || ''}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Create a password"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={personalInfo.confirmPassword || ''}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            <div>
              <Label htmlFor="englishProficiency">Proficiency in English (if not first language) *</Label>
              <Select value={personalInfo.englishProficiency || ''} onValueChange={(value) => handleChange('englishProficiency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="native">Native Speaker</SelectItem>
                  <SelectItem value="fluent">Fluent</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="otherLanguages">Which other languages do you speak? *</Label>
              <Input
                id="otherLanguages"
                value={personalInfo.otherLanguages || ''}
                onChange={(e) => handleChange('otherLanguages', e.target.value)}
                placeholder="List languages you speak"
              />
            </div>

            <div>
              <Label htmlFor="positionApplied">Position applied for *</Label>
              <Select value={data.positionId || ''} onValueChange={handlePositionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {jobPositions.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.title} - {position.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hasDBS">Do you have a recent or updated DBS? *</Label>
              <Select value={personalInfo.hasDBS || ''} onValueChange={(value) => handleChange('hasDBS', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="applied">Applied for</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hasCarLicense">Do you currently have your own car and licence? *</Label>
              <Select value={personalInfo.hasCarLicense || ''} onValueChange={(value) => handleChange('hasCarLicense', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="niNumber">National Insurance Number *</Label>
              <Input
                id="niNumber"
                value={personalInfo.niNumber || ''}
                onChange={(e) => handleChange('niNumber', e.target.value)}
                placeholder="Enter your NI number"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};