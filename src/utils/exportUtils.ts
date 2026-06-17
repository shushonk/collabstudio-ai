import { Document, Section } from "../types";

export const Exporter = {
  toMarkdown: (doc: Document) => {
    let md = `# ${doc.title}\n\n`;
    doc.sections.forEach(sec => {
      md += `## ${sec.title}\n\n${sec.content}\n\n`;
    });
    return md;
  },

  toHTML: (doc: Document) => {
    let html = `<html><head><title>${doc.title}</title><style>body{font-family:sans-serif;line-height:1.6;max-width:800px;margin:2rem auto;padding:0 1rem; color:#334155;} h1{color:#1e293b;} h2{border-bottom:1px solid #e2e8f0;padding-bottom:0.5rem;margin-top:2rem;}</style></head><body>`;
    html += `<h1>${doc.title}</h1>`;
    doc.sections.forEach(sec => {
      html += `<section><h2>${sec.title}</h2><p style="white-space:pre-wrap;">${sec.content}</p></section>`;
    });
    html += `</body></html>`;
    return html;
  },

  toTXT: (doc: Document) => {
    let txt = `${doc.title.toUpperCase()}\n${'='.repeat(doc.title.length)}\n\n`;
    doc.sections.forEach(sec => {
      txt += `[${sec.title.toUpperCase()}]\n${sec.content}\n\n`;
    });
    return txt;
  },

  toJSON: (doc: Document) => {
    return JSON.stringify(doc, null, 2);
  },

  download: (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};
