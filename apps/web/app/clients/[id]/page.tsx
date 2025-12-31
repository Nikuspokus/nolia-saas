'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@repo/ui/button';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'FR',
    tvaNumber: '',
  });

  useEffect(() => {
    if (id) {
      fetch(`/api/clients/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || '',
            email: data.email || '',
            address: data.address || '',
            city: data.city || '',
            zipCode: data.zipCode || '',
            country: data.country || 'FR',
            tvaNumber: data.tvaNumber || '',
          });
        })
        .catch((err) => console.error('Error fetching client:', err));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      router.push('/clients');
    } catch (error) {
      console.error('Error updating client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-forest-dark">Modifier le client</h1>
          <p className="text-forest-light mt-1">Mettre à jour les informations du client</p>
        </div>
        <Link href="/clients">
          <button className="px-4 py-2 text-sm font-medium text-forest hover:text-forest-dark transition-colors">
            Annuler
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-sand p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-forest-dark">Nom de l'entreprise</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Acme Corp"
                className="w-full px-4 py-2 rounded-lg border border-sand-dark bg-offwhite focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-forest-dark">Adresse email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="contact@acme.com"
                className="w-full px-4 py-2 rounded-lg border border-sand-dark bg-offwhite focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-forest-dark">Adresse</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Avenue des Champs-Élysées"
                className="w-full px-4 py-2 rounded-lg border border-sand-dark bg-offwhite focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-forest-dark">Ville</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Paris"
                className="w-full px-4 py-2 rounded-lg border border-sand-dark bg-offwhite focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-forest-dark">Code postal</label>
              <input
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="75008"
                className="w-full px-4 py-2 rounded-lg border border-sand-dark bg-offwhite focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-forest-dark">Pays</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-sand-dark bg-offwhite focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all"
              >
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
                <option value="UK">Royaume-Uni</option>
                <option value="US">États-Unis</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-forest-dark">Numéro de TVA</label>
              <input
                name="tvaNumber"
                value={formData.tvaNumber}
                onChange={handleChange}
                placeholder="FR12345678901"
                className="w-full px-4 py-2 rounded-lg border border-sand-dark bg-offwhite focus:ring-2 focus:ring-forest focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-sand flex justify-end gap-4">
            <Link href="/clients">
              <button 
                type="button"
                className="px-6 py-2.5 rounded-lg border border-sand-dark text-forest-dark font-medium hover:bg-sand transition-colors"
              >
                Annuler
              </button>
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-forest text-white font-medium hover:bg-forest-light transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
