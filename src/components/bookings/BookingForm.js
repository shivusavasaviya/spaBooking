import React, { useState, useEffect } from 'react';
import useBooking from '../../store/booking';
import { logger } from '../../services/logger';
import { toast } from '../../services/toastService';
import Step1Client from './Step1Client';
import Step2NewClient from './Step2NewClient';
import Step3Service from './Step3Service';
import Step4Confirm from './Step4Confirm';
import './BookingForm.css';

const BookingForm = ({ mode, booking, onSuccess, onCancel }) => {
  const findRoomIdByItemId = (rooms, itemId) => {
    if (!rooms || !itemId) return '';
    const room = rooms.find(r => r.items?.some(item => item.item_id == itemId));
    return room?.room_id || '';
  };
  const {
    createBooking,
    updateBooking,
    therapists,
    rooms,
    servicesData,
    createCustomer,
    fetchAllDropdownData,
    loading: storeLoading
  } = useBooking();

  const getInitialData = (booking) => {
    if (!booking) {
      return {
        clientId: null,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        clientLastname: '',
        clientGender: 'female',
        therapistId: '',
        therapistName: '',
        serviceId: '',
        service: '',
        roomId: '',
        roomName: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        duration: 60,
        pax: 1,
        serviceRequests: [],
        source: 'walkin',
        paymentType: 'payatstore',
        notes: '',
        requestedTherapist: false,
        voucherCode: ''
      };
    }
    const actualRoomId = findRoomIdByItemId(rooms, booking.room_id);

    return {
      clientId: booking.user.id || '',
      clientName: booking.customer_name || '',
      clientPhone: booking.customer_contact || '',
      clientEmail: booking.customer?.email || '',
      clientLastname: booking.customer?.lastname || '',

      therapistId: booking.therapist_id || '',
      therapistName: booking.therapistName || '',

      serviceId: booking.service_id || '',
      service: booking.service || '',
      duration: booking.duration || 60,

      roomId: actualRoomId || '',
      roomName: booking.room_name || '',

      date: booking.service_at?.split(' ')[0] || '',
      startTime: booking.service_at?.split(' ')[1]?.slice(0, 5) || '',

      pax: booking.quantity || 1,
      serviceRequests: booking.service_request
        ? booking.service_request.split(',')
        : [],
      source: booking.source || 'walkin',
      paymentType: booking.payment_type || 'payatstore',
      notes: booking.note || '',
      requestedTherapist: booking.requested || false,
      voucherCode: booking.voucher_code || ''
    };
  };
  const [formData, setFormData] = useState(() => getInitialData(booking));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(mode === "edit" ? 3 : 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    fetchAllDropdownData();
  }, []);


  // ✅ Select existing customer
  const handleSelectCustomer = (customer) => {
    setFormData(prev => ({
      ...prev,
      clientId: customer.id,
      clientName: customer.name,
      clientPhone: customer.contact_number,
      clientEmail: customer.email || '',
      clientLastname: customer.lastname || ''
    }));
    setSearchQuery('');
    setShowCustomerDropdown(false);
    toast.success(`Selected client: ${customer.name}`);
    setStep(3); // Direct to service selection
  };

  // ✅ Create new customer
  const handleCreateNewCustomer = async () => {
    setCreatingCustomer(true);
    try {
      const formAppend = new FormData();
      formAppend.append('name', formData.clientName);
      formAppend.append('lastname', formData.clientLastname || '');
      formAppend.append('email', formData.clientEmail || '');
      formAppend.append('password', formData.password || 'qw21QW@!');
      formAppend.append('contact_number', formData.clientPhone);
      formAppend.append('gender', formData.clientGender || 'female');
      formAppend.append('status', '1');
      formAppend.append('membership', '0');
      const response = await createCustomer(formAppend)
      if (response?.data?.data?.success) {
        logger.info(response?.data?.data?.message);
        setStep(1)
      } else {
        toast.error(response?.message || 'Failed to create customer');
      }

    } catch (err) {
      toast.error(err.message || 'Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'therapistId') {
      const selected = therapists?.find(t => t.therapist_id == value);
      setFormData(prev => ({
        ...prev,
        therapistId: value,
        therapistName: selected?.alias || ''
      }));
    }
    else if (name === 'roomId') {
      const selectedRoom = rooms?.find(r => r.room_id == value);
      const firstItem = selectedRoom?.items?.[0]; // default to first available item

      setFormData(prev => ({
        ...prev,
        roomParentId: value,
        roomId: firstItem?.item_id || '',
        roomName: firstItem?.item_name || selectedRoom?.room_name || ''
      }));

    }
    else if (name === 'serviceId') {
      const selected = servicesData?.list?.category?.find(s => s.id == value);
      setFormData(prev => ({
        ...prev,
        serviceId: value,
        service: selected?.name || '',
        duration: selected?.duration || prev.duration
      }));
      if (selected) {
        toast.info(`Selected: ${selected.name} (${selected.duration} min)`);
      }
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceRequest = (request) => {
    setFormData(prev => ({
      ...prev,
      serviceRequests: prev.serviceRequests.includes(request)
        ? prev.serviceRequests.filter(r => r !== request)
        : [...prev.serviceRequests, request]
    }));
  };

  const calculatePrice = () => {
    const selected = servicesData?.list?.category?.find(s => s.id == formData.serviceId);
    return selected?.price || 0;
  };

  const calculateSubTotal = () => calculatePrice() * formData.pax;
  const calculateGST = () => calculateSubTotal() * 0.09;
  const calculateGrandTotal = () => calculateSubTotal() + calculateGST();

  const formatDate = (date) => {
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatTime = (time) => `${time}:00`;

  const calculateEndTime = () => {
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    const total = hours * 60 + minutes + formData.duration;
    const endH = Math.floor(total / 60);
    const endM = total % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}:00`;
  };


  // ✅ Submit booking with notifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.serviceId) {
      toast.error('Please select a service');
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem('userId') || '6';

      const items = [{
        service: formData.serviceId ? parseInt(formData.serviceId) : null,
        duration: String(formData.duration),
        start_time: formatTime(formData.startTime),
        end_time: calculateEndTime(),
        therapist: formData.therapistId ? parseInt(formData.therapistId) : null,
        price: calculatePrice().toFixed(2),
        quantity: String(formData.pax),
        customer_name: formData.clientName,
        user: 'primary',
        pair: formData.pax > 1 ? 1 : 0,
        room: formData.roomId ? parseInt(formData.roomId) : null,
        service_request: formData.serviceRequests.join(','),
        voucher_code: formData.voucherCode || null,
        item_number: 1
      }];

      let apiData = {
        company: '1',
        outlet: '1',
        outlet_type: '1',
        booking_type: formData.pax > 1 ? '2' : '1',
        customer: formData.clientId || '0',
        created_by: userId,
        items: items,
        sub_total: calculateSubTotal().toFixed(2),
        gst_rate: '9',
        grand_total: calculateGrandTotal().toFixed(2),
        currency: 'SGD',
        source: formData.source,
        payment_type: formData.paymentType,
        payment_status: '1',
        service_at: `${formatDate(formData.date)} ${formatTime(formData.startTime)}`,
        note: formData.notes,
        membership: '0',
        newsletter: '0',
        panel: 'outlet',
        voucher_code: formData.voucherCode || ''
      };

      if (booking) {
        apiData.updated_by = localStorage.getItem('userId') || '6';
        await updateBooking(booking.id, apiData);
        toast.success('Booking updated successfully!');
        logger.info('Booking updated', booking.id);
      } else {
        await createBooking(apiData);
        toast.success(`Booking created for ${formData.clientName}!`);
        logger.info('Booking created');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to create booking');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      {error && <div className="error-message">{error}</div>}

      {step === 1 && (
        <Step1Client
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showCustomerDropdown={showCustomerDropdown}
          filteredCustomers={filteredCustomers}
          onSelectCustomer={handleSelectCustomer}
          onCreateNew={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2NewClient
          formData={formData}
          onChange={handleChange}
          onBack={() => setStep(1)}
          onCreate={handleCreateNewCustomer}
          creating={creatingCustomer}
        />
      )}

      {step === 3 && (
        <Step3Service
          formData={formData}
          onChange={handleChange}
          onServiceRequest={handleServiceRequest}
          onBack={() => setStep(1)}
          onContinue={() => setStep(4)}
          therapists={therapists}
          rooms={rooms}
          servicesData={servicesData}
          calculateSubTotal={calculateSubTotal}
          calculateGST={calculateGST}
          calculateGrandTotal={calculateGrandTotal}
        />
      )}

      {step === 4 && (
        <Step4Confirm
          formData={formData}
          setStep={setStep}
          onBack={() => setStep(3)}
          onSubmit={handleSubmit}
          loading={loading || storeLoading}
          calculateSubTotal={calculateSubTotal}
          calculateGST={calculateGST}
          calculateGrandTotal={calculateGrandTotal}
        />
      )}

      <div className="step-indicator">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>Search Client</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>New Client</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>Service</div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>Confirm</div>
      </div>
    </form>
  );
};

export default BookingForm;