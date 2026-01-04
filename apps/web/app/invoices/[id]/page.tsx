'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { authenticatedFetch } from '@/utils/api';
import Link from 'next/link';

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  client: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tvaRate: number;
    total: number;
  }[];
  subtotal: number;
  tvaAmount: number;
  total: number;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await authenticatedFetch(`/api/invoices/${params.id}`);

        if (!res.ok) {
          throw new Error(`Erreur API: ${res.status}`);
        }

        const data = await res.json();
        setInvoice(data);
      } catch (err: any) {
        console.error('Failed to fetch invoice:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id]);

  if (isLoading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-red-600">Erreur: {error}</div>;
  if (!invoice) return <div className="p-4 md:p-8">Facture non trouvée</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Facture {invoice.number}</h1>
          <p className="text-gray-500">
            Date: {new Date(invoice.date).toLocaleDateString()}
          </p>
        </div>
        <div className="space-x-4">
            <Link href="/invoices">
                <Button appName="web" className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Retour</Button>
            </Link>
            <Link href={`/invoices/${invoice.id}/edit`}>
                <Button appName="web">Modifier</Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="font-semibold mb-4">Client</h2>
          <p className="font-bold">{invoice.client.name}</p>
          <p>{invoice.client.email}</p>
          <p className="whitespace-pre-line">{invoice.client.address}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg text-right">
          <h2 className="font-semibold mb-4">Détails</h2>
          <p>Échéance: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Description</th>
            <th className="py-2 text-right">Qté</th>
            <th className="py-2 text-right">Prix Unit.</th>
            <th className="py-2 text-right">TVA</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{(item.unitPrice / 100).toFixed(2)} €</td>
              <td className="py-2 text-right">{item.tvaRate}%</td>
              <td className="py-2 text-right">{(item.total / 100).toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Sous-total HT</span>
            <span>{(invoice.subtotal / 100).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span>TVA</span>
            <span>{(invoice.tvaAmount / 100).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total TTC</span>
            <span>{(invoice.total / 100).toFixed(2)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
}
