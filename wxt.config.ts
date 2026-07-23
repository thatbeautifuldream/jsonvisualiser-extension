import { defineConfig, type Plugin } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

/**
 * Chrome's extension loader rejects content-script files containing Unicode
 * noncharacters (e.g. U+FFFF, which CodeMirror uses as an internal sentinel)
 * even though the bytes are valid UTF-8. This plugin rewrites every non-ASCII
 * code point in emitted JS to a `\uXXXX` escape so the runtime string value
 * is preserved while the file stays pure ASCII.
 */
function forceAsciiOutput(): Plugin {
  return {
    name: 'force-ascii-output',
    generateBundle(_opts, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.fileName.endsWith('.js')) continue;
        chunk.code = chunk.code.replace(/[^\x00-\x7F]/g, (ch) => {
          const cp = ch.codePointAt(0);
          if (cp === undefined) return ch;
          if (cp > 0xffff) {
            const high = 0xd800 + Math.floor((cp - 0x10000) / 0x400);
            const low = 0xdc00 + ((cp - 0x10000) % 0x400);
            return `\\u${high.toString(16).padStart(4, '0')}\\u${low.toString(16).padStart(4, '0')}`;
          }
          return `\\u${cp.toString(16).padStart(4, '0')}`;
        });
      }
    },
  };
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'JSON Visualiser',
    description:
      'Replace raw JSON pages with a full editor, tree view, and TypeScript type generator. Works offline.',
    permissions: ['storage'],
  },
  vite: () => ({
    plugins: [tailwindcss(), forceAsciiOutput()],
    esbuild: { charset: 'ascii' },
  }),
});
