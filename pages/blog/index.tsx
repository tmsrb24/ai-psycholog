import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../components/Layout';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { supabase } from '../../lib/supabaseClient';
import { useTranslation } from 'next-i18next';

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  published_at: string;
  author: string;
};

type PageProps = {
  articles: Article[];
};

const BlogIndexPage = ({ articles }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation('common');

  return (
    <Layout title={t('blog.title', 'Blog')} description={t('blog.description', 'Zajímavosti a novinky ze světa moderní psychologie')}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            {t('blog.title', 'Blog')}
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
            {t('blog.description', 'Zajímavosti a novinky ze světa moderní psychologie')}
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`} className="group block bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2">
              <div className="relative h-48 w-full">
                <Image
                  key={article.id}
                  src={article.image_url}
                  alt={article.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {article.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {article.excerpt}
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  <span>{new Date(article.published_at).toLocaleDateString('cs-CZ')}</span>
                  <span className="mx-2">&middot;</span>
                  <span>{article.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<PageProps> = async ({ locale }) => {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles for blog index:', error);
  }

  return {
    props: {
      articles: articles || [],
      ...(await serverSideTranslations(locale ?? 'cs', ['common'])),
    },
    revalidate: 60,
  };
};

export default BlogIndexPage;
