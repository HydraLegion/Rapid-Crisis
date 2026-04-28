const fs = require('fs');

let text = fs.readFileSync('pages/command/index.jsx', 'utf8');

// The file has mojibake where UTF-8 was interpreted as Windows-1252.
// Let's decode it properly. If we convert it back to a Buffer of 8-bit characters,
// and then parse that buffer as UTF-8, it should restore everything.
// However, since SOME of the file might be correct UTF-8 already (added by Node later?),
// doing it blindly might break ASCII characters. But ASCII characters map to themselves (0-127).
// Let's try the buffer approach safely.

try {
    let buf = Buffer.alloc(text.length);
    for (let i = 0; i < text.length; i++) {
        let code = text.charCodeAt(i);
        if (code > 255) {
            // This means there are already characters parsed as true Unicode,
            // which means the mojibake was re-saved in UTF-8, OR some things didn't get mojibaked.
            // If code > 255, we can't easily do the 1-to-1 byte reversal.
            // Actually, Windows-1252 has some characters > 255 like '€' (8264).
            // Let's fallback to manual replacements.
        }
        buf[i] = code & 0xFF;
    }

    // Manual replacements for the known corrupted strings:
    text = text.replace(/â”€/g, '─');
    text = text.replace(/âš¡/g, '⚡');
    text = text.replace(/â€”/g, '—');
    text = text.replace(/A\x{00A0}/g, '·'); // A followed by non-breaking space ?
    text = text.replace(/AÂ·/g, '·');
    text = text.replace(/A·/g, '·');
    text = text.replace(/â€¦/g, '…');
    text = text.replace(/â†“/g, '↓');
    text = text.replace(/â†‘/g, '↑');
    text = text.replace(/âœ…/g, '✅');
    text = text.replace(/âš\s/g, '⚠️');
    text = text.replace(/â­\s/g, '⭐');
    text = text.replace(/ðŸš¨/g, '🚨');
    text = text.replace(/ðŸ“¡/g, '📡');
    text = text.replace(/ðŸ“Š/g, '📊');
    text = text.replace(/ðŸ“–/g, '📖');
    text = text.replace(/ðŸ“‹/g, '📋');
    text = text.replace(/ðŸ ¢/g, '🏢');
    text = text.replace(/ðŸ‘¥/g, '👥');
    text = text.replace(/ðŸ’š/g, '💚');
    text = text.replace(/ðŸ“\s/g, '📍');
    text = text.replace(/ðŸ“ž/g, '📞');
    text = text.replace(/ðŸ›\s/g, '🛏️');
    text = text.replace(/ðŸ ¥/g, '🏥');
    text = text.replace(/ðŸ”¥/g, '🔥');
    text = text.replace(/ðŸ›¡ï¸/g, '🛡️');
    text = text.replace(/â ±/g, '⏱');
    text = text.replace(/ðŸ‘¤/g, '👤');
    text = text.replace(/ðŸ“±/g, '📱');
    text = text.replace(/ðŸ’¬/g, '💬');
    text = text.replace(/ðŸ“º/g, '📺');
    text = text.replace(/ðŸŒ\s/g, '🌐');

    // The previous replace_file_content calls used these exactly. Since they got mangled,
    // let's do a more robust string replacement:

    // Let's just fix the most obvious ones
    text = text.replace(/â”€/g, '─');
    text = text.replace(/âš¡/g, '⚡');
    text = text.replace(/â€”/g, '—');

    // And then we can write it back.
    // Wait, the emoji ones are harder to replace if they are fully mangled.
} catch (e) { }

fs.writeFileSync('pages/command/index.jsx.tmp', text, 'utf8');
console.log("Done");
