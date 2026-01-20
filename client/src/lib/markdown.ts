/**
 * Simple markdown-to-HTML converter for legal responses
 * Handles: **bold**, *italic*, and basic formatting
 */
export function renderMarkdown(text: string): string {
    if (!text) return '';

    let html = text;

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert line breaks to <br>
    html = html.replace(/\n/g, '<br />');

    return html;
}
