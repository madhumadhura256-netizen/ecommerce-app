import { useState, useCallback } from 'react';

export const useGeoLocation = () => {
  const [location, setLocation] = useState(null);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: 'Permission denied. Please allow location access.',
          2: 'Position unavailable. Check your connection.',
          3: 'Request timed out. Try again.',
        };
        setError(messages[err.code] || 'Unable to retrieve location');
        setLoading(false);
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  }, []);

  return { location, error, loading, getLocation };
};