import React from 'react';
import '../styles/form.css';

export const FormGroup = ({ children, className = '' }) => {
  return (
    <div className={`form-group ${className}`}>
      {children}
    </div>
  );
};

export const FormLabel = ({ children, htmlFor, required = false, className = '' }) => {
  const labelClasses = [
    'form-label',
    required && 'required',
    className
  ].filter(Boolean).join(' ');

  return (
    <label htmlFor={htmlFor} className={labelClasses}>
      {children}
    </label>
  );
};

export const FormInput = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'form-input',
    error && 'error',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <input
        id={id}
        type={type}
        className={inputClasses}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </>
  );
};

export const FormSelect = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  className = '',
  ...props
}) => {
  const selectClasses = [
    'form-select',
    error && 'error',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <select
        id={id}
        className={selectClasses}
        value={value}
        onChange={onChange}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </>
  );
};

export const FormTextarea = ({
  id,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  className = '',
  ...props
}) => {
  const textareaClasses = [
    'form-textarea',
    error && 'error',
    className
  ].filter(Boolean).join(' ');

  return (
    <>
      <textarea
        id={id}
        className={textareaClasses}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </>
  );
};

export const FormCheckbox = ({
  id,
  label,
  checked,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <label className={`form-checkbox ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
};

export const FormHelp = ({ children, className = '' }) => {
  return (
    <span className={`form-help ${className}`}>
      {children}
    </span>
  );
};
