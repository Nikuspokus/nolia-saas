'use client';

import { useEffect, useState } from 'react';
import { Button } from '@repo/ui/button';
import { authenticatedFetch } from '@/utils/api';

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
}

interface CompanySettings {
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  siret: string;
  tvaNumber: string;
  logoUrl: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'company'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [user, setUser] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [company, setCompany] = useState<CompanySettings>({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'FR',
    siret: '',
    tvaNumber: '',
    logoUrl: '',
    invoicePrefix: 'FAC-',
    nextInvoiceNumber: 1,
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await authenticatedFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setCompany(data.company);
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await authenticatedFetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: activeTab === 'profile' ? user : undefined,
          company: activeTab === 'company' ? company : undefined,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès.' });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving settings', error);
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la sauvegarde.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-forest-dark mb-8">Paramètres</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'profile'
              ? 'text-forest-dark border-b-2 border-forest'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => { setActiveTab('profile'); setMessage(null); }}
        >
          Mon Profil
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'company'
              ? 'text-forest-dark border-b-2 border-forest'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => { setActiveTab('company'); setMessage(null); }}
        >
          Mon Entreprise
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={user.firstName || ''}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={user.lastName || ''}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié.</p>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-8">
            {/* General Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={company.name || ''}
                    onChange={(e) => setCompany({ ...company, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact (Facturation)</label>
                  <input
                    type="email"
                    value={company.email || ''}
                    onChange={(e) => setCompany({ ...company, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={company.address || ''}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                    <input
                      type="text"
                      value={company.zipCode || ''}
                      onChange={(e) => setCompany({ ...company, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <input
                      type="text"
                      value={company.city || ''}
                      onChange={(e) => setCompany({ ...company, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations légales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                  <input
                    type="text"
                    value={company.siret || ''}
                    onChange={(e) => setCompany({ ...company, siret: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de TVA</label>
                  <input
                    type="text"
                    value={company.tvaNumber || ''}
                    onChange={(e) => setCompany({ ...company, tvaNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Invoicing Settings */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-forest-dark mb-4">Configuration Facturation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Préfixe des factures</label>
                  <input
                    type="text"
                    value={company.invoicePrefix || ''}
                    onChange={(e) => setCompany({ ...company, invoicePrefix: e.target.value })}
                    placeholder="Ex: FAC-"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Apparaîtra avant le numéro (ex: FAC-2024-001)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prochain numéro</label>
                  <input
                    type="number"
                    value={company.nextInvoiceNumber || 1}
                    onChange={(e) => setCompany({ ...company, nextInvoiceNumber: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Le compteur s'incrémente automatiquement.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <Button 
            appName="web" 
            type="submit" 
            disabled={isSaving}
            className="bg-forest hover:bg-forest-light text-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </div>
  );
}
