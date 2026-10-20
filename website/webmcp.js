// WebMCP: hands an AI agent in the visitor's browser four read-only tools for this page, so it can
// read what X Look does and how to install it without scraping. Every answer is read from the page
// at call time, in the page's own language. Nothing here makes a request.
// Spec (a draft that has already moved once): https://webmachinelearning.github.io/webmcp/

const READ_ONLY = { readOnlyHint: true };
const NO_INPUT = { type: 'object', properties: {} };
const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const language = () => document.documentElement.lang || 'en';
const downloadUrl = () => document.querySelector('[data-download]')?.href || '';

const tools = [
  {
    name: 'describe',
    title: 'What is on this page',
    description:
      "Says what this page is: its language, title, one-line summary, the download link, its sections (id and heading) and the other tools on it; returns { language, title, summary, download_url, sections: [{ id, heading }], tools: [string] }.",
    inputSchema: NO_INPUT,
    annotations: READ_ONLY,
    execute: async () => ({
      language: language(),
      title: text(document.querySelector('h1')),
      summary: text(document.querySelector('.lede')),
      download_url: downloadUrl(),
      sections: Array.from(document.querySelectorAll('main section[id]')).map((s) => ({
        id: s.id,
        heading: text(s.querySelector('h2')),
      })),
      tools: tools.map((t) => t.name),
    }),
  },
  {
    name: 'list_features',
    title: 'List what X Look changes on x.com',
    description:
      "Lists every change the X Look extension makes to x.com, as shown on this page and in its language; returns { language, features: [{ name, detail }] }.",
    inputSchema: NO_INPUT,
    annotations: READ_ONLY,
    execute: async () => ({
      language: language(),
      features: Array.from(document.querySelectorAll('[data-feature]')).map((li) => ({
        name: text(li.querySelector('h3')),
        detail: text(li.querySelector('p')),
      })),
    }),
  },
  {
    name: 'get_install_steps',
    title: 'Get the install steps',
    description:
      "Gives the ordered steps to install X Look in Chrome or another Chromium browser, in the page's language, with the download link; returns { language, download_url, steps: [string] } and installs nothing.",
    inputSchema: NO_INPUT,
    annotations: READ_ONLY,
    execute: async () => ({
      language: language(),
      download_url: downloadUrl(),
      steps: Array.from(document.querySelectorAll('#install .steps li')).map(text),
    }),
  },
  {
    name: 'get_privacy',
    title: 'Get the privacy facts',
    description:
      "Lists what X Look and this website do and do not do with your data, as stated on this page and in its language; returns { language, summary, points: [string] }.",
    inputSchema: NO_INPUT,
    annotations: READ_ONLY,
    execute: async () => ({
      language: language(),
      summary: text(document.querySelector('#privacy .privacy-lede')),
      points: Array.from(document.querySelectorAll('#privacy li')).map(text),
    }),
  },
];

// Silent without the API, and never rejects: the page fires this and walks away.
export async function initWebMcp() {
  const registry = document.modelContext;
  if (!registry || typeof registry.registerTool !== 'function') return [];
  await Promise.all(
    tools.map((tool) =>
      Promise.resolve()
        .then(() => registry.registerTool(tool))
        .catch(() => {}),
    ),
  );
  const held = await Promise.resolve()
    .then(() => registry.getTools())
    .catch(() => []);
  const names = tools.map((t) => t.name);
  return (Array.isArray(held) ? held : []).map((t) => t?.name).filter((n) => names.includes(n));
}

initWebMcp();
