import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ModalComponentProps } from '@/app/models/models';
import { saveToLocalStorage } from '@/app/saveLocalStorage';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ModalComponent: React.FC<ModalComponentProps> = ({ open, handleClose }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    const storedCountriesStr = localStorage.getItem('availableCountries');
    let storedCountries: string[] = [];
    if (storedCountriesStr) {
      try {
        storedCountries = JSON.parse(storedCountriesStr);
      } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
      }
    }

    if (storedCountries.length === 0) {
      const initialCountries = [
         "Sydney","São Paulo","Toronto","Beijing","Paris","Berlin","New Delhi",
	      "Rome","Tokyo","Mexico City","Auckland","Cape Town","London","New York","Buenos Aires","Madrid","Istanbul","Seoul","Amsterdam"
      ];
      localStorage.setItem('availableCountries', JSON.stringify(initialCountries));
      setCountries(initialCountries);
    } else {
      setCountries(storedCountries);
    }
  }, []);

  const saveLocalStorageData = (data: any) => {
    const existingDataStr = localStorage.getItem('dataLocalStorage');
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
    existingData.push(data);
    console.log("Saving to localStorage:", existingData);
    localStorage.setItem('dataLocalStorage', JSON.stringify(existingData));
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || !selectedCountry) {
      console.log("Please fill in all fields");
      return;
    }
    const today = new Date();
    const start = new Date(startDate);

    if (start < today) {
      console.log("Start date cannot be in the past.");
      return;
    }

    const location = selectedCountry;
    const date1 = startDate;
    const date2 = endDate;
    const apiKey = 'F9BV57WGF3L4RQ2MQ35NAA228';

    const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date1}/${date2}?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Weather Data:", data);

      const forecastData = {
        location,
        date1,
        date2,
        weatherData: data
      };
      saveLocalStorageData(forecastData);
    } catch (error) {
      console.error("Error:", error);
    }

    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
       <Box sx={{ ...style, width: '400px'}}
  >
        <Typography variant="h6" component="h2"  sx={{ borderBottom: '1px solid #737373' }}>
          Create trip
        </Typography>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Country</InputLabel>
          <Select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} label="Country"
          >
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
		  <InputLabel  style={{fontWeight:'700'}}>Start date</InputLabel>
        <TextField type="date" variant="outlined" fullWidth value={startDate} onChange={(e) => setStartDate(e.target.value)}sx={{ mt: 2 }}/>
			<InputLabel  style={{fontWeight:'700'}}>End date</InputLabel>
        <TextField  type="date" variant="outlined" fullWidth value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ mt: 2 }} />
			<div style={{textAlign: 'end'}}>
			<Button variant="contained" onClick={handleClose} sx={{ mt: 2, ml: 1 }}>
          Close
        </Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 , backgroundColor:'white', color:'black', marginLeft:'10px'}}>
          Save
        </Button>
		  </div>
      </Box>
    </Modal>
  );
};

export default ModalComponent;
