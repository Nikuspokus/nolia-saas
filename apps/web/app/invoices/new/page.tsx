'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/button';

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

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, tvaRate: 20 },
  ]);

  useEffect(() => {
    fetch('http://localhost:3001/clients')
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, tvaRate: 20 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert unitPrice to cents
    const formattedItems = items.map(item => ({
        ...item,
        unitPrice: Math.round(item.unitPrice * 100)
    }));

    await fetch('http://localhost:3001/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        dueDate,
        items: formattedItems,
      }),
    });
    router.push('/invoices');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Invoice</h1>
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
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Items</h2>
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
                  <label className="block text-xs font-medium mb-1">Qty</label>
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
                  <label className="block text-xs font-medium mb-1">Price (€)</label>
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
                  Remove
                </button>
              </div>
            ))}
          </div>
          <Button appName="web" type="button" onClick={addItem} className="mt-4" >
            Add Item
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Button appName="web" className="w-full text-lg py-3">
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
