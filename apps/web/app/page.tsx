'use client';

import Link from "next/link";
import { Button } from "@repo/ui/button";
import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/utils/api";

interface Invoice {
  id: string;
  number: string;
  total: number;
  date: string;
  client: { name: string };
}

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAccordions, setActiveAccordions] = useState<string[]>(['invoices']);

  useEffect(() => {
    async function fetchData() {
      try {
        const [invoicesRes, clientsRes] = await Promise.all([
          authenticatedFetch('/api/invoices'),
          authenticatedFetch('/api/clients')
        ]);

        if (invoicesRes.ok) {
          const data = await invoicesRes.json();
          setInvoices(Array.isArray(data) ? data.slice(0, 5) : []);
        }

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleAccordion = (id: string) => {
    setActiveAccordions(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-forest-dark">Tableau de bord</h1>
        <p className="text-gray-600">Bon retour, Nicolas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Summary Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Chiffre d'affaires</h3>
          <p className="text-3xl font-bold text-forest mt-2">12 450,00 €</p>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full mt-2 inline-block">+12% vs mois dernier</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Factures en attente</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">3</p>
          <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full mt-2 inline-block">Nécessite attention</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Clients actifs</h3>
          <p className="text-3xl font-bold text-forest mt-2">{clients.length > 0 ? clients.length : 24}</p>
          <span className="text-xs text-gray-500 font-medium mt-2 inline-block">Total clients</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold text-forest-dark mb-4">Actions rapides</h2>
          <div className="flex gap-4">
            <Link href="/invoices/new">
              <Button appName="web" className="bg-forest hover:bg-forest-light text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Créer une facture
              </Button>
            </Link>
            <Link href="/clients/new">
              <Button appName="web" className="bg-sand-dark hover:bg-sand text-forest-dark px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Ajouter un client
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity Accordion */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleAccordion('invoices')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h2 className="text-lg font-semibold text-forest-dark">Dernières factures</h2>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeAccordions.includes('invoices') ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeAccordions.includes('invoices') && (
              <div className="p-4">
                {isLoading ? (
                  <p className="text-gray-500 text-center py-4">Chargement...</p>
                ) : invoices.length > 0 ? (
                  <ul className="space-y-3">
                    {invoices.map((invoice) => (
                      <li key={invoice.id} className="hover:bg-gray-50 rounded transition-colors">
                        <Link href={`/invoices/${invoice.id}`} className="flex items-center justify-between text-sm p-2 w-full">
                          <div>
                            <span className="font-medium text-forest-dark">{invoice.number}</span>
                            <span className="text-gray-500 mx-2">-</span>
                            <span className="text-gray-600">{invoice.client.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold block">{(invoice.total / 100).toFixed(2)} €</span>
                            <span className="text-xs text-gray-400">{new Date(invoice.date).toLocaleDateString()}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune facture récente</p>
                )}
                <div className="mt-4 text-center">
                  <Link href="/invoices" className="text-sm text-forest hover:underline">Voir toutes les factures</Link>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleAccordion('clients')}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h2 className="text-lg font-semibold text-forest-dark">Derniers clients</h2>
              <svg
                className={`w-5 h-5 transform transition-transform ${activeAccordions.includes('clients') ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeAccordions.includes('clients') && (
              <div className="p-4">
                {isLoading ? (
                  <p className="text-gray-500 text-center py-4">Chargement...</p>
                ) : clients.length > 0 ? (
                  <ul className="space-y-3">
                    {clients.map((client) => (
                      <li key={client.id} className="hover:bg-gray-50 rounded transition-colors">
                        <Link href={`/clients/${client.id}`} className="flex items-center justify-between text-sm p-2 w-full">
                          <div>
                            <span className="font-medium text-forest-dark">{client.name}</span>
                            <span className="block text-xs text-gray-500">{client.email}</span>
                          </div>
                          <span className="text-xs text-gray-400">Ajouté le {new Date(client.createdAt).toLocaleDateString()}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucun client récent</p>
                )}
                <div className="mt-4 text-center">
                  <Link href="/clients" className="text-sm text-forest hover:underline">Voir tous les clients</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
