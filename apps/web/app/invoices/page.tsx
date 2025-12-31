'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { authenticatedFetch } from '@/utils/api';

interface Invoice {
  id: string;
  number: string;
  client: { name: string };
  date: string;
  total: number;
  status: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await authenticatedFetch('/api/invoices', { cache: 'no-store' });

        if (!res.ok) {
          throw new Error(`Erreur API: ${res.status}`);
        }

        const data = await res.json();
        setInvoices(data);
      } catch (err: any) {
        console.error('Failed to fetch invoices:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  useEffect(() => {
    if (statusFilter) {
      if (statusFilter === 'PENDING') {
        // Filter for pending statuses (SENT, FINALIZED, OVERDUE)
        setFilteredInvoices(invoices.filter(inv => ['SENT', 'FINALIZED', 'OVERDUE'].includes(inv.status)));
      } else {
        setFilteredInvoices(invoices.filter(inv => inv.status === statusFilter));
      }
    } else {
      setFilteredInvoices(invoices);
    }
  }, [invoices, statusFilter]);

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des factures...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          Une erreur est survenue : {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Factures</h1>
          {statusFilter && (
            <p className="text-sm text-gray-500 mt-1">
              Filtre actif : <span className="font-medium text-forest">{statusFilter === 'PENDING' ? 'En attente' : statusFilter}</span>
              <Link href="/invoices" className="ml-2 text-forest hover:underline text-xs">
                (Effacer)
              </Link>
            </p>
          )}
        </div>
        <Link href="/invoices/new">
          <Button appName="web" className="bg-forest hover:bg-forest-light text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nouvelle facture
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {filteredInvoices.map((invoice) => (
          <Link href={`/invoices/${invoice.id}`} key={invoice.id}>
            <div className="p-4 border rounded shadow-sm bg-white flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div>
                <h2 className="text-xl font-semibold">{invoice.number}</h2>
                <p className="text-gray-600">{invoice.client?.name || 'Client inconnu'}</p>
                <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{(invoice.total / 100).toFixed(2)} €</p>
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {filteredInvoices.length === 0 && (
          <p className="text-gray-500">Aucune facture trouvée{statusFilter ? ' avec ce filtre' : ''}.</p>
        )}
      </div>
    </div>
  );
}
