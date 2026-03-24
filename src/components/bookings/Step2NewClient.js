import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

const Step2NewClient = ({ formData, onChange, onBack, onCreate, creating }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      clientName: formData.clientName || '',
      clientLastname: formData.clientLastname || '',
      clientPhone: formData.clientPhone || '',
      clientEmail: formData.clientEmail || '',
      clientGender: formData.clientGender || 'female'
    }
  });

  const watchedValues = watch();
  const isFirstRender = useRef(true);

  // ✅ Sync from parent to form (only when parent data changes externally)
  useEffect(() => {
    if (formData.clientName !== undefined && !isFirstRender.current) {
      setValue('clientName', formData.clientName);
      setValue('clientLastname', formData.clientLastname);
      setValue('clientPhone', formData.clientPhone);
      setValue('clientEmail', formData.clientEmail);
      setValue('clientGender', formData.clientGender);
    }
    isFirstRender.current = false;
  }, [formData, setValue]);

  // ✅ Sync from form to parent (only on user input, not on every change)
  const handleFieldChange = (name, value) => {
    onChange({ target: { name, value } });
  };

  // Submit handler
  const onSubmit = () => {
    onCreate();
  };

  return (
    <div className="form-step step-2">
      <div className="step-header">
        <h3>Create New Client</h3>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          <div className="form-group">
            <label>
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              {...register('clientName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'Name must be less than 50 characters'
                },
                onChange: (e) => handleFieldChange('clientName', e.target.value)
              })}
              placeholder="Enter full name"
              className={`form-input ${errors.clientName ? 'error' : ''}`}
            />
            {errors.clientName && (
              <span className="error-message">{errors.clientName.message}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              {...register('clientLastname', {
                onChange: (e) => handleFieldChange('clientLastname', e.target.value)
              })}
              placeholder="Enter last name (optional)"
              className="form-input"
            />
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label>
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              {...register('clientPhone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[\+]?[0-9]{1,4}[\s-]?[0-9]{3,4}[\s-]?[0-9]{3,4}$/,
                  message: 'Enter valid phone number (e.g., +65 12345678)'
                },
                onChange: (e) => handleFieldChange('clientPhone', e.target.value)
              })}
              placeholder="+65 1234 5678"
              className={`form-input ${errors.clientPhone ? 'error' : ''}`}
            />
            {errors.clientPhone && (
              <span className="error-message">{errors.clientPhone.message}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('clientEmail', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter valid email address'
                },
                onChange: (e) => handleFieldChange('clientEmail', e.target.value)
              })}
              placeholder="client@example.com"
              className={`form-input ${errors.clientEmail ? 'error' : ''}`}
            />
            {errors.clientEmail && (
              <span className="error-message">{errors.clientEmail.message}</span>
            )}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label>Gender</label>
            <div className="gender-options">
              <label className="gender-option">
                <input
                  type="radio"
                  value="female"
                  {...register('clientGender', {
                    onChange: (e) => handleFieldChange('clientGender', e.target.value)
                  })}
                />
                <span>Female</span>
              </label>
              <label className="gender-option">
                <input
                  type="radio"
                  value="male"
                  {...register('clientGender', {
                    onChange: (e) => handleFieldChange('clientGender', e.target.value)
                  })}
                />
                <span> Male</span>
              </label>
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="validation-summary">
              <span>⚠️ Please fix the errors above</span>
            </div>
          )}
        </form>
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          className="btn-secondary" 
          onClick={onBack}
          disabled={creating}
        >
          ← Back
        </button>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleSubmit(onSubmit)}
          disabled={creating}
        >
          {creating ? (
            <>
              <span className="spinner"></span>
              Creating...
            </>
          ) : (
            <>✨ Create Client & Continue</>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step2NewClient;