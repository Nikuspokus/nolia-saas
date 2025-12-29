import Link from "next/link";
import { Button } from "@repo/ui/button";

export default function Dashboard() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-forest-dark">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Nicolas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Summary Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</h3>
          <p className="text-3xl font-bold text-forest mt-2">12,450.00 €</p>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">+12% from last month</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Invoices</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
          <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full mt-2 inline-block">Needs attention</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Clients</h3>
          <p className="text-3xl font-bold text-forest mt-2">24</p>
          <span className="text-xs text-gray-500 font-medium mt-2 inline-block">Total clients</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-forest-dark mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link href="/invoices/new">
              <Button appName="web" className="bg-forest hover:bg-forest-light text-white">
                Create Invoice
              </Button>
            </Link>
            <Link href="/clients/new">
              <Button appName="web" className="bg-sand-dark hover:bg-sand text-forest-dark">
                Add Client
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-forest-dark mb-4">Recent Activity</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Invoice #FAC-2024-003 created</span>
              <span className="text-gray-400">2 hours ago</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-600">New client "Acme Corp" added</span>
              <span className="text-gray-400">5 hours ago</span>
            </li>
            <li className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Invoice #FAC-2024-002 paid</span>
              <span className="text-gray-400">1 day ago</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
