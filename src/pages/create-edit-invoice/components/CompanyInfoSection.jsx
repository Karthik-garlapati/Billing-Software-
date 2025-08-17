import React from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const CompanyInfoSection = ({ 
  companyInfo, 
  onCompanyInfoChange, 
  isEditable = true 
}) => {
  const handleChange = (field, value) => {
    onCompanyInfoChange({
      ...companyInfo,
      [field]: value
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Building2" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Company Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          type="text"
          placeholder="Enter company name"
          value={companyInfo?.name}
          onChange={(e) => handleChange('name', e?.target?.value)}
          disabled={!isEditable}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="company@example.com"
          value={companyInfo?.email}
          onChange={(e) => handleChange('email', e?.target?.value)}
          disabled={!isEditable}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={companyInfo?.phone}
          onChange={(e) => handleChange('phone', e?.target?.value)}
          disabled={!isEditable}
        />

        <Input
          label="Website"
          type="url"
          placeholder="https://www.company.com"
          value={companyInfo?.website}
          onChange={(e) => handleChange('website', e?.target?.value)}
          disabled={!isEditable}
        />

        <div className="md:col-span-2">
          <Input
            label="Address"
            type="text"
            placeholder="123 Business Street, City, State 12345"
            value={companyInfo?.address}
            onChange={(e) => handleChange('address', e?.target?.value)}
            disabled={!isEditable}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoSection;