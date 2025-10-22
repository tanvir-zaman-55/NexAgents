import { StatsOverview } from "../components/dashboard/StatsOverview";
import { BookingCard } from "../components/dashboard/BookingCard";

export function AdminDashboard() {
  // Example stats data - this would come from Convex queries in a real app
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12% from last month",
      trend: "up" as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: "Active Sessions",
      value: "892",
      change: "+5% from last week",
      trend: "up" as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+20% from last month",
      trend: "up" as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Pending Items",
      value: "23",
      change: "-8% from yesterday",
      trend: "down" as const,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  // Example bookings data - this would come from Convex queries in a real app
  const recentBookings = [
    {
      title: "Meeting with Client A",
      date: "2025-10-22",
      time: "10:00 AM",
      status: "confirmed" as const,
      customer: "John Doe",
    },
    {
      title: "Product Demo",
      date: "2025-10-22",
      time: "2:30 PM",
      status: "pending" as const,
      customer: "Jane Smith",
    },
    {
      title: "Team Standup",
      date: "2025-10-23",
      time: "9:00 AM",
      status: "confirmed" as const,
    },
    {
      title: "Consultation Call",
      date: "2025-10-23",
      time: "4:00 PM",
      status: "cancelled" as const,
      customer: "Mike Johnson",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBookings.map((booking, index) => (
              <BookingCard key={index} {...booking} />
            ))}
          </div>
        </div>

        {/* Add more dashboard sections here */}
        <div className="mt-8 bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button className="px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
              Add New Item
            </button>
            <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              View Reports
            </button>
            <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Manage Users
            </button>
            <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
