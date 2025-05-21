import React, { useState, useEffect } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [statusMessage, setStatusMessage] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [patients, setPatients] = useState([]);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  
  

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

//ingresar usuario y contraseña, y guardar el token en estado.
  const handleLogin = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username,
        password
      })
    });

    const data = await response.json();
    if (response.ok) {
      setToken(data.access_token);
      setStatusMessage("Login successful");
      fetchPatients(); // ✅ Aquí se cargan los pacientes
    } else {
      setStatusMessage(`Error: ${data.detail}`);
    }
  } catch (error) {
    console.error("Login error:", error);
    setStatusMessage("Error al conectar con el servidor.");
  }
};

//usarlo token para traer los pacientes
const fetchPatients = async () => {
  try {
    const response = await fetch("http://127.0.0.1:8000/patients", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.ok) {
      setPatients(data);
    } else {
      setStatusMessage(`Error: ${data.detail}`);
    }
  } catch (error) {
    console.error("Error fetching patients:", error);
    setStatusMessage("The patient list could not be obtained.");
  }
};


//llamar boton eliminar
const deletePatient = async (id) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/patients/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (response.ok) {
      setStatusMessage(`Paciente con ID ${id} eliminado`);
      fetchPatients(); // Recargar lista
    } else {
      const data = await response.json();
      setStatusMessage(`Error al eliminar: ${data.detail}`);
    }
  } catch (error) {
    console.error("Error al eliminar paciente:", error);
    setStatusMessage("No se pudo eliminar el paciente.");
  }
};




//form, label and boton
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Health Risk Predictor</h1>
      <p><strong>API status:</strong> {apiStatus}</p>
      <p style={{ color: statusMessage.includes('Error') ? 'red' : 'green' }}>
      <strong>{statusMessage}</strong></p>

    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>Login</button>
      <p><strong>{statusMessage}</strong></p>
    </div>

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

    <h2>Pacientes Registrados</h2>
      <table border="1" cellPadding="6">
    <thead>
    <tr>
      <th>ID</th>
      <th>Age</th>
      <th>History</th>
      <th>Contamination</th>
      <th>Genetic Risk</th>
      <th>Level</th>
      <th>Recommendation</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>

    {patients.map(p => (
      <tr key={p.id}>
        <td>{p.id}</td>
        <td>{p.age}</td>
        <td>{p.smoking_history}</td>
        <td>{p.pollution_level}</td>
        <td>{p.genetic_risk}</td>
        <td>{p.risk_level}</td>
        <td>{p.recommendation}</td>
        <td>
          <button onClick={() => deletePatient(p.id)}>Eliminar</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

  </form>
    </div>
  );
}

export default App;



