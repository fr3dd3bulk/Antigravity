/**
 * DynamicNodeForm - The Most Critical Frontend Component
 * Renders form inputs dynamically based on ActionDefinition's inputSchema
 */

import { useState, useEffect } from 'react';

const DynamicNodeForm = ({ inputSchema, values = {}, onChange }) => {
  const [formValues, setFormValues] = useState(values);

  useEffect(() => {
    setFormValues(values);
  }, [values]);

  const handleInputChange = (key, value) => {
    const newValues = { ...formValues, [key]: value };
    setFormValues(newValues);
    if (onChange) {
      onChange(newValues);
    }
  };

  const renderInput = (field) => {
    const { key, type, label, placeholder, required, options, defaultValue } = field;
    const value = formValues[key] !== undefined ? formValues[key] : defaultValue || '';

    switch (type) {
      case 'text':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={placeholder}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              placeholder={placeholder}
              required={required}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        );

      case 'number':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(key, parseFloat(e.target.value) || 0)}
              placeholder={placeholder}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={key} className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => handleInputChange(key, e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              {label}
            </label>
          </div>
        );

      case 'select':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select {label}</option>
              {options && options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                handleInputChange(key, selectedOptions);
              }}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {options && options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  if (!inputSchema || inputSchema.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No configuration required for this action.
      </div>
    );
  }

  return (
    <div className="dynamic-node-form">
      {inputSchema.map(field => renderInput(field))}
    </div>
  );
};

export default DynamicNodeForm;
