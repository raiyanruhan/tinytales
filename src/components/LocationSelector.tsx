import { useState, useEffect } from 'react';
import { getLocations, LocationData } from '@services/orderApi';

interface LocationSelectorProps {
  selectedDistrict: string;
  selectedCity: string;
  onDistrictChange: (district: string) => void;
  onCityChange: (city: string) => void;
  error?: string;
}

export default function LocationSelector({
  selectedDistrict,
  selectedCity,
  onDistrictChange,
  onCityChange,
  error
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    // Reset city when district changes
    if (selectedDistrict && selectedCity) {
      const cities = locations?.districts[selectedDistrict] || [];
      if (!cities.includes(selectedCity)) {
        onCityChange('');
      }
    }
  }, [selectedDistrict, locations]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await getLocations();
      setLocations(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load locations');
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const districts = locations ? Object.keys(locations.districts).sort() : [];
  const cities = selectedDistrict && locations?.districts[selectedDistrict]
    ? locations.districts[selectedDistrict].sort()
    : [];

  return (
    <>
      <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <label style={{ fontWeight: 600, color: 'var(--navy)' }}>District/State *</label>
        {loading ? (
          <div style={{ padding: '10px 12px', color: 'var(--navy)', opacity: 0.7 }}>
            Loading districts...
          </div>
        ) : (
          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            required
            style={{
              padding: '10px 12px',
              border: error ? '2px solid var(--coral)' : '1px solid var(--border-light)',
              borderRadius: '10px',
              fontSize: 16,
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">Select a region, state or province</option>
            {districts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        )}
        {error && <span style={{ color: 'var(--coral)', fontSize: 14 }}>{error}</span>}
      </div>

      <div style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
        <label style={{ fontWeight: 600, color: 'var(--navy)' }}>City/Area *</label>
        {loading ? (
          <div style={{ padding: '10px 12px', color: 'var(--navy)', opacity: 0.7 }}>
            Loading cities...
          </div>
        ) : (
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            required
            disabled={!selectedDistrict}
            style={{
              padding: '10px 12px',
              border: error ? '2px solid var(--coral)' : '1px solid var(--border-light)',
              borderRadius: '10px',
              fontSize: 16,
              backgroundColor: selectedDistrict ? 'white' : 'var(--cream)',
              cursor: selectedDistrict ? 'pointer' : 'not-allowed',
              opacity: selectedDistrict ? 1 : 0.6
            }}
          >
            <option value="">Select city or area</option>
            {cities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        )}
        {error && <span style={{ color: 'var(--coral)', fontSize: 14 }}>{error}</span>}
      </div>

      {errorMsg && (
        <div style={{ padding: 12, background: '#FFF7D9', borderRadius: 8, marginBottom: 10, color: 'var(--ink)' }}>
          {errorMsg}
        </div>
      )}
    </>
  );
}






