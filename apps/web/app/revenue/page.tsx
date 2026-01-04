'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { authenticatedFetch } from '@/utils/api';
import Link from 'next/link';
import { DateFilter, Interval } from '@/components/DateFilter';

interface RevenueData {
  total: number;
  interval: Interval;
  data: {
    label: string;
    amount: number;
  }[];
}

interface Invoice {
  id: string;
  number: string;
  client: { name: string };
  date: string;
  total: number;
  status: string;
}

function RevenueContent() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterParams, setFilterParams] = useState<{ startDate: string, endDate: string, interval: Interval } | null>(null);

  const fetchData = useCallback(async (startDate: string, endDate: string, interval: Interval) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate,
        endDate,
        interval
      });

      const [revenueRes, invoicesRes] = await Promise.all([
        authenticatedFetch(`/api/dashboard/revenue?${queryParams}`),
        authenticatedFetch('/api/invoices?status=PAID') // Keep recent invoices global or filter them too? User asked for filter on page. Let's keep recent global for now or maybe filter them too? The API for invoices doesn't support date range yet. Let's leave invoices list as "Recent" (global) for now to avoid scope creep, or just filter revenue stats.
      ]);

      if (revenueRes.ok) {
        setRevenueData(await revenueRes.json());
      }

      if (invoicesRes.ok) {
        const data = await invoicesRes.json();
        setRecentInvoices(Array.isArray(data) ? data.slice(0, 10) : []);
      }
    } catch (error) {
      console.error('Failed to fetch revenue data', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = (startDate: string, endDate: string, interval: Interval) => {
    setFilterParams({ startDate, endDate, interval });
    fetchData(startDate, endDate, interval);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount / 100);
  };

  const maxRevenue = revenueData?.data.reduce((max, m) => Math.max(max, m.amount), 0) || 0;

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-forest-dark">Chiffre d'affaires</h1>
        <p className="text-gray-600">Analysez vos revenus et votre croissance</p>
      </header>

      <DateFilter onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Chargement des données...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Total Revenue Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sand-dark lg:col-span-1">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Période</h3>
              <p className="text-4xl font-bold text-forest mt-4">
                {revenueData ? formatCurrency(revenueData.total) : '...'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Sur la période sélectionnée
              </p>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-sand-dark lg:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">Évolution</h3>
              <div className="h-48 flex items-end justify-between gap-2 overflow-x-auto pb-2">
                {revenueData?.data.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 group min-w-[40px]">
                    <div className="relative w-full flex justify-center">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                        {formatCurrency(item.amount)}
                      </div>
                      {/* Bar */}
                      <div 
                        className="w-full max-w-[30px] bg-forest/80 hover:bg-forest rounded-t-sm transition-all duration-300"
                        style={{ 
                          height: `${maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0}%`,
                          minHeight: item.amount > 0 ? '4px' : '0'
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 font-medium truncate w-full text-center" title={item.label}>
                      {item.label}
                    </span>
                  </div>
                ))}
                {revenueData?.data.length === 0 && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Aucune donnée pour cette période
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-sand-dark overflow-hidden">
            <div className="px-6 py-4 border-b border-sand-dark flex justify-between items-center">
              <h2 className="text-lg font-semibold text-forest-dark">Derniers encaissements</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Facture</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-forest-dark">
                          <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                            {invoice.number}
                          </Link>
                        </td>
                        <td className="px-6 py-4">{invoice.client.name}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(invoice.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-forest">
                          {formatCurrency(invoice.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Aucun encaissement récent
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RevenuePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <RevenueContent />
    </Suspense>
  );
}
