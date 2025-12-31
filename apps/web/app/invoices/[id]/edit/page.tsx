'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@repo/ui/button';
import { authenticatedFetch } from '@/utils/api';

interface Client {
  id: string;
  name: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, tvaRate: 20 },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch clients
        const clientsRes = await authenticatedFetch('/api/clients');
        if (!clientsRes.ok) throw new Error('Failed to fetch clients');
        const clientsData = await clientsRes.json();
        setClients(Array.isArray(clientsData) ? clientsData : []);

        // Fetch invoice
        if (params.id) {
            const invoiceRes = await authenticatedFetch(`/api/invoices/${params.id}`);
            if (!invoiceRes.ok) throw new Error('Failed to fetch invoice');
            const invoiceData = await invoiceRes.json();
            
            setClientId((invoiceData.clientId || '') as string);
            setDueDate((invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : '') as string);
            
            if (invoiceData.items && invoiceData.items.length > 0) {
                setItems(invoiceData.items.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice / 100, // Convert cents to unit
                    tvaRate: item.tvaRate
                })));
            }
        }

      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [params.id]);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const currentItem = newItems[index];
    if (currentItem) {
      newItems[index] = { ...currentItem, [field]: value };
      setItems(newItems);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, tvaRate: 20 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert unitPrice to cents
      const formattedItems = items.map(item => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * 100)
      }));

      const res = await authenticatedFetch(`/api/invoices/${params.id}`, {
        method: 'POST', // Using POST as implemented in controller
        body: JSON.stringify({
          clientId,
          dueDate,
          items: formattedItems,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur lors de la modification: ${res.status}`);
      }

      router.push(`/invoices/${params.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to update invoice:', err);
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Chargement des données...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Modifier la facture</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date d'échéance</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Articles</h2>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end border p-4 rounded bg-gray-50">
                <div className="flex-grow">
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium mb-1">Qté</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium mb-1">Prix (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium mb-1">TVA (%)</label>
                  <input
                    type="number"
                    value={item.tvaRate}
                    onChange={(e) => handleItemChange(index, 'tvaRate', parseFloat(e.target.value))}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <Button appName="web" type="button" onClick={addItem} className="mt-4" >
            Ajouter un article
          </Button>
        </div>

        <div className="pt-4 border-t flex gap-4">
           <Button appName="web" type="button" className="w-full text-lg py-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button appName="web" className="w-full text-lg py-3" disabled={isSubmitting}>
            {isSubmitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
}
