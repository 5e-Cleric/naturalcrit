import fs from 'fs-extra';
import _ from 'lodash';
import vitreum from 'vitreum';
const { pack, livereload, server } = vitreum;
import Proj from './project.json' assert { type: 'json' };

const label = 'build';
console.time(label);

const clean = async () => {
  // Implement your own cleaning logic if needed
  // e.g., fs.remove('./build');
};

const processApps = async () => {
  // This assumes you need to bundle each app separately and process CSS and assets
  for (const [name, path] of Object.entries(Proj.apps)) {
    // Pack the React component
    const { bundle, render } = await pack(path, {
      libs: Proj.libs,
      transforms: {
        '.less': async (code, filename) => {
          // Process .less files here
          // You may need to use a library like `less` to compile .less to CSS
          return code; // Return the compiled CSS
        },
      },
    });

    // Save the bundled JavaScript
    await fs.outputFile(`./build/${name}.bundle.js`, bundle);

    // Save the rendered HTML
    const htmlContent = render({}); // Adjust props as needed
    await fs.outputFile(`./build/${name}.html`, htmlContent);
  }
};

const processAssets = async () => {
  // Implement asset processing
  // For example, copy assets to the build directory
  await Promise.all(Proj.assets.map(assetPath =>
    fs.copy(assetPath, `./build/${assetPath}`)
  ));
};

const build = async () => {
  try {
    await clean();
    await processApps();
    await processAssets();
    console.timeEnd(label);
  } catch (err) {
    console.error(err);
  }
};

build();
