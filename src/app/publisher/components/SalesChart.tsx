import React, { useEffect, useState, useMemo } from "react";
import { Card } from "@mui/material";
import {AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,} from "recharts";

interface Props {
  selectedYear: number;
  data: any;
  onYearChange: (year: number) => void;
}
const yAxisTickFormatter = (value: number) => {
  if (value === 10000) return "";
  if (value < 1000) return value.toString();
  return `${value / 1000}k`;
};

const SalesChart = ({selectedYear, data, onYearChange}: Props) => { 
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const monthlyCounts = useMemo(() => data?.monthlyCounts || [], [data]);

  const [userGrowth, setUserGrowth] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const formattedData = monthlyCounts.map((item: any) => ({
      name: item.month.split("/")[0], 
      value: item.count,
    }));

    setUserGrowth(formattedData);
  }, [monthlyCounts]);

  return (
    <Card
      sx={{
        borderRadius: "10px",
        boxShadow: "0px 0px 40px 0px rgba(235, 130, 60, 0.06)",
        backgroundColor: "#F2EAE5",
      }}
    >
    <div className="flex justify-between items-center ">
    <h2 className="text-darkBlack font-aeonikBold">Sales Statistics</h2>
    <select value={selectedYear} onChange={(e) => onYearChange(Number(e.target.value))}
     name="year" id="year" className="py-2 px-[15px] rounded-[39px] text-[#7F7F8A]  ">
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
    </div>     
   <div className="p-5 pl-0 text-[#8B8E98]">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={userGrowth}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--tw-bg-orange)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#F6C6A6" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              tick={{ fill: "#8B8E98", fontSize: 14 }}
            />
            <YAxis
              tickFormatter={yAxisTickFormatter}
              tick={{ fill: "#8B8E98", fontSize: 14 }}
              tickLine={false}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              strokeWidth={3}
              stroke="var(--tw-bg-orange)"
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesChart;
