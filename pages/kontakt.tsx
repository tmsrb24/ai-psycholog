import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FaEnvelope, FaUser, FaPaperPlane, FaComments } from 'react-icons/fa';

const KontaktPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(false);
    setSubmitError(null);
    let isLoading = true; // Přidat stav pro loading indikátor, pokud je potřeba

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitError(result.message || 'Odeslání formuláře se nezdařilo. Zkuste to prosím později.');
      }
    } catch (error) {
      console.error('Chyba při odesílání formuláře:', error);
      setSubmitError('Došlo k chybě. Zkuste to prosím později.');
    } finally {
      isLoading = false; // Vypnout loading indikátor
    }
  };

  return (
    <Layout title="Kontakt | AI Psycholog" description="Kontaktujte nás s vašimi dotazy nebo zpětnou vazbou.">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <FaComments className="mr-3" /> Kontaktujte nás
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Máte dotaz, návrh na zlepšení nebo potřebujete pomoci? Neváhejte nám napsat.
          </p>
        </div>
      </section>

      {/* Hlavní obsah */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 md:p-8">
            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-300 text-green-700 dark:bg-green-800 dark:text-green-100 dark:border-green-700 rounded-md shadow" role="alert">
                Děkujeme za vaši zprávu! Ozveme se vám co nejdříve.
              </div>
            )}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 dark:bg-red-800 dark:text-red-100 dark:border-red-700 rounded-md shadow" role="alert">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Jméno a příjmení
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 shadow-sm"
                    placeholder="Vaše jméno"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  E-mailová adresa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 shadow-sm"
                    placeholder="vas.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Předmět
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 shadow-sm"
                  placeholder="O co se jedná?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vaše zpráva
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-500 shadow-sm"
                  placeholder="Napište nám více..."
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  <FaPaperPlane className="mr-2" />
                  Odeslat zprávu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KontaktPage;
