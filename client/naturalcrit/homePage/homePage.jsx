import React from 'react';
import _ from 'lodash';
import cx from 'classnames';

import NaturalCritSVG from '../../../shared/naturalcrit/svg/naturalcrit.svg.jsx';
import HomebrewSVG from '../../../shared/naturalcrit/svg/homebrew.svg.jsx';
import TPKSVG from '../../../shared/naturalcrit/svg/tpk.svg.jsx';
import BadgeSVG from '../../../shared/naturalcrit/svg/badge.svg.jsx';

const HomePage = ({
    tools = [
        {
            id: 'homebrew',
            path: 'https://homebrewery.naturalcrit.com',
            name: 'The Homebrewery',
            icon: <HomebrewSVG />,
            desc: 'Make authentic-looking D&D homebrews using Markdown',

            show: true,
            beta: false,
        },
        {
            id: 'badges',
            path: 'https://naturalcrit.com/badges',
            name: 'Achievement Badges',
            icon: <BadgeSVG />,
            desc: 'Create simple badges to award your players',

            show: true,
            beta: false,
        },
        {
            id: 'tpk',
            path: 'http://tpk.naturalcrit.com',
            name: 'Total Player Knoller',
            icon: <TPKSVG />,
            desc: 'Effortless custom character sheets',

            show: false,
            beta: true,
        },
    ],
}) => {
    const renderTool = (tool) => {
        if (!tool.show) return null;

        return (
            <a
                href={tool.path}
                className={cx('tool', tool.id, { beta: tool.beta })}
                key={tool.id}
            >
                <div className="content">
                    {tool.icon}
                    <h2>{tool.name}</h2>
                    <p>{tool.desc}</p>
                </div>
            </a>
        );
    };

    const renderTools = () => {
        return _.map(tools, (tool) => renderTool(tool));
    };

    return (
        <div className="homePage">
            <div className="top">
                <div className="logo">
                    <NaturalCritSVG />
                    <span className="name">
                        Natural
                        <span className="crit">Crit</span>
                    </span>
                </div>
                <p>Top-tier tools for the discerning DM</p>
            </div>
            <div className="tools">{renderTools()}</div>
        </div>
    );
};

export default HomePage;
