import './DateRangePicker.css';

export default function DateRangePicker({ onDateChange }) {
  const handleStartDateChange = (e) => {
    onDateChange('start', e.target.value);
  };

  const handleEndDateChange = (e) => {
    onDateChange('end', e.target.value);
  };

  return (
    <div className="date-range-picker">
      <div className="date-input-group">
        <label>Başlangıç</label>
        <input 
          type="datetime-local" 
          onChange={handleStartDateChange}
          className="date-input"
        />
      </div>
      <div className="date-input-group">
        <label>Bitiş</label>
        <input 
          type="datetime-local" 
          onChange={handleEndDateChange}
          className="date-input"
        />
      </div>
    </div>
  );
}