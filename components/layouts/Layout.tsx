import React, { ReactNode, useState } from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import WidgetChatButton from '../chat/WidgetChatButton';
import WidgetChatWindow from '../chat/WidgetChatWindow';
import CookieConsentBanner from '../ui/CookieConsentBanner';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'AI Psycholog - Psychologická podpora s umělou inteligencí',
  description = 'Moderní psychologická podpora s využitím umělé inteligence. Dostupná kdykoliv a kdekoliv.'
}) => {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const toggleWidget = () => {
    setIsWidgetOpen(!isWidgetOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon links */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563EB" /> {/* Tailwind blue-600 */}
        <link rel="icon" href="/favicon.ico" /> {/* Fallback favicon */}
      </Head>
      
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />

      {/* FAQ Chat Widget */}
      <WidgetChatButton onClick={toggleWidget} isOpen={isWidgetOpen} />
      <WidgetChatWindow isOpen={isWidgetOpen} onClose={toggleWidget} />
      <CookieConsentBanner />
    </div>
  );
};

export default Layout;
