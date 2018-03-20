/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const siteConfig = require(process.cwd() + '/siteConfig.js');
const CompLibrary = require('../../core/CompLibrary.js');
const MarkdownBlock = CompLibrary.MarkdownBlock;
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;


function imgUrl(img) {
  return siteConfig.baseUrl + 'img/' + img;
}

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const ProjectTitle = props => (
  <h2 className="projectTitle">
    <img className="Logo" src={imgUrl('logo-white.png')} alt={siteConfig.projectName} />
    <small>{siteConfig.tagline}</small>
  </h2>
);

const Chat = () => (
  <div className="Chat">
    <div className="Chat-loading">
      <img src={imgUrl('loading.gif')} alt="loading chat" />
    </div>
  </div>
);

const Block = props => (
  <Container
    padding={['bottom', 'top']}
    id={props.id}
    background={props.background}
  >
    <GridBlock align="center" contents={props.children} layout={props.layout} />
  </Container>
);

const Features = props => (
  <Block layout="fourColumn">
    {[
      {
        title: 'Simple',
        content: 'A complete framework to build quickly a smart chatbot, ideal for what you need.',
        image: imgUrl('icons/simple.png'),
        imageAlign: 'top',
      },
      {
        title: 'Rule-based',
        content: 'Write a conversation as if it were a cake recipe. The rules defined can be very simple to very complex.',
        image: imgUrl('icons/rules.png'),
        imageAlign: 'top',
      },
      {
        title: 'Browser & Node',
        content: 'Use directly on your website, no dependencies. You can also integrate with your back-end and database.',
        image: imgUrl('icons/platforms.png'),
        imageAlign: 'top',
      },
    ]}
  </Block>
);

const FeatureCallout = props => (
  <div
    className="productShowcaseSection paddingBottom"
    style={{textAlign: 'center'}}>
    <img alt="Extensions" src={imgUrl('icons/extensible.png')} style={{ width: 80 }} />
    <h2>Extensible</h2>
    <MarkdownBlock>
      Enhance your bot with user interactions, data validations and custom input types.
      Available ready extensions set.
    </MarkdownBlock>
  </div>
);

const LearnHow = props => (
  <Block background="light">
    {[
      {
        title: 'Ready UI',
        content: 'Build custom Chat interfaces with YveBot UI.<br />Avatars, textarea autosize, quick replies buttons, typing animation and more.',
        image: imgUrl('gifs/ui.gif'),
        imageAlign: 'right',
      },
    ]}
  </Block>
);

const Integrations = props => (
  <Block>
    {[
      {
        title: 'Integrations',
        content: 'Plug your bot with any messanger platform.<br />Facebook, Telegram, Slack and others.',
        image: imgUrl('gifs/facebook.gif'),
        imageAlign: 'left',
      },
    ]}
  </Block>
);

const Description = props => (
  <Block background="light">
    {[
      {
        title: 'Ready for you',
        content: 'Perfect to help and understand your users.<br />Ideal for customer service and form filling.',
        image: imgUrl('gifs/customer.png'),
        imageAlign: 'right',
      },
    ]}
  </Block>
);

class Index extends React.Component {
  render() {
    let language = this.props.language || '';

    return (
      <div>
        <SplashContainer>
          <div className="inner">
            <ProjectTitle />
            <Chat />
          </div>
        </SplashContainer>

        <div className="mainContainer">
          <Features />
          <FeatureCallout />
          <LearnHow />
          <Integrations />
          <Description />
        </div>
      </div>
    );
  }
}

module.exports = Index;
