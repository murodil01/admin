import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Loader } from "lucide-react";

const mockData = [
  { name: "Jan", value1: 400, value2: 300, value3: 200, value4: 500 },
  { name: "Feb", value1: 600, value2: 500, value3: 300, value4: 400 },
  { name: "Mar", value1: 300, value2: 200, value3: 400, value4: 300 },
  { name: "Apr", value1: 500, value2: 600, value3: 350, value4: 450 },
  { name: "May", value1: 700, value2: 800, value3: 600, value4: 700 },
  { name: "Jun", value1: 800, value2: 700, value3: 500, value4: 600 },
  { name: "Jul", value1: 900, value2: 1000, value3: 800, value4: 900 },
  { name: "Aug", value1: 1000, value2: 1100, value3: 900, value4: 1000 },
  { name: "Sep", value1: 1100, value2: 1200, value3: 1000, value4: 1100 },
  { name: "Oct", value1: 1200, value2: 1300, value3: 1100, value4: 1200 },
  { name: "Nov", value1: 1200, value2: 1400, value3: 1200, value4: 1300 },
  { name: "Dec", value1: 1400, value2: 1500, value3: 1300, value4: 1400 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Pie chart uchun summalarni hisoblash
  const pieData = [
    {
      name: "Sales",
      value: chartData.reduce((acc, item) => acc + item.value1, 0),
    },
    {
      name: "Visitors",
      value: chartData.reduce((acc, item) => acc + item.value2, 0),
    },
    {
      name: "Revenue",
      value: chartData.reduce((acc, item) => acc + item.value3, 0),
    },
    {
      name: "Orders",
      value: chartData.reduce((acc, item) => acc + item.value4, 0),
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setChartData(mockData);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-xl text-[36px] font-bold text-gray-900 mb-4">Home</h1>

      {/* Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Total Sales",
            value: "$24,000",
            change: "+15%",
            color: "green",
          },
          { title: "Visitors", value: "8,500", change: "-8%", color: "red" },
          {
            title: "Revenue",
            value: "$18,200",
            change: "+10%",
            color: "green",
          },
          { title: "Orders", value: "1,240", change: "+6%", color: "green" },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm text-gray-500">{item.title}</h3>
            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            <span className={`text-${item.color}-600 text-sm`}>
              {item.change.startsWith("-") ? "▼" : "▲"} {item.change}
            </span>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow p-6 w-full lg:w-1/2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Overview
          </h2>
          {loading ? (
            <div className="text-center py-16 flex justify-center items-center">
              <Loader className="animate-spin text-cyan-950" size={50} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="value1"
                  name="Sales"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value2"
                  name="Visitors"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value3"
                  name="Revenue"
                  stroke="#ffc658"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="value4"
                  name="Orders"
                  stroke="#ff7300"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6 w-full lg:w-1/2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Overall Distribution
          </h2>
          {loading ? (
            <div className="text-center py-16 flex justify-center items-center">
              <Loader className="animate-spin text-cyan-950" size={50} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow p-6 w-full lg:w-1/2">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Bar Overview
        </h2>
        {loading ? (
          <div className="text-center py-16 flex justify-center items-center">
            <Loader className="animate-spin text-cyan-950" size={50} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value1" name="Sales" fill="#8884d8" />
              <Bar dataKey="value2" name="Visitors" fill="#82ca9d" />
              <Bar dataKey="value3" name="Revenue" fill="#ffc658" />
              <Bar dataKey="value4" name="Orders" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Home;
