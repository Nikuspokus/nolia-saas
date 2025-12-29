'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';

interface Client {
  id: string;
  name: string;
  email: string;
  city: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/clients')
      .then((res) => res.json())
      .then((data) => setClients(data));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/clients/new">
          <Button appName="web">New Client</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <div key={client.id} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{client.name}</h2>
            <p className="text-gray-600">{client.email}</p>
            <p className="text-gray-500">{client.city}</p>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="text-gray-500">No clients found.</p>
        )}
      </div>
    </div>
  );
}
