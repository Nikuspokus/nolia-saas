'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { authenticatedFetch } from '@/utils/api';

interface Client {
  id: string;
  name: string;
  email: string;
  city: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await authenticatedFetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      try {
        await authenticatedFetch(`/api/clients/${id}`, {
          method: 'DELETE',
        });
        // Refresh the list
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Une erreur est survenue lors de la suppression.');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link href="/clients/new">
          <Button appName="web" className="bg-forest hover:bg-forest-light text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nouveau client
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <div key={client.id} className="p-4 border rounded shadow-sm bg-white flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{client.name}</h2>
              <p className="text-gray-600">{client.email}</p>
              <p className="text-gray-500">{client.city}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/clients/${client.id}`}>
                <button className="text-forest hover:text-forest-dark font-medium text-sm px-3 py-1 rounded hover:bg-sand-light transition-colors">
                  Modifier
                </button>
              </Link>
              <button 
                onClick={() => handleDelete(client.id)}
                className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="text-gray-500">Aucun client trouvé.</p>
        )}
      </div>
    </div>
  );
}
