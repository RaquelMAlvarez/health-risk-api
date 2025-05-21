import React, { useState, useEffect } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [statusMessage, setStatusMessage] = useState('');
  const [prediction, setPrediction] = useState(null);

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

  // define handlePredict a nivel superior del componente
const handlePredict = async () => {
  if (
    !formData.age ||
    !formData.smoking_history ||
    !formData.pollution_level ||
    !formData.genetic_risk
  ) {
    
    setStatusMessage("Please fill in all fields before predicting.");
    return;
  }

  const ageNumber = Number(formData.age);
  if (isNaN(ageNumber) || ageNumber <= 0) {
    setStatusMessage("Age must be a positive number.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/predict-risk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      setPrediction(data);
      setStatusMessage(""); // limpia mensaje anterior
    } else {
      setStatusMessage(`Prediction failed: ${data.detail?.toString?.() || JSON.stringify(data.detail)}`);
      setPrediction(null);
    }

  } catch (error) {
    console.error("Error connecting to the API:", error);
    setStatusMessage("Could not connect to the server.");
    setPrediction(null);
  }
};

// define handleSubmit como otra función aparte
const handleSubmit = async (e) => {
  e.preventDefault();
  setStatusMessage('Sending patient data...');

  try {
    const response = await fetch("http://127.0.0.1:8000/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      setStatusMessage(`Patient saved successfully. ID: ${data.id}`);
      setFormData({
        age: '',
        smoking_history: '',
        pollution_level: '',
        genetic_risk: ''
      });
      setPrediction(null);
    } else {
      setStatusMessage(`Server error: ${data.detail}`);
    }
  } catch (error) {
    console.error("Error connecting to the API:", error);
    setStatusMessage("Could not connect to the server.");
  }
};


//form 
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Health Risk Predictor</h1>
      <p><strong>API status:</strong> {apiStatus}</p>
      <p style={{ color: statusMessage.includes('Error') ? 'red' : 'green' }}>
      <strong>{statusMessage}</strong></p>

     {prediction && (
  <div>
    <p><strong>Risk Level:</strong> {prediction.risk_level}</p>
    <p><strong>Recommendation:</strong> {prediction.recommendation}</p>
  </div>
)}

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
            <option value="never smoked">Never Smoked</option>
            <option value="former smoker">Former Smoker</option>
            <option value="current smoker">Current Smoker</option>

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
            <option value="low">Low</option>
            <option value="medium">Medium</option>
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
        <button type="button" onClick={handlePredict}>Predict Risk</button>
      </form>
    </div>
  );
}

export default App;



