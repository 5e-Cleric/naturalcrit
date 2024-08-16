import React from 'react';
import _ from 'lodash';
import cx from 'classnames';

import NaturalCritSVG from '../../../shared/naturalcrit/svg/naturalcrit.svg.jsx';
import HomebrewSVG from '../../../shared/naturalcrit/svg/homebrew.svg.jsx';

const Main = () => {
  const defaultTools = [
    {
      id: 'homebrew',
      path: 'https://homebrewery.naturalcrit.com',
      name: 'The Homebrewery',
      icon: <HomebrewSVG/>,
      desc: 'Make authentic-looking 5e homebrews using Markdown',
      show: true,
      beta: false,
    },
    {
      id: 'homebrew2',
      path: '/homebrew',
      name: 'The Homebrewery',
      icon: <HomebrewSVG/>,
      desc: 'Make authentic-looking 5e homebrews using Markdown',
      show: false,
      beta: true,
    },
  ];

  const renderTool = (tool) => {
    if (!tool.show) return null;

    return (
      <a href={tool.path} className={cx('tool', tool.id, { beta: tool.beta })} key={tool.id}>
        <div className='content'>
          {tool.icon}
          <h2>{tool.name}</h2>
          <p>{tool.desc}</p>
        </div>
      </a>
    );
  };

  const renderTools = () => {
    return _.map(defaultTools, (tool) => renderTool(tool));
  };

  return (
    <div className='main'>
      <div className='top'>
        <div className='logo'>
          <NaturalCritSVG/>
          <span className='name'>
            Natural<span className='crit'>Crit</span>
          </span>
        </div>
        <p>Top-tier tools for the discerning DM</p>
      </div>
      <div className='tools'>
        {renderTools()}
      </div>
    </div>
  );
};

export default Main;
