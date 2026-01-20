

export function renderMarkdown(text: string): string {
    if (!text) return '';

    let html = text;

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Make citations clickable anchor links
    html = html.replace(/\[(\d+)\]/g, '<a href="#citation-$1" class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded mx-0.5 cursor-pointer hover:bg-blue-100 transition-colors no-underline" title="View Source [$1]">$1</a>');

    html = html.replace(/\n/g, '<br />');

    return html;
}

