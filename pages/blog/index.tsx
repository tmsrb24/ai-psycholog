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
  const { t } = useTranslation(['common']);

  return (
    <Layout title="Blog | AI Psycholog" description="Články a novinky ze světa moderní psychologie.">
      <div className="bg-hero-gradient-dark text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Zajímavosti a novinky ze světa moderní psychologie
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`} className="group block">
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg h-full bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out group-hover:scale-105">
                <div className="flex-shrink-0">
                  <Image
                    className="h-48 w-full object-cover"
                    src={article.image_url || '/images/placeholder.png'}
                    alt={article.title}
                    width={400}
                    height={200}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {article.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={article.published_at}>
                        {new Date(article.published_at).toLocaleDateString('cs-CZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                      <span className="mx-1">&middot;</span>
                      <span>{article.author}</span>
                    </div>
                  </div>
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
    .select('id, title, slug, excerpt, image_url, published_at, author')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles for blog index:', error);
  }

  return {
    props: {
      articles: articles || [],
      ...(await serverSideTranslations(locale ?? 'cs', ['common'])),
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  };
};

export default BlogIndexPage;
