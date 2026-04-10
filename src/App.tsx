import { useState } from 'react';
import DateTime from './DateTime';
import BookingTypeSelector from './BookingTypeSelector';
import GuestInfoForm from './GuestInfoForm';

const App = () => {
  const [step, setStep] = useState<'bookingType' | 'guestInfo' | 'dateTime'>('bookingType');
  const [bookingType, setBookingType] = useState<'self' | 'other' | null>(null);
  const [guestInfo, setGuestInfo] = useState<{ name: string; phone: string } | null>(null);

  const handleBookingTypeSelect = (type: 'self' | 'other') => {
    setBookingType(type);
    if (type === 'self') {
      setStep('dateTime');
    } else {
      setStep('guestInfo');
    }
  };

  const handleGuestInfoSubmit = (name: string, phone: string) => {
    setGuestInfo({ name, phone });
    setStep('dateTime');
  };

  const handleBackToBookingType = () => {
    setStep('bookingType');
    setBookingType(null);
    setGuestInfo(null);
  };

  if (step === 'dateTime') {
    return (
      <DateTime
        bookingType={bookingType}
        guestInfo={guestInfo}
        onBack={handleBackToBookingType}
      />
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0d1117",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {step === 'bookingType' && (
        <BookingTypeSelector onSelect={handleBookingTypeSelect} />
      )}
      
      {step === 'guestInfo' && (
        <GuestInfoForm 
          onSubmit={handleGuestInfoSubmit}
          onBack={handleBackToBookingType}
        />
      )}
      
    </div>
  );
};

export default App;
