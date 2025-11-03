// Service để gọi API thời tiết
// Sử dụng OpenWeatherMap API (miễn phí)

const API_KEY = 'a3ac83a0db659c4023b14f3ca6046e8d'; // Thay bằng API key của bạn từ openweathermap.org
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  cityName: string;
  date: string;
}

export const getWeatherByCoords = async (
  latitude: number,
  longitude: number
): Promise<WeatherData | null> => {
  try {
    // Lấy thông tin thời tiết
    const weatherUrl = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`;
    console.log('Fetching weather from:', weatherUrl);
    
    const weatherResponse = await fetch(weatherUrl);
    
    console.log('Weather response status:', weatherResponse.status);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch weather data: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log('Weather API response:', weatherData);

    // Lấy tên địa điểm chính xác bằng Reverse Geocoding
    const geoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
    console.log('Fetching location name from:', geoUrl);
    
    const geoResponse = await fetch(geoUrl);
    let cityName = weatherData.name; // Fallback to weather API name
    
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      console.log('Geocoding API response:', geoData);
      
      if (geoData && geoData.length > 0) {
        const location = geoData[0];
        // Ưu tiên: local_names.vi > name > state
        cityName = location.local_names?.vi || location.name || location.state || weatherData.name;
        console.log('Using location name:', cityName);
      }
    }

    const processedData = {
      temp: Math.round(weatherData.main.temp),
      tempMin: Math.round(weatherData.main.temp_min),
      tempMax: Math.round(weatherData.main.temp_max),
      description: weatherData.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`,
      humidity: weatherData.main.humidity,
      windSpeed: weatherData.wind.speed,
      cityName: cityName,
      date: new Date().toLocaleDateString('vi-VN', { 
        day: 'numeric', 
        month: 'numeric' 
      }),
    };
    
    console.log('Processed weather data:', processedData);
    return processedData;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

export const getWeatherByCity = async (
  cityName: string
): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=vi`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    return {
      temp: Math.round(data.main.temp),
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      cityName: data.name,
      date: new Date().toLocaleDateString('vi-VN'),
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};
