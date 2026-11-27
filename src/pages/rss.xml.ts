// The feed, written by hand: a few dozen items are not worth a dependency. It
// is in reading order - the essays are chapters, not posts - and each item
// carries the date its essay was first published (frontmatter `date`).
//
// The guid is the essay's frontmatter `id`, not its address: the address
// carries the number, which is the place in reading order and moves when an
// essay is added before it (AGENTS.md). A guid that moved with it told every
// feed reader that each renumbered essay was a new one. So the guid is a tag
// URI of the id (isPermaLink="false"), the link is the address of today.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const guid = (id: string) => `tag:abap2ui5.github.io,2026:docs-insights/${id}`;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL;
  const root = new URL(base, site).href;
  const essays = (await getCollection("essays")).sort((a, b) => a.data.number - b.data.number);
  const items = essays
    .map(
      (e) => `    <item>
      <title>${esc(`#${e.data.number} ${e.data.title}`)}</title>
      <link>${root}${e.id}/</link>
      <guid isPermaLink="false">${guid(e.data.id)}</guid>
      <pubDate>${e.data.date.toUTCString()}</pubDate>
      <description>${esc(e.data.description ?? e.data.blurb)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>abap2UI5 Insights</title>
    <link>${root}</link>
    <atom:link href="${root}rss.xml" rel="self" type="application/rss+xml"/>
    <description>Short essays about one idea: what happens when the ABAP server sends the screen instead of only the data.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
