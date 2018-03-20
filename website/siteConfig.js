/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const repoUrl = 'https://github.com/andersonba/yve-bot'
const baseUrl = '/yve-bot/';

const siteConfig = {
  title: 'yve-bot' /* title for your website */,
  tagline: 'Smart rule-based bot. For Browser & Node.',
  url: 'https://andersonba.github.io/yve-bot' /* your website url */,
  organizationName: 'andersonba',
  projectName: 'yve-bot',
  headerLinks: [
    {doc: 'getting-started', label: 'Docs'},
    {doc: 'api-rule', label: 'API'},
    {href: repoUrl, label: 'GitHub'},
  ],
  headerIcon: null,
  footerIcon: 'img/logo-white.png',
  favicon: 'img/favicon.png',
  colors: {
    primaryColor: '#665D77',
    secondaryColor: '#F5BE74',
  },
  copyright: 'Copyright © ' + new Date().getFullYear() + ' andersonba',
  highlight: {
    theme: 'default',
  },
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdn.jsdelivr.net/npm/yve-bot@latest/web.js',
    baseUrl + 'js/chat.js',
  ],
  repoUrl,
  baseUrl,
};

module.exports = siteConfig;
