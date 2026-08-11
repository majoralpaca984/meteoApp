const labels = {
  0: "Sereno",
  1: "Prevalentemente sereno",
  2: "Parzialmente nuvoloso",
  3: "Coperto",
  45: "Nebbia",
  48: "Nebbia con brina",
  51: "Pioviggine leggera",
  53: "Pioviggine moderata",
  55: "Pioviggine intensa",
  56: "Pioviggine gelata",
  57: "Pioviggine gelata intensa",
  61: "Pioggia leggera",
  63: "Pioggia moderata",
  65: "Pioggia intensa",
  66: "Pioggia gelata",
  67: "Pioggia gelata intensa",
  71: "Neve leggera",
  73: "Neve moderata",
  75: "Neve intensa",
  77: "Granelli di neve",
  80: "Rovesci leggeri",
  81: "Rovesci moderati",
  82: "Rovesci intensi",
  85: "Rovesci di neve",
  86: "Forti rovesci di neve",
  95: "Temporale",
  96: "Temporale con grandine",
  99: "Forte temporale con grandine",
};

export function weatherLabel(code) {
  return labels[code] ?? "Condizioni variabili";
}

export function weatherEmoji(code, isDay = 1) {
  if (code === 0) return isDay ? "☀️" : "🌙";
  if ([1, 2].includes(code)) return isDay ? "🌤️" : "☁️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

export function weatherTheme(code, isDay = 1) {
  if (!isDay) return "night";
  if ([95, 96, 99].includes(code)) return "storm";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([3, 45, 48].includes(code)) return "cloudy";
  return "clear";
}
