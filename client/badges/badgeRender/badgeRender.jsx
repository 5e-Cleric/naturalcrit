import React, { useEffect, useRef, useCallback } from 'react';
import _ from 'lodash';
import renderBadgeTemplate from './badgeTemplate';

const replaceAll = (text, target, str) =>
    text.replace(new RegExp(target, 'g'), str);

const BadgeRender = ({
    title = '',
    text = '',
    rawSVG = '',
    color = '#333',
}) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const clearCanvas = useCallback(() => {
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }, []);

    const readyFrame = useCallback((color) => {
        return new Promise((resolve) => {
            const frame = new Image();
            frame.src = `data:image/svg+xml;base64,${btoa(
                renderBadgeTemplate(color)
            )}`;
            frame.onload = () => resolve(frame);
        });
    }, []);

    const readyIconSVG = useCallback((props) => {
        return new Promise((resolve) => {
            if (!props.rawSVG) return resolve();
            const icon = new Image();
            let svg = props.rawSVG || '';
            if (svg.indexOf('style=') === -1) {
                svg = _.reduce(
                    [
                        'path',
                        'rect',
                        'polygon',
                        'circle',
                        'polyline',
                        'ellipse',
                    ],
                    (acc, type) => {
                        return replaceAll(
                            acc,
                            `<${type}`,
                            `<${type} style="fill:${props.color}"`
                        );
                    },
                    svg
                );
            }
            svg = svg.replace(/<text.*<\/text>/, '');
            icon.onload = () => resolve(icon);
            icon.src = `data:image/svg+xml;base64,${btoa(svg)}`;
        });
    }, []);

    const drawSVG = useCallback(
        (props) => {
            return Promise.all([
                readyFrame(props.color),
                readyIconSVG(props),
            ]).then(([frame, icon]) => {
                clearCanvas();
                const ctx = ctxRef.current;
                if (frame) ctx.drawImage(frame, 0, 0);
                if (icon) {
                    const scale = 1.1;
                    const newWidth = icon.width * scale;
                    const newHeight = icon.height * scale;
                    ctx.drawImage(
                        icon,
                        150 - newWidth / 2,
                        120 - newWidth / 2,
                        newWidth,
                        newHeight
                    );
                }
            });
        },
        [clearCanvas, readyFrame, readyIconSVG]
    );

    const drawTitle = useCallback((title) => {
        const ctx = ctxRef.current;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        const trySize = (font) => {
            ctx.font = `${font}px Calluna`;
            const length = ctx.measureText(title).width;
            if (length >= 230) return trySize(font - 1);
            return font;
        };
        const finalSize = trySize(35);
        ctx.fillText(title, 150, 220);
    }, []);

    const drawText = useCallback((text) => {
        const ctx = ctxRef.current;
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Calluna';
        ctx.fillStyle = '#000';

        const lines = _.reduce(
            text.split(' '),
            (acc, word) => {
                const currLine = _.last(acc);
                const length = ctx.measureText(
                    `${currLine.join(' ')} ${word}`
                ).width;
                if (length >= canvasRef.current.width - 30) {
                    acc.push([word]);
                } else {
                    currLine.push(word);
                }
                return acc;
            },
            [[]]
        );

        _.each(lines, (line, index) => {
            ctx.fillText(line.join(' '), 15, 315 + index * 20);
        });
    }, []);

    const drawAttribution = useCallback((svg) => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        ctx.textAlign = 'left';
        ctx.font = '9px Open Sans';
        ctx.fillStyle = '#bbb';
        let maxDepth = 95;

        const check = svg.match(/<text.*<\/text>/);
        if (check && check.length) {
            const a = check[0].indexOf('Created by ') + 11;
            const b = check[0].indexOf('</text>');
            const author = check[0].substr(a, b - a);

            const width = ctx.measureText(`Icon by ${author}`).width;
            maxDepth = _.max([maxDepth, width + 3]);
            ctx.fillText(
                `Icon by ${author}`,
                canvas.width - maxDepth,
                canvas.height - 17
            );
        }
        ctx.fillText(
            `Made with NaturalCrit`,
            canvas.width - maxDepth,
            canvas.height - 7
        );
    }, []);

    const drawBadge = useCallback(
        (props) => {
            const height = props.text ? 400 : 320;
            if (canvasRef.current.height !== height)
                canvasRef.current.height = height;
            drawSVG(props).then(() => {
                drawTitle(props.title);
                drawText(props.text);
                drawAttribution(props.rawSVG);
            });
        },
        [drawSVG, drawTitle, drawText, drawAttribution]
    );

    useEffect(() => {
        ctxRef.current = canvasRef.current.getContext('2d');
        drawBadge({ title, text, rawSVG, color });
    }, [title, text, rawSVG, color, drawBadge]);

    const handleDownload = () => {
        const target = document.createElement('a');
        const name = title ? _.snakeCase(title) : 'badge';
        target.download = `${name}.png`;
        target.href = canvasRef.current
            .toDataURL('image/png')
            .replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        target.click();
    };

    return (
        <div className="badgeRender">
            <canvas ref={canvasRef} width={300} height={320} />
            <div>
                <button onClick={handleDownload}>
                    <i className="fa fa-download" />
                    Download
                </button>
            </div>
        </div>
    );
};

export default BadgeRender;
