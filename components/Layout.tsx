import React, { ReactNode, useState } from 'react'; // Přidán useState
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import WidgetChatButton from './WidgetChatButton'; // Přidán import
import WidgetChatWindow from './WidgetChatWindow'; // Přidán import

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />

      {/* FAQ Chat Widget */}
      <WidgetChatButton onClick={toggleWidget} isOpen={isWidgetOpen} />
      <WidgetChatWindow isOpen={isWidgetOpen} onClose={toggleWidget} />
    </div>
  );
};

export default Layout;
