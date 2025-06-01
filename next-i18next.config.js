/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'cs',
    locales: ['cs', 'en', 'uk'],
  },
  // Optional: react-i18next options
  // react: { useSuspense: false }
  // Optional: reload on change in dev mode
  reloadOnPrerender: process.env.NODE_ENV === 'development', // Odkomentováno pro jistotu
  // Optional: locale path
  localePath: require('path').resolve('./public/locales'), // Odkomentováno a upraveno
};
