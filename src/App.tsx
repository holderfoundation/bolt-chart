import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bitcoin } from 'lucide-react';

interface PriceData {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const timeRanges = ['1D', '1M', '1Y', 'YTD', 'ALL'];
const halvingDates = ['2012-11-28', '2016-07-09', '2020-05-11', '2024-04-20'];

const rainbowColors = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'
];

const App: React.FC = () => {
  const [data, setData] = useState<PriceData[]>([]);
  const [timeRange, setTimeRange] = useState('1Y');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${timeRange === 'ALL' ? 'max' : timeRange === 'YTD' ? 'ytd' : timeRange === '1Y' ? '365' : timeRange === '1M' ? '30' : '1'}`);
        const formattedData = response.data.prices.map((item: [number, number]) => ({
          date: new Date(item[0]).toISOString().split('T')[0],
          price: item[1],
          open: item[1],
          high: item[1],
          low: item[1],
          close: item[1],
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [timeRange]);

  const calculateRainbowPrice = (date: string, index: number) => {
    const daysFromStart = (new Date(date).getTime() - new Date('2010-01-01').getTime()) / (1000 * 60 * 60 * 24);
    const basePrice = Math.pow(10, 4 + daysFromStart / 1400) / 10000;
    return basePrice * Math.pow(1.2, index - 3);
  };

  const rainbowData = data.map(item => {
    const rainbowPrices = rainbowColors.map((_, index) => calculateRainbowPrice(item.date, index));
    return {
      ...item,
      ...Object.fromEntries(rainbowColors.map((_, index) => [`rainbow${index}`, rainbowPrices[index]])),
    };
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Bitcoin className="mr-2" /> Bitcoin Price Chart
        </h1>
        <div className="mb-4">
          {timeRanges.map(range => (
            <button
              key={range}
              className={`mr-2 px-4 py-2 rounded ${timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={rainbowData}>
            <XAxis dataKey="date" />
            <YAxis type="number" domain={['auto', 'auto']} scale="log" />
            <Tooltip />
            <Legend />
            <Bar dataKey="price" fill="#8884d8" name="Price" />
            {rainbowColors.map((color, index) => (
              <Line
                key={color}
                type="monotone"
                dataKey={`rainbow${index}`}
                stroke={color}
                dot={false}
                name={`Rainbow ${index + 1}`}
              />
            ))}
            {halvingDates.map((date, index) => (
              <Line
                key={date}
                type="monotone"
                dataKey="price"
                stroke="red"
                strokeDasharray="5 5"
                name={`Halving ${index + 1}`}
                activeDot={{ r: 8 }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default App;