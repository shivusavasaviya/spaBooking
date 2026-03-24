import React from 'react';

const Step4Confirm = ({ 
  formData, 
  setStep,
  onBack, 
  onSubmit, 
  loading,
  calculateSubTotal,
  calculateGST,
  calculateGrandTotal
}) => {
  return (
    <div className="form-step step-4">
      <div className="step-header">
        <div className="step-icon">✅</div>
        <h3>Confirm Booking</h3>
        <p className="step-subtitle">Please review all details before confirming</p>
      </div>

      <div className="booking-summary">
        <div className="summary-section client-section">
          <div className="section-header">
            <span className="section-icon">👤</span>
            <h4>Client Details</h4>
          </div>
          <div className="section-content">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{formData.clientName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{formData.clientPhone}</span>
            </div>
            {formData.clientEmail && (
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{formData.clientEmail}</span>
              </div>
            )}
          </div>
        </div>

        <div className="summary-section service-section">
          <div className="section-header">
            <span className="section-icon">💆</span>
            <h4>Service Details</h4>
          </div>
          <div className="section-content">
            <div className="info-row">
              <span className="info-label">Service:</span>
              <span className="info-value">{formData.service}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Duration:</span>
              <span className="info-value">{formData.duration} min</span>
            </div>
            <div className="info-row">
              <span className="info-label">Pax:</span>
              <span className="info-value">{formData.pax}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Therapist:</span>
              <span className="info-value">{formData.therapistName || 'Auto-assign'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Room:</span>
              <span className="info-value">{formData.roomName || 'Auto-assign'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">{formData.date}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Time:</span>
              <span className="info-value">{formData.startTime}</span>
            </div>
            {formData.serviceRequests.length > 0 && (
              <div className="info-row">
                <span className="info-label">Requests:</span>
                <span className="info-value">{formData.serviceRequests.join(', ')}</span>
              </div>
            )}
            {formData.voucherCode && (
              <div className="info-row">
                <span className="info-label">Voucher:</span>
                <span className="info-value">{formData.voucherCode}</span>
              </div>
            )}
          </div>
        </div>

        <div className="summary-section payment-section">
          <div className="section-header">
            <span className="section-icon">💰</span>
            <h4>Payment Summary</h4>
          </div>
          <div className="section-content">
            <div className="price-details">
              <div className="price-line">
                <span>Sub Total:</span>
                <span>${calculateSubTotal().toFixed(2)}</span>
              </div>
              <div className="price-line">
                <span>GST (9%):</span>
                <span>${calculateGST().toFixed(2)}</span>
              </div>
              <div className="price-line grand-total">
                <span>Grand Total:</span>
                <span>${calculateGrandTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="payment-method">
              <span className="info-label">Payment Type:</span>
              <span className="info-value">{formData.paymentType === 'payatstore' ? 'Pay at Store' : 'Online'}</span>
            </div>
          </div>
        </div>

        {formData.notes && (
          <div className="summary-section notes-section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h4>Notes</h4>
            </div>
            <div className="section-content">
              <p>{formData.notes}</p>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onBack}>
          ← Edit
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating Booking...
            </>
          ) : (
            <>
              ✅ Confirm & Create Booking
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step4Confirm;