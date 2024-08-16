import React, { useState, useCallback } from 'react';
import cx from 'classnames';
import { SliderPicker } from 'react-color';
import _ from 'lodash';

const Controls = ({
    data = { title: '', text: '', color: '#2b4486', rawSVG: '' },
    onChange = () => {},
}) => {
    const [hover, setHover] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const files = e.target.files || e.dataTransfer.files;
        const reader = new FileReader();
        reader.onload = (e) => {
            handleChange('rawSVG', e.target.result);
        };
        reader.readAsText(files[0]);
        setHover(false);
    }, []);

    const handleHover = useCallback((e, val) => {
        e.preventDefault();
        setHover(val);
    }, []);

    const handleChange = useCallback(
        (path, val) => {
            const updatedData = { ...data };
            updatedData[path] = val;

            onChange(updatedData);
        },
        [data, onChange]
    );

    return (
        <div className="controls">
            <div className="field">
                <label>Title</label>
                <input
                    type="text"
                    className="value"
                    value={data.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                />
            </div>
            <div className="field">
                <label>Text</label>
                <textarea
                    className="value"
                    rows={3}
                    value={data.text}
                    onChange={(e) => handleChange('text', e.target.value)}
                />
            </div>
            <div className="field">
                <label>Color</label>
                <SliderPicker
                    className="value"
                    disableAlpha
                    color={data.color}
                    onChange={(colorObj) => handleChange('color', colorObj.hex)}
                />
            </div>
            <div className="field svg">
                <label>SVG</label>
                <div className="value">
                    <div
                        className={cx('dropZone', { hover })}
                        onDragOver={(e) => handleHover(e, true)}
                        onDragLeave={(e) => handleHover(e, false)}
                        onDrop={handleDrop}
                    >
                        <i className="fa fa-arrow-down" />
                        <p>Drop SVG here</p>
                    </div>
                    <input type="file" onChange={handleDrop} />
                    <p>
                        Download an icon from{' '}
                        <a href="https://thenounproject.com/">
                            The Noun Project
                        </a>
                        , then drag and drop it here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Controls;
