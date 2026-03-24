import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

const Step3Service = ({
  formData,
  onChange,
  onServiceRequest,
  onBack,
  onContinue,
  therapists,
  rooms,
  servicesData,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm({
    defaultValues: {
      serviceId: formData.serviceId || '',
      duration: formData.duration || '60',
      pax: formData.pax || '1',
      therapistId: formData.therapistId || '',
      roomId: formData.roomId || '',
      date: formData.date || new Date().toISOString().split('T')[0],
      startTime: formData.startTime || '09:00',
      source: formData.source || 'Walk-in',
      notes: formData.notes || '',
      voucherCode: formData.voucherCode || ''
    }
  });

  const watchedValues = watch();

  // Sync form values to parent
  useEffect(() => {
    const timeout = setTimeout(() => {
      Object.keys(watchedValues).forEach(key => {
        if (watchedValues[key] !== formData[key]) {
          onChange({ target: { name: key, value: watchedValues[key] } });
        }
      });
    }, 100);
    return () => clearTimeout(timeout);
  }, [watchedValues, onChange, formData]);

  // Validation rules
  const validationRules = {
    serviceId: {
      required: 'Please select a service'
    },
    date: {
      required: 'Please select a date',
      validate: (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          return 'Cannot select past date';
        }
        return true;
      }
    },
    startTime: {
      required: 'Please select start time'
    },
    duration: {
      required: 'Duration is required',
      min: {
        value: 15,
        message: 'Duration must be at least 15 minutes'
      }
    },
    pax: {
      required: 'Number of pax is required',
      min: {
        value: 1,
        message: 'Number of pax must be at least 1'
      },
      max: {
        value: 10,
        message: 'Number of pax cannot exceed 10'
      }
    },
    source: {
      required: 'Please select source'
    },
    therapistId: {
      required: 'Please select a therapist'
    },
    roomId: {
      required: 'Please select a room'
    }
  };

  // Handle continue with validation
  const handleContinueClick = async () => {
    const isValid = await trigger();
    if (isValid) {
      onContinue();
    }
  };
  

  return (
    <div className="form-step step-3">
      {/* Header */}
      <div className="step-header">
        <h3>Select Service & Therapist</h3>
      </div>

      {/* Selected Client Info */}
      <div className="selected-client-card">
        <div className="client-avatar">
          <div className="avatar-initial">{formData.clientName?.charAt(0) || '👤'}</div>
        </div>
        <div className="client-info-wrapper">
          <div className="client-name">{formData.clientName}</div>
        </div>
        <button type="button" className="change-client-btn" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Change
        </button>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <form>
          {/* Service Selection */}
          <div className="form-group">
            <label>
              <span className="label-icon">💆</span>
              Service <span className="required">*</span>
            </label>
            <select
              {...register('serviceId', validationRules.serviceId)}
              className={`form-select ${errors.serviceId ? 'error' : ''}`}
            >
              <option value="">Select a service</option>
              {servicesData?.list?.category?.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration} min) - ${s.price}
                </option>
              ))}
            </select>
            {errors.serviceId && (
              <span className="error-message">{errors.serviceId.message}</span>
            )}
          </div>

          {/* Duration & Pax Row */}
          <div className="form-row">
            <div className="form-group">
              <label>⏱ Duration <span className="required">*</span></label>
              <select
                {...register('duration', validationRules.duration)}
                className={`form-select ${errors.duration ? 'error' : ''}`}
              >
                <option value="30">30 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </select>
              {errors.duration && (
                <span className="error-message">{errors.duration.message}</span>
              )}
            </div>
            <div className="form-group">
              <label>Number of Pax <span className="required">*</span></label>
              <select
                {...register('pax', validationRules.pax)}
                className={`form-select ${errors.pax ? 'error' : ''}`}
              >
                <option value="1">1 pax</option>
                <option value="2">2 pax</option>
                <option value="3">3 pax</option>
                <option value="4">4 pax</option>
              </select>
              {errors.pax && (
                <span className="error-message">{errors.pax.message}</span>
              )}
            </div>
          </div>

          {/* Therapist & Room Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Therapist <span className="required">*</span></label>
              <select
                {...register('therapistId', { required: 'Please select a therapist' })}
                className={`form-select ${errors.therapistId ? 'error' : ''}`}
              >
                <option value="">Select Therapist</option>
                {therapists?.map(t => (
                  <option key={t.therapist_id} value={t.therapist_id}>
                    {t.alias}
                  </option>
                ))}
              </select>
              {errors.therapistId && (
                <span className="error-message">{errors.therapistId.message}</span>
              )}
              <div className="form-group">
                <label>Room <span className="required">*</span></label>
                <select
                  {...register('roomParentId', { required: 'Please select a room' })}
                  className={`form-select ${errors.roomParentId ? 'error' : ''}`}
                  onChange={(e) => {
                    const selectedRoom = rooms?.find(r => r.room_id == e.target.value);
                    const firstItem = selectedRoom?.items?.[0];

                    setValue('roomParentId', e.target.value);              
                    setValue('roomId', String(firstItem?.item_id || ''));     
                    setValue('roomName', firstItem?.item_name || selectedRoom?.room_name || '');
                  }}
                >
                  <option value="">Select Room</option>
                  {rooms?.map(r => (
                    <option key={r.room_id} value={r.room_id}>
                      {r.room_name}
                    </option>
                  ))}
                </select>
                {errors.roomParentId && <span className="error-text">{errors.roomParentId.message}</span>}
                {errors.roomId && (
                  <span className="error-message">{errors.roomId.message}</span>
                )}
              </div></div></div>

          {/* Date & Time Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Date <span className="required">*</span></label>
              <input
                type="date"
                {...register('date', validationRules.date)}
                min={new Date().toISOString().split('T')[0]}
                className={`form-input ${errors.date ? 'error' : ''}`}
              />
              {errors.date && (
                <span className="error-message">{errors.date.message}</span>
              )}
            </div>
            <div className="form-group">
              <label>Start Time <span className="required">*</span></label>
              <input
                type="time"
                {...register('startTime', validationRules.startTime)}
                step="900"
                className={`form-input ${errors.startTime ? 'error' : ''}`}
              />
              {errors.startTime && (
                <span className="error-message">{errors.startTime.message}</span>
              )}
            </div>
          </div>

          {/* Service Requests */}
          <div className="form-group">
            <label>Service Requests</label>
            <div className="request-buttons">
              {['Soft', 'China', 'Thai', 'Swedish', 'Deep Tissue'].map(req => (
                <button
                  key={req}
                  type="button"
                  className={`request-btn ${formData.serviceRequests?.includes(req) ? 'active' : ''}`}
                  onClick={() => onServiceRequest(req)}
                >
                  {req}
                </button>
              ))}
            </div>
          </div>

          {/* Voucher Code */}
          <div className="form-group">
            <label>Voucher Code</label>
            <input
              type="text"
              {...register('voucherCode')}
              placeholder="Enter voucher code"
              className="form-input"
            />
          </div>

          {/* Source */}
          <div className="form-group">
            <label>Source <span className="required">*</span></label>
            <select
              {...register('source', validationRules.source)}
              className={`form-select ${errors.source ? 'error' : ''}`}
            >
              <option value="Walk-in">Walk-in</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="By Phone">By Phone</option>
            </select>
            {errors.source && (
              <span className="error-message">{errors.source.message}</span>
            )}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Notes</label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Any special requests or notes..."
              className="form-textarea"
            />
          </div>


          {/* Validation Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="validation-summary">
              <div className="validation-icon">⚠️</div>
              <div className="validation-message">
                Please fix the following errors:
                <ul>
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Action Buttons */}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleContinueClick}
        >
          Review Booking
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Step3Service;