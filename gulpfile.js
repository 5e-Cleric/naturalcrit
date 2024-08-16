"use strict";

import vitreumTasks from 'vitreum/tasks';
import gulp from 'gulp';

const tasks = vitreumTasks(gulp, {
    entryPoints: [
        './client/naturalcrit',
    ],

    DEV: true,
    buildPath: "./build/",
    pageTemplate: "./client/template.dot",
    projectModules: ["./shared/naturalcrit"],
    additionalRequirePaths: ['./shared', './node_modules'],
    assetExts: ["*.svg", "*.png", "*.jpg", "*.pdf", "*.eot", "*.otf", "*.woff", "*.woff2", "*.ico", "*.ttf"],
    serverWatchPaths: ["server"],
    serverScript: "server.js",
    libs: [
        "react",
        "react-dom",
        "lodash",
        "classnames",
        "superagent",
        "pico-router"
    ],
    clientLibs: [],
});

export default tasks;
