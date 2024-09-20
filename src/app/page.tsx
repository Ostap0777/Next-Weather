"use client";
import { Typography, TextField, Button, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import ModalComponent from '../app/UI/Modal/page';
import Loader from './UI/Loader/Loader';

const iconUrls: { [key: string]: string } = {
  "partly-cloudy-day": "/img/free-icon-sun-2698213.png",
  "clear-day": "/img/free-icon-sun-1163662.png",
  "rain": "/img/free-icon-weather-app-3767039.png",
  "cloudy": "/img/free-icon-cloud-1163624.png", 
};

const fetchForecasts = async () => {
  const storedForecasts = JSON.parse(localStorage.getItem('dataLocalStorage') || '[]');
  return storedForecasts;
};

const calculateTimeLeft = (targetDate: string) => {
  const now = new Date();
  const target = new Date(targetDate);
  const difference = target.getTime() - now.getTime();

  return difference > 0
    ? {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    : { days: 0, hours: 0, minutes: 0, seconds: 0 };
};

const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  const daysOfWeek = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота'];
  return daysOfWeek[date.getDay()];
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [filteredForecasts, setFilteredForecasts] = useState<any[]>([]);
  const [weeklyWeather, setWeeklyWeather] = useState<any | null>(null);
  const [todayWeather, setTodayWeather] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); 

  const { data: forecasts = [], isLoading } = useQuery({
    queryKey: ['forecasts'],
    queryFn: fetchForecasts,
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!isLoading) {
      setFilteredForecasts(forecasts);
      setLoading(false);
    }
  }, [isLoading, forecasts]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = forecasts.filter(forecast => 
        forecast.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredForecasts(filtered);
    } else {
      setFilteredForecasts(forecasts);
    }
  }, [searchTerm, forecasts]);

  const fetchWeeklyWeather = async (country: string) => {
    const apiKey = 'F9BV57WGF3L4RQ2MQ35NAA228';
    const apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${country}/today/next7days?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      setWeeklyWeather(data);
      setTodayWeather(data.days[0]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCountryClick = (forecast: any) => {
    fetchWeeklyWeather(forecast.location);
    const futureDate = forecast.date2;
    const timeLeft = calculateTimeLeft(futureDate);
    setTimeLeft(timeLeft);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (todayWeather && todayWeather.date2) { 
        const updatedTimeLeft = calculateTimeLeft(todayWeather.date2);
        setTimeLeft(updatedTimeLeft);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todayWeather]);

  return (
    <div className='home__container' style={{ marginTop: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {loading && <Loader />}
        {!loading && (
          <div>
            <Typography variant="h1" className="text-l font-bold text-black-600">
              Weather Forecast
            </Typography>
            <div className="mt-8"> 
              <TextField id="location-input" label="Enter city" variant="outlined" className="w-60" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={3}>
              <div className="flex">
                <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                  <ul style={{ display: 'inline-flex', height:'125', padding: 0, listStyleType: 'none', gap: '20px' }}>
                    {filteredForecasts.map((forecast, index) => (
                      <li style={{ width: '200px', cursor: 'pointer' }} key={index} onClick={() => handleCountryClick(forecast)}>
                        <Typography style={{ backgroundColor: 'rgba(115, 115, 115, 0.5)' , height:'125px'}} variant="body2">
                          <p style={{ paddingBottom: '20px', textAlign: 'center' }}>{forecast.location}</p>
                          <br />
                          <p style={{ textAlign: 'center' }}>{forecast.date1} - {forecast.date2}</p>
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="contained" onClick={handleOpen} style={{ marginLeft: '10px', padding: '50px', backgroundColor: 'rgba(113, 113, 113, 0.3)', color: 'black' }} startIcon={<Add style={{ color: 'black' }} />}>
                  Add
                </Button>
              </div>
            </Box>
            <Typography style={{ paddingTop: '20px' }}>Week</Typography>
            {weeklyWeather && (
              <Box sx={{ mt: 2, color: 'white' }}>
                <Typography variant="h6">Weekly Weather:</Typography>
                <Box display="flex" gap="10px">
                  {weeklyWeather.days.map((day: any, index: number) => (
                    <Box key={index} display="flex" gap="10px" flexDirection="column" alignItems="center" sx={{ marginBottom: 1 }}>
                      <Typography sx={{ color: 'black', marginRight: '10px' }}>
                          ({getDayOfWeek(day.datetime)})
                      </Typography>
                      <img src={iconUrls[day.icon]} alt={`Weather icon for ${day.conditions}`} style={{ width: '40px', height: '40px', marginRight: '10px' }}/>
                      <Typography sx={{ color: 'black' }}>
                        {day.temp}°C
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </div>
        )}
        <div>
          {todayWeather && (
            <div className="flex" style={{ width: '400px', height: '550px', backgroundColor: '#001F3F', padding: '16px', color: 'white' }}>
              <Box textAlign="center" width='400px' display="flex" flexDirection="column" justifyContent="space-around" ml={2}>
                <div>
                  <Typography sx={{ paddingTop: '20px', fontWeight: '700' }}>({getDayOfWeek(todayWeather.datetime)})</Typography>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
                    <img src={iconUrls[todayWeather.icon]} alt={`Weather icon for ${todayWeather.conditions}`} style={{ width: '50px', height: '50px' }} />
                    <Typography sx={{ fontWeight: '700' }}>{todayWeather.temp}°C</Typography>
                  </div>
                </div>
                <Typography display="flex" justifyContent='center' gap="30px" paddingBottom="20px">
                  <div style={{ fontWeight: '700', fontSize: '20px' }}>{timeLeft.days} <br /> <span>дні</span></div> 
                  <div style={{ fontWeight: '700', fontSize: '20px' }}>{timeLeft.hours} <br /> <span>години</span></div> 
                  <div style={{ fontWeight: '700', fontSize: '20px' }}>{timeLeft.minutes} <br /> <span>хвилини</span></div> 
                  <div style={{ fontWeight: '700', fontSize: '20px' }}>{timeLeft.seconds} <br /> <span>секунди</span></div> 
                </Typography>
              </Box>
            </div>
          )}
        </div>
      </div>
      <ModalComponent open={open} handleClose={handleClose} />
    </div>
  );
}
