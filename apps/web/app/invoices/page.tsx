'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';

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

  useEffect(() => {
    fetch('http://localhost:3001/invoices')
      .then((res) => res.json())
      .then((data) => setInvoices(data));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/new">
          <Button appName="web">New Invoice</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="p-4 border rounded shadow-sm bg-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{invoice.number}</h2>
              <p className="text-gray-600">{invoice.client.name}</p>
              <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{(invoice.total / 100).toFixed(2)} €</p>
              <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                {invoice.status}
              </span>
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <p className="text-gray-500">No invoices found.</p>
        )}
      </div>
    </div>
  );
}
