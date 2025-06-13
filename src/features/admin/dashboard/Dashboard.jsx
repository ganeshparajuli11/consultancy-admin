import React from 'react';
import Card from '../../../components/Card';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, BookOpen, DollarSign, Bell } from 'lucide-react';
import avatar from '../../../assets/icon/avator.svg';

const statsData = [
  { title: 'Total Users', value: '1,234', icon: <Users className="w-6 h-6 text-indigo-500" /> },
  { title: 'Languages', value: '12', icon: <BookOpen className="w-6 h-6 text-green-500" /> },
  { title: 'Revenue', value: '$5.4k', icon: <DollarSign className="w-6 h-6 text-yellow-500" /> },
  { title: 'Active Tutors', value: '34', icon: <Users className="w-6 h-6 text-pink-500" /> }
];

const barData = [
  { month: 'Jan', enrolments: 400 },
  { month: 'Feb', enrolments: 300 },
  { month: 'Mar', enrolments: 500 },
  { month: 'Apr', enrolments: 200 },
  { month: 'May', enrolments: 450 },
  { month: 'Jun', enrolments: 350 }
];

const pieData = [
  { name: 'Web Development', value: 400 },
  { name: 'Language', value: 300 },
  { name: 'Design', value: 300 },
  { name: 'Other', value: 200 }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
          <img src={avatar} alt="Admin Avatar" className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsData.map((stat, idx) => (
          <Card key={idx} className="flex items-center p-4">
            <div className="p-3 bg-indigo-50 rounded-full">{stat.icon}</div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">{stat.title}</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-800">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-4">
            Monthly Enrollments
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrolments" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-700 mb-4">
            Course Categories
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
