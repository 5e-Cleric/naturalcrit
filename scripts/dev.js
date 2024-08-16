'use strict';

import _ from 'lodash';
import vitreum from 'vitreum';
const { pack, livereload, server } = vitreum;
import fs from 'fs-extra';
import Proj from './project.json' assert { type: 'json' };

const label = 'dev';
console.time(label);

// Function to setup watchers
const setupWatchers = async () => {
  try {
    // Set up file watchers for JSX and LESS files
    for (const [name, path] of Object.entries(Proj.apps)) {
      const { bundle, render } = await pack(path, {
        libs: Proj.libs,
        transforms: {
          '.less': async (code, filename) => {
            // Process .less files if needed
            return code; // Return compiled CSS
          },
        },
        dev: ({ bundle, render, ssr }) => {
          // Handle development mode specifics, like updating bundles on file changes
          console.log(`Watching for changes in ${name}...`);
        }
      });

      // Watch the JSX files
      const watchOptions = { libs: Proj.libs, shared: Proj.shared };
      await fs.watch(path, async () => {
        console.log(`File changed in ${name}`);
        await pack(path, watchOptions); // Re-pack on file change
      });
    }

    // Set up file watchers for assets
    await fs.watch('./client', async () => {
      console.log('Asset file changed');
      // Handle asset changes
    });
    await fs.watch('./shared', async () => {
      console.log('Shared file changed');
      // Handle shared file changes
    });

    // Set up livereload server
    livereload('./build'); // Watch the build directory for changes

    // Start the server with file watching
    server('./server.js', {
      port: 8000,
      basepath: '/api',
    });
    
    console.timeEnd(label);
  } catch (err) {
    console.error(err);
  }
};

setupWatchers();
