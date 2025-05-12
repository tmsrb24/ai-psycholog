import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 shadow-inner mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-2 rounded-lg mr-2">
                <span className="font-bold text-xl">AI</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Psycholog</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Moderní psychologická podpora s využitím umělé inteligence. Dostupná kdykoliv a kdekoliv.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Odkazy
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Domů
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Chat
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Ceník
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Kontakt
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FaEnvelope className="text-gray-500 dark:text-gray-400 mr-2" />
                <a href="mailto:info@psychollog.cz" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  info@psychollog.cz
                </a>
              </li>
              <li className="flex items-center">
                <FaGithub className="text-gray-500 dark:text-gray-400 mr-2" />
                <a href="https://github.com/tmsrb24/ai-psycholog" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  GitHub
                </a>
              </li>
              <li className="flex items-center">
                <FaTwitter className="text-gray-500 dark:text-gray-400 mr-2" />
                <a href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {currentYear} AI Psycholog. Všechna práva vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
