import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Home = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] text-center px-4 py-10 sm:py-16">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Feature Coming Soon Dashboard
      </h1>

      <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl">
        This section is currently under development. We appreciate your patience
        while we work to bring this feature to life.
      </p>

      <DotLottieReact
        src="https://lottie.host/490acce8-7833-4e33-b3f2-9903dc15fb15/rVridJRK6u.lottie"
        loop
        autoplay
        className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px]"
      />
    </div>
  );
};

export default Home;


/*import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Loader, TrendingUp, TrendingDown } from "lucide-react";
import { useResizeDetector } from "react-resize-detector";
import { useSidebar } from "../../context";

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

const COLORS = ["#0061fe", "#10b981", "#f59e0b", "#ef4444"];

const CHART_CONFIG = {
  margin: { top: 20, right: 30, left: 20, bottom: 5 },
  height: 350,
};

const Home = () => {
  const { collapsed } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const { width, ref } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 100,
  });

  // Memoize statistics data to prevent recalculation
  const statisticsData = useMemo(() => [
    { 
      title: "Total Sales", 
      value: "$24,000", 
      change: "+15%", 
      isPositive: true,
      icon: TrendingUp 
    },
    { 
      title: "Visitors", 
      value: "8,500", 
      change: "-8%", 
      isPositive: false,
      icon: TrendingDown 
    },
    { 
      title: "Revenue", 
      value: "$18,200", 
      change: "+10%", 
      isPositive: true,
      icon: TrendingUp 
    },
    { 
      title: "Orders", 
      value: "1,240", 
      change: "+6%", 
      isPositive: true,
      icon: TrendingUp 
    },
  ], []);

  // Memoize pie chart data calculation
  const pieData = useMemo(() => {
    if (!chartData.length) return [];
    
    return [
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
  }, [chartData]);

  // Load data with useCallback to prevent unnecessary re-renders
  const loadData = useCallback(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setChartData(mockData);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  // Memoize chart components to prevent unnecessary re-renders
  const LineChartComponent = useMemo(() => {
    if (loading || !width || !chartData.length) return null;

    return (
      <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
        <LineChart data={chartData} margin={CHART_CONFIG.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="line"
          />
          <Line 
            type="monotone" 
            dataKey="value1" 
            name="Sales" 
            stroke={COLORS[0]} 
            strokeWidth={3} 
            dot={{ fill: COLORS[0], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS[0], strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="value2" 
            name="Visitors" 
            stroke={COLORS[1]} 
            strokeWidth={3} 
            dot={{ fill: COLORS[1], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS[1], strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="value3" 
            name="Revenue" 
            stroke={COLORS[2]} 
            strokeWidth={3} 
            dot={{ fill: COLORS[2], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS[2], strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="value4" 
            name="Orders" 
            stroke={COLORS[3]} 
            strokeWidth={3} 
            dot={{ fill: COLORS[3], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: COLORS[3], strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [loading, width, chartData]);

  const PieChartComponent = useMemo(() => {
    if (loading || !width || !pieData.length) return null;

    return (
      <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
        <PieChart>
          <Pie 
            data={pieData} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            outerRadius={100}
            innerRadius={40}
            paddingAngle={2}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="white"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }, [loading, width, pieData]);

  const BarChartComponent = useMemo(() => {
    if (loading || !width || !chartData.length) return null;

    return (
      <ResponsiveContainer width="100%" height={CHART_CONFIG.height}>
        <BarChart data={chartData} margin={CHART_CONFIG.margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="rect"
          />
          <Bar 
            dataKey="value1" 
            name="Sales" 
            fill={COLORS[0]}
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="value2" 
            name="Visitors" 
            fill={COLORS[1]}
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="value3" 
            name="Revenue" 
            fill={COLORS[2]}
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="value4" 
            name="Orders" 
            fill={COLORS[3]}
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [loading, width, chartData]);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
      <div className="flex flex-col items-center space-y-4">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500 text-sm">Loading dashboard data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8" ref={ref}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statisticsData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  item.isPositive ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <IconComponent 
                    size={20} 
                    className={item.isPositive ? 'text-green-600' : 'text-red-600'} 
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  item.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change}
                </span>
                <span className="text-gray-500 text-sm ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Monthly Trends</h2>
            <div className="text-sm text-gray-500">12 months</div>
          </div>
          {loading ? <LoadingSpinner /> : LineChartComponent}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Distribution</h2>
            <div className="text-sm text-gray-500">Current year</div>
          </div>
          {loading ? <LoadingSpinner /> : PieChartComponent}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Monthly Comparison</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">Year 2024</div>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : BarChartComponent}
      </div>
    </div>
  );
};

export default Home;*/