import React from 'react';
import Image from 'next/image';
import Layout from '../../components/Layout';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { supabase } from '../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  published_at: string;
  author: string;
};

type PageProps = {
  article: Article;
};

const ArticlePage = ({ article }: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (!article) {
    return (
      <Layout title="Chyba">
        <div className="text-center py-20">Článek nenalezen.</div>
      </Layout>
    );
  }

  return (
    <Layout title={`${article.title} | Blog`} description={article.content.substring(0, 150)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span>Publikováno {new Date(article.published_at).toLocaleDateString('cs-CZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</span>
              <span className="mx-2">&middot;</span>
              <span>Autor: {article.author}</span>
            </div>
          </header>

          {article.image_url && (
            <div className="mb-8">
              <Image
                src={article.image_url}
                alt={article.title}
                width={1200}
                height={600}
                className="w-full h-auto rounded-lg shadow-lg object-cover"
                priority
              />
            </div>
          )}

          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { data, error } = await supabase.from('articles').select('slug');
  if (error) {
    console.error('Error fetching slugs for blog paths:', error);
  }
  const paths = data?.map((article) => ({
    params: { slug: article.slug },
  })) || [];

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<PageProps, { slug: string }> = async ({ params, locale }) => {
  const slug = params?.slug;
  if (!slug) {
    return { notFound: true };
  }

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !article) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return { notFound: true };
  }

  return {
    props: {
      article,
      ...(await serverSideTranslations(locale ?? 'cs', ['common'])),
    },
    revalidate: 60,
  };
};

export default ArticlePage;
