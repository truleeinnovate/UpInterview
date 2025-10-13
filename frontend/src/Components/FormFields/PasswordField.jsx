import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({
  value,
  onChange,
  error,
  label = 'Password',
  required = false,
  disabled = false,
  placeholder = 'Enter your password',
  name = 'password',
  onBlur
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`mt-1 block w-full rounded-md shadow-sm py-2 px-3 pr-10 sm:text-sm
          border ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:outline-red-300'
              : disabled
              ? 'border-gray-200 bg-gray-100'
              : 'border-gray-300 focus:ring-red-300'
          }
          focus:outline-gray-300
          ${disabled ? 'cursor-not-allowed' : ''}`}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs pt-1">{error}</p>}
    </div>
  );
};

export default PasswordField;
