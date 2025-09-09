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
  ogImage?: string;
  canonicalUrl?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Psychollog',
  description = 'Moderní psychologická podpora s využitím umělé inteligence. Dostupná kdykoliv a kdekoliv.',
  ogImage = 'https://www.psychollog.cz/images/og-image.png', // Default OG image
  canonicalUrl = 'https://www.psychollog.cz'
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
        <meta name="keywords" content="AI psycholog, psychologická podpora, duševní zdraví, terapie, online psycholog, chatbot" />
        <meta name="author" content="Psychollog.cz" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={ogImage} />
        
        {/* Favicon links */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563EB" /> {/* Tailwind blue-600 */}
        <link rel="icon" href="/favicon.ico" /> {/* Fallback favicon */}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://www.psychollog.cz/",
            "name": "Psychollog",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.psychollog.cz/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Psychollog",
            "url": "https://www.psychollog.cz/",
            "logo": "https://www.psychollog.cz/images/hero-avatar.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "info@psychollog.cz",
              "contactType": "Customer Service"
            }
          }) }}
        />
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
