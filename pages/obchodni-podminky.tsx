import React from 'react';
import Layout from '../components/layouts/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';

type PageProps = {};

const TermsAndConditionsPage = (_props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(['terms', 'common']);

  return (
    <Layout title={t('pageTitle')} description={t('pageDescription')}>
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('header.title')}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t('header.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose dark:prose-invert">
        <h2>{t('sections.0.title')}</h2>
        <p>{t('sections.0.content.0')}</p>
        <p>{t('sections.0.content.1')}</p>
        
        <h2>{t('sections.1.title')}</h2>
        <p>{t('sections.1.content.0')}</p>
        <p>{t('sections.1.content.1')}</p>

        <h2>{t('sections.2.title')}</h2>
        <p>{t('sections.2.content.0')}</p>
        <p>{t('sections.2.content.1')}</p>

        <h2>{t('sections.3.title')}</h2>
        <p>{t('sections.3.content.0')}</p>
        <p>{t('sections.3.content.1')}</p>

        <h2>{t('sections.4.title')}</h2>
        <p>{t('sections.4.content.0')}</p>
        <p>{t('sections.4.content.1')}</p>
        <p><strong>{t('sections.4.content.2')}</strong></p>

        <h2>{t('sections.5.title')}</h2>
        <p>{t('sections.5.content.0')}</p>

        <h2>{t('sections.6.title')}</h2>
        <p>{t('sections.6.content.0')}</p>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'cs', ['terms', 'common'])),
  },
});

export default TermsAndConditionsPage;
