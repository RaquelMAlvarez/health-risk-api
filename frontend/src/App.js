import React, { useState, useEffect } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [formData, setFormData] = useState({
    age: '',
    smoking_history: '',
    pollution_level: '',
    genetic_risk: ''
  });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/') // Cambiar esta URL si estás usando Render
      .then(response => {
        if (response.ok) {
          setApiStatus('API connected successfully');
        } else {
          setApiStatus('API responded with error');
        }
      })
      .catch(() => setApiStatus('Could not connect to API'));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Aquí luego haremos POST a /patients
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Health Risk Predictor</h1>
      <p><strong>API status:</strong> {apiStatus}</p>

      <form onSubmit={handleSubmit}>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Smoking History:
          <select
            name="smoking_history"
            value={formData.smoking_history}
            onChange={handleChange}
            required
          >
            <option value="">--Select--</option>
            <option value="never smoked">Never Smoked</option>
            <option value="former">Former</option>
            <option value="current">Current</option>
          </select>
        </label>
        <br /><br />

        <label>
          Pollution Level:
          <select
            name="pollution_level"
            value={formData.pollution_level}
            onChange={handleChange}
            required
          >
            <option value="">--Select--</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </label>
        <br /><br />

        <label>
          Genetic Risk:
          <select
            name="genetic_risk"
            value={formData.genetic_risk}
            onChange={handleChange}
            required
          >
            <option value="">--Select--</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </label>
        <br /><br />

        <button type="submit">Submit Patient</button>
      </form>
    </div>
  );
}

export default App;



