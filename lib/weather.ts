export type WeatherData = {
  current: {
    temperature: number;
    apparent_temperature: number;
    humidity: number;
    wind_speed: number;
    precipitation: number;
    weather_code: number;
    is_day: boolean;
  };
  daily: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    precipitation: number;
    precipitation_probability: number;
    weather_code: number;
    wind_speed_max: number;
  }>;
};

export type WeatherError = { error: string };

export function weatherCodeToText(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Light freezing rain',
    67: 'Heavy freezing rain', 71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    77: 'Snow grains', 80: 'Slight rain showers', 81: 'Moderate rain showers',
    82: 'Violent rain showers', 85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  return map[code] ?? 'Unknown';
}

export function weatherFarmingAdvice(data: WeatherData): string[] {
  const tips: string[] = [];
  const today = data.daily[0];
  const tomorrow = data.daily[1];

  if (today?.precipitation_probability >= 70) {
    tips.push(`High chance of rain today (${today.precipitation_probability}%). Consider postponing irrigation and pesticide application.`);
  } else if (today?.precipitation_probability < 20 && today?.temp_max > 32) {
    tips.push('Low rain chance with high temperature. Monitor crop water requirements and irrigate as needed.');
  }
  if (tomorrow?.precipitation_probability >= 60) {
    tips.push(`Rain is expected tomorrow (${tomorrow.precipitation_probability}%). Consider reviewing irrigation plans and protecting harvested produce.`);
  }
  if (data.current.wind_speed > 30) {
    tips.push('High wind speeds detected. Secure young plants, greenhouses and loose equipment.');
  }
  if (today?.temp_max > 38) {
    tips.push('Very high temperature expected. Ensure adequate water for livestock and poultry. Consider shade nets for vegetables.');
  }
  if (data.current.humidity > 85) {
    tips.push('High humidity increases fungal disease risk. Monitor crops for mildew and blast symptoms.');
  }
  if (tips.length === 0) {
    tips.push('Weather conditions are stable. A good day for routine farm activities.');
  }
  return tips;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const json = await res.json();
  return {
    current: {
      temperature: json.current.temperature_2m,
      apparent_temperature: json.current.apparent_temperature_2m,
      humidity: json.current.relative_humidity_2m,
      wind_speed: json.current.wind_speed_10m,
      precipitation: json.current.precipitation,
      weather_code: json.current.weather_code,
      is_day: json.current.is_day === 1,
    },
    daily: json.daily.time.map((date: string, i: number) => ({
      date,
      temp_max: json.daily.temperature_2m_max[i],
      temp_min: json.daily.temperature_2m_min[i],
      precipitation: json.daily.precipitation_sum[i],
      precipitation_probability: json.daily.precipitation_probability_max[i],
      weather_code: json.daily.weather_code[i],
      wind_speed_max: json.daily.wind_speed_10m_max[i],
    })),
  };
}
