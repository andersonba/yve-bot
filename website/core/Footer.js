/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc) {
    const language = null;
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
  }

  pageUrl(doc) {
    const language = null;
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? language + '/' : '') + doc;
  }

  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('getting-started.html')}>
              Getting Started
            </a>
            <a href={this.docUrl('building-rules.html')}>
              Guides
            </a>
            <a href={this.docUrl('api-rule.html')}>
              API Reference
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a href={this.docUrl('playground.html')}>
              Playground
            </a>
            <a href="https://twitter.com/andersonbacom" target="_blank">
              Twitter
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href="https://github.com/andersonba/yve-bot">GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/andersonba/yve-bot/stargazers"
              data-show-count={true}
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub">
              Star
            </a>
          </div>
        </section>

        <section className="copyright">
          Made with ♥ by <a href="https://andersonba.com">andersonba</a>
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
