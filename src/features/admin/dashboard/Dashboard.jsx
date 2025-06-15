import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Users, BookOpen, DollarSign, Bell, TrendingUp, Award, Calendar, Activity } from 'lucide-react';

const statsData = [
  { 
    title: 'Total Users', 
    value: '12,847', 
    change: '+12%',
    trend: 'up',
    icon: '👥', 
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    title: 'Active Languages', 
    value: '24', 
    change: '+3',
    trend: 'up',
    icon: '🌍', 
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  { 
    title: 'Monthly Revenue', 
    value: '$18.4K', 
    change: '+8.2%',
    trend: 'up',
    icon: '💰', 
    color: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  { 
    title: 'Active Tutors', 
    value: '156', 
    change: '+5',
    trend: 'up',
    icon: '👨‍🏫', 
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

const barData = [
  { month: 'Jan', enrollments: 420, revenue: 3200 },
  { month: 'Feb', enrollments: 380, revenue: 2800 },
  { month: 'Mar', enrollments: 520, revenue: 4100 },
  { month: 'Apr', enrollments: 280, revenue: 2400 },
  { month: 'May', enrollments: 480, revenue: 3800 },
  { month: 'Jun', enrollments: 650, revenue: 5200 },
  { month: 'Jul', enrollments: 720, revenue: 5800 }
];

const pieData = [
  { name: 'Web Development', value: 35, color: '#6366f1' },
  { name: 'Languages', value: 28, color: '#10b981' },
  { name: 'Design', value: 22, color: '#f59e0b' },
  { name: 'Data Science', value: 15, color: '#8b5cf6' }
];

const recentActivity = [
  { id: 1, user: 'Alice Johnson', action: 'enrolled in Python Basics', time: '2 min ago', avatar: '👩‍💼' },
  { id: 2, user: 'Bob Smith', action: 'completed JavaScript Course', time: '5 min ago', avatar: '👨‍💻' },
  { id: 3, user: 'Carol Williams', action: 'started French Lessons', time: '12 min ago', avatar: '👩‍🎓' },
  { id: 4, user: 'David Brown', action: 'booked tutoring session', time: '18 min ago', avatar: '👨‍🎓' },
  { id: 5, user: 'Emma Davis', action: 'upgraded to premium', time: '25 min ago', avatar: '👩‍🏫' }
];

const topCourses = [
  { name: 'React Masterclass', students: 1247, rating: 4.9, progress: 85 },
  { name: 'Python for Beginners', students: 987, rating: 4.8, progress: 92 },
  { name: 'Spanish Conversations', students: 756, rating: 4.7, progress: 78 },
  { name: 'UI/UX Design', students: 634, rating: 4.9, progress: 67 }
];

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition-transform">
                A
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-2xl text-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.textColor}`}>
                  <TrendingUp className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <div className={`text-3xl font-bold ${stat.textColor} mb-1 group-hover:scale-105 transition-transform duration-300`}>
                {stat.value}
              </div>
              <h3 className="text-gray-600 font-medium text-sm">{stat.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Enrollments Chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Enrollment Trends
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-gray-600">Enrollments</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={barData}>
              <defs>
                <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6b7280', fontSize: 12}}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{fill: '#6b7280', fontSize: 12}}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="enrollments" 
                stroke="#6366f1" 
                strokeWidth={3}
                fill="url(#enrollmentGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                fill="url(#revenueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course Categories Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            Course Categories
          </h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="text-2xl">{activity.avatar}</div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{activity.user}</p>
                  <p className="text-gray-600 text-sm">{activity.action}</p>
                </div>
                <span className="text-gray-500 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-colors duration-200">
            View All Activity
          </button>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />
            Top Performing Courses
          </h2>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={index} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-800">{course.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span className="text-sm font-medium">{course.rating}</span>
                    <span className="text-xs">⭐</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{course.students} students</span>
                  <span>{course.progress}% completion</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}