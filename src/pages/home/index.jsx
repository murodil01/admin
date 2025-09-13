// import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// const Home = () => {
//   return (
//     <div className="flex flex-col justify-center items-center min-h-[70vh] text-center px-4 py-10 sm:py-16">
//       <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
//         Feature Coming Soon Dashboard
//       </h1>

//       <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl">
//         This section is currently under development. We appreciate your patience
//         while we work to bring this feature to life.
//       </p>

//       <DotLottieReact
//         src="https://lottie.host/490acce8-7833-4e33-b3f2-9903dc15fb15/rVridJRK6u.lottie"
//         loop
//         autoplay
//         className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px]"
//       />
//     </div>
//   );
// };

// export default Home;

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Yanvar", sales: 4000, profit: 2400 },
  { name: "Fevral", sales: 3000, profit: 1398 },
  { name: "Mart", sales: 2000, profit: 9800 },
  { name: "Aprel", sales: 2780, profit: 3908 },
  { name: "May", sales: 1890, profit: 4800 },
  { name: "Iyun", sales: 2390, profit: 3800 },
  { name: "Iyul", sales: 3490, profit: 4300 },
];

const Home = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📊 Statistika</h2>

      {/* Bar Chart */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#8884d8" />
            <Bar dataKey="profit" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Statistikalar */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-100 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Umumiy savdo</h3>
          <p className="text-2xl font-bold text-blue-700">
            {data.reduce((acc, cur) => acc + cur.sales, 0)} $
          </p>
        </div>
        <div className="p-4 bg-green-100 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Umumiy foyda</h3>
          <p className="text-2xl font-bold text-green-700">
            {data.reduce((acc, cur) => acc + cur.profit, 0)} $
          </p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-xl shadow">
          <h3 className="text-lg font-semibold">Oylar soni</h3>
          <p className="text-2xl font-bold text-yellow-700">{data.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;


