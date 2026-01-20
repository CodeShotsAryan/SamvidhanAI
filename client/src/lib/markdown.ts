
export function renderMarkdown(text: string): string {
    if (!text) return '';

    let html = text;

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    html = html.replace(/\n/g, '<br />');

    return html;
}
