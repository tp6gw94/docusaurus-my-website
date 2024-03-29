// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');

const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Sheng Tai',
  tagline: '',
  url: 'https:/www.shengtai.me',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'tp6gw94', // Usually your GitHub org/user name.
  projectName: 'my-website', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hant',
    locales: ['zh-Hant'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-R3CLZGQXSG',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Sheng Tai',
        // logo: {
        //   alt: 'My Site Logo',
        //   src: 'img/logo.svg',
        // },
        items: [
          {
            type: 'doc',
            docId: 'about-digital-garden',
            position: 'left',
            label: 'Digital Garden',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: '/cv',
            label: 'CV',
            position: 'left',
          },
          {
            href: 'https://github.com/tp6gw94',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      // footer: {

      //   style: 'dark',
      //   links: [
      //     {
      //       title: 'Docs',
      //       items: [
      //         {
      //           label: 'Tutorial',
      //           to: '/docs/intro',
      //         },
      //       ],
      //     },
      //     {
      //       title: 'Community',
      //       items: [
      //         {
      //           label: 'Stack Overflow',
      //           href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //         },
      //         {
      //           label: 'Discord',
      //           href: 'https://discordapp.com/invite/docusaurus',
      //         },
      //         {
      //           label: 'Twitter',
      //           href: 'https://twitter.com/docusaurus',
      //         },
      //       ],
      //     },
      //     {
      //       title: 'More',
      //       items: [
      //         {
      //           label: 'Blog',
      //           to: '/blog',
      //         },
      //         {
      //           label: 'GitHub',
      //           href: 'https://github.com/facebook/docusaurus',
      //         },
      //       ],
      //     },
      //   ],
      //   copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      // },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  plugins: [
    [require.resolve('docusaurus-lunr-search'), { indexBaseUrl: true }],
  ],
};

module.exports = config;
