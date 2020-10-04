import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

require('dotenv').config();

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'styles/main.scss',
  // globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null,
      baseUrl: 'https://polls.pizza/',
      dir: 'dist/www',
      prerenderConfig: './prerender.config.ts',
      copy: [{ src: '../public', dest: '.' }],
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ['styles/include/vars.scss'],
    }),
  ],
};
