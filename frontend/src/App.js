import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container,Card, Form, Button, Table, Alert } from 'react-bootstrap';





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
      fetchPatients();//update the table after register patients
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


 //componentes de React-Bootstrap
return (
  <div className="bg-light min-vh-100 p-4">
    <div className="container"></div>

    <h1 className="mb-4">Health Risk Predictor</h1>

    <Alert variant={
      apiStatus.includes('error') || apiStatus.includes('Could not')
        ? 'danger'
        : 'success'
    }>
      <strong>API status:</strong> {apiStatus}
    </Alert> 
  
    {statusMessage && (
      <Alert
        variant={statusMessage.includes('Error') || statusMessage.includes('fail') ? 'danger' : 'info'}
      >
        <strong>{statusMessage}</strong>
      </Alert>
    )}

  <div>
  <Card style={{ maxWidth: '400px', margin: '2rem auto', padding: '1.5rem' }}>
  <Card.Body>
    <Card.Title className="mb-3 text-center">Login</Card.Title>
    
    <Form.Group className="mb-3" controlId="loginUsername">
      <Form.Label>Username</Form.Label>
      <Form.Control
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
    </Form.Group>

    <Form.Group className="mb-3" controlId="loginPassword">
      <Form.Label>Password</Form.Label>
      <Form.Control
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
    </Form.Group>

    <Button variant="primary" onClick={handleLogin} className="w-100">
      Login
    </Button>

    {statusMessage && (
      <Alert
        className="mt-3"
        variant={statusMessage.toLowerCase().includes('error') ? 'danger' : 'success'}
      >
        {statusMessage}
      </Alert>
    )}
  </Card.Body>
</Card>
    </div>

  <Card style={{ maxWidth: '600px', margin: '2rem auto', padding: '1.5rem' }}>
  <Card.Body>
    <Card.Title className="mb-4 text-center">Register Patient</Card.Title>

    {prediction && (
      <div className="mt-4">
        <p><strong>Risk Level:</strong> {prediction.risk_level}</p>
        <p><strong>Recommendation:</strong> {prediction.recommendation}</p>
      </div>
    )}
    
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="formAge">
        <Form.Label>Age</Form.Label>
        <Form.Control
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formSmoking">
        <Form.Label>Smoking History</Form.Label>
        <Form.Select
          name="smoking_history"
          value={formData.smoking_history}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="never smoked">Never Smoked</option>
          <option value="former smoker">Former Smoker</option>
          <option value="current smoker">Current Smoker</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formPollution">
        <Form.Label>Pollution Level</Form.Label>
        <Form.Select
          name="pollution_level"
          value={formData.pollution_level}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-4" controlId="formGeneticRisk">
        <Form.Label>Genetic Risk</Form.Label>
        <Form.Select
          name="genetic_risk"
          value={formData.genetic_risk}
          onChange={handleChange}
          required
        >
          <option value="">--Select--</option>
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-between">
        <Button type="submit" variant="success">Submit Patient</Button>
        <Button type="button" variant="warning" onClick={handlePredict}>Predict Risk</Button>
      </div>
    </Form>
  </Card.Body>
</Card>

   {/*If the board becomes too long or wide,can make it more manageable. */}
<div style={{ maxHeight: '400px', overflowY: 'auto' }}>

<h2 className="mt-5">Registered Patients</h2>
<Table striped bordered hover responsive className="mt-3">
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
          <Button variant="danger" size="sm" onClick={() => deletePatient(p.id)}>
            Delete
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
</div>
</div>  
);

}

export default App;



