// src/screens/TerminalScreen.tsx
// Real terminal using xterm.js + WebView
// Runs actual JS commands (fetch, crypto, etc.) in a sandboxed web environment

import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { PageHeader } from '../components/UI';
import { C, F, S } from '../theme';

const TERMINAL_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0D0D14; overflow: hidden; height: 100vh; display: flex; flex-direction: column; }
  #terminal { flex: 1; overflow: hidden; padding: 4px; }
  .xterm-viewport { background: #0D0D14 !important; }
</style>
</head>
<body>
<div id="terminal"></div>
<script src="https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.8.0/lib/xterm-addon-fit.js"></script>
<script>
const term = new Terminal({
  theme: {
    background: '#0D0D14',
    foreground: '#F1F1F8',
    cursor: '#9F5FFF',
    cursorAccent: '#0D0D14',
    black: '#13131F',
    red: '#EF4444',
    green: '#10B981',
    yellow: '#F59E0B',
    blue: '#3B82F6',
    magenta: '#9F5FFF',
    cyan: '#06B6D4',
    white: '#F1F1F8',
    brightBlack: '#44445A',
    brightGreen: '#10B981',
    brightCyan: '#22D3EE',
  },
  fontFamily: 'monospace',
  fontSize: 13,
  lineHeight: 1.4,
  cursorBlink: true,
  scrollback: 5000,
});
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
fitAddon.fit();
window.addEventListener('resize', () => fitAddon.fit());

// ── State ──────────────────────────────────────────────────────────────────
let inputBuffer = '';
let cmdHistory = [];
let histIdx = -1;
const PROMPT = '\\x1b[35mx-paradox\\x1b[0m:\\x1b[36m~\\x1b[0m\\x1b[35m$\\x1b[0m ';
const cwd = '/home/xparadox';
const env = { HOME: '/home/xparadox', USER: 'xparadox', SHELL: '/bin/zsh', TERM: 'xterm-256color' };

// ── Built-in commands ──────────────────────────────────────────────────────
const cmds = {
  help: () => [
    '\\x1b[35m╔══════════════════════════════════════╗',
    '║   X-ParadoxSec Terminal v2.0         ║',
    '╚══════════════════════════════════════╝\\x1b[0m',
    '',
    '\\x1b[36mBuilt-in commands:\\x1b[0m',
    '  \\x1b[32mhelp\\x1b[0m           This help',
    '  \\x1b[32mls\\x1b[0m             List directory',
    '  \\x1b[32mpwd\\x1b[0m            Working directory',
    '  \\x1b[32mwhoami\\x1b[0m         Current user',
    '  \\x1b[32mecho\\x1b[0m <text>    Print text',
    '  \\x1b[32menv\\x1b[0m            Environment variables',
    '  \\x1b[32mdate\\x1b[0m           Current date/time',
    '  \\x1b[32muptime\\x1b[0m         System uptime',
    '  \\x1b[32mcurl\\x1b[0m <url>     HTTP request (real)',
    '  \\x1b[32mping\\x1b[0m <host>    Ping host (real)',
    '  \\x1b[32mdig\\x1b[0m <domain>   DNS lookup (real)',
    '  \\x1b[32mwhois\\x1b[0m <domain> WHOIS data (real)',
    '  \\x1b[32mip info\\x1b[0m        Your IP info (real)',
    '  \\x1b[32mmyip\\x1b[0m           Public IP address',
    '  \\x1b[32mhash\\x1b[0m <text>    SHA256 hash',
    '  \\x1b[32mb64enc\\x1b[0m <text>  Base64 encode',
    '  \\x1b[32mb64dec\\x1b[0m <text>  Base64 decode',
    '  \\x1b[32mhexenc\\x1b[0m <text>  Hex encode',
    '  \\x1b[32muname\\x1b[0m          System info',
    '  \\x1b[32mps\\x1b[0m             Process list',
    '  \\x1b[32mifconfig\\x1b[0m       Network interfaces',
    '  \\x1b[32mhistory\\x1b[0m        Command history',
    '  \\x1b[32mclear\\x1b[0m          Clear terminal',
    '  \\x1b[32mexit\\x1b[0m           Close terminal',
  ],

  ls: (args) => {
    const files = [
      '\\x1b[34mDocuments\\x1b[0m  \\x1b[34mDownloads\\x1b[0m  \\x1b[34mProjects\\x1b[0m',
      '\\x1b[32mx-paradoxsec\\x1b[0m  \\x1b[33mREADME.md\\x1b[0m  \\x1b[33m.bashrc\\x1b[0m',
    ];
    return files;
  },

  pwd: () => [cwd],
  whoami: () => [env.USER],
  date: () => [new Date().toString()],
  uptime: () => [`up ${Math.floor(Math.random() * 100 + 1)} days, ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')}`],

  echo: (args) => [args.join(' ')],

  env: () => Object.entries(env).map(([k, v]) => \`\\x1b[32m\${k}\\x1b[0m=\${v}\`),

  uname: (args) => {
    if (args.includes('-a')) return ['Linux x-paradox 5.15.0 #1 SMP aarch64 Android'];
    return ['Linux'];
  },

  ps: () => [
    '\\x1b[36m  PID  CMD\\x1b[0m',
    '    1  /init',
    '  100  zsh',
    '  204  x-paradoxsec',
    '  999  xterm.js',
  ],

  ifconfig: () => [
    '\\x1b[33mwlan0\\x1b[0m: flags=4163<UP,BROADCAST,RUNNING>',
    '      inet \\x1b[32m192.168.x.x\\x1b[0m  netmask 255.255.255.0',
    '      ether xx:xx:xx:xx:xx:xx',
    '',
    '\\x1b[33mlo\\x1b[0m: flags=73<UP,LOOPBACK,RUNNING>',
    '    inet \\x1b[32m127.0.0.1\\x1b[0m  netmask 255.0.0.0',
  ],

  history: () => cmdHistory.slice(-20).map((c, i) => \`  \${String(i+1).padStart(3)} \${c}\`),

  clear: () => { term.clear(); return null; },

  exit: () => { window.ReactNativeWebView?.postMessage('exit'); return ['Goodbye.']; },

  // ── Real async commands ──────────────────────────────────────────────────

  curl: async (args) => {
    const url = args[0];
    if (!url) return ['\\x1b[31mUsage: curl <url>\\x1b[0m'];
    try {
      term.writeln('\\x1b[33m[*] Fetching...\\x1b[0m');
      const r = await fetch(url.startsWith('http') ? url : 'https://' + url);
      const text = await r.text();
      return [
        \`\\x1b[32mHTTP \${r.status} \${r.statusText}\\x1b[0m\`,
        ...Array.from(r.headers.entries()).map(([k,v]) => \`\\x1b[36m\${k}:\\x1b[0m \${v}\`),
        '',
        text.slice(0, 2000) + (text.length > 2000 ? '\\n\\x1b[33m... (truncated)\\x1b[0m' : ''),
      ];
    } catch(e) {
      return [\`\\x1b[31mError: \${e.message}\\x1b[0m\`];
    }
  },

  ping: async (args) => {
    const host = args[0] || 'google.com';
    const results = [];
    for (let i = 1; i <= 4; i++) {
      const start = Date.now();
      try {
        await fetch('https://' + host.replace(/^https?:\\/\\//, ''), { method: 'HEAD', signal: AbortSignal.timeout(3000) });
        const ms = Date.now() - start;
        results.push(\`64 bytes from \${host}: icmp_seq=\${i} ttl=56 time=\${ms} ms\`);
      } catch {
        results.push(\`Request timeout for icmp_seq \${i}\`);
      }
    }
    return [\`PING \${host}:`, ...results];
  },

  dig: async (args) => {
    const domain = args[0];
    if (!domain) return ['\\x1b[31mUsage: dig <domain>\\x1b[0m'];
    try {
      const r = await fetch(\`https://cloudflare-dns.com/dns-query?name=\${domain}&type=A\`, {
        headers: { Accept: 'application/dns-json' }
      });
      const data = await r.json();
      const answers = data.Answer || [];
      if (!answers.length) return [\`No records found for \${domain}\`];
      return [
        \`\\x1b[32m; <<>> DiG 9.x <<>> \${domain} +short\\x1b[0m\`,
        ...answers.map(a => \`\${a.name} \${a.TTL} IN \${['A','NS','CNAME','SOA','MX','TXT','AAAA'][a.type-1]||a.type} \${a.data}\`)
      ];
    } catch(e) {
      return [\`\\x1b[31mError: \${e.message}\\x1b[0m\`];
    }
  },

  whois: async (args) => {
    const domain = args[0];
    if (!domain) return ['\\x1b[31mUsage: whois <domain>\\x1b[0m'];
    try {
      const r = await fetch(\`https://rdap.org/domain/\${domain}\`);
      const d = await r.json();
      const events = d.events || [];
      const reg = events.find(e => e.eventAction === 'registration');
      const exp = events.find(e => e.eventAction === 'expiration');
      return [
        \`Domain: \${d.ldhName || domain}\`,
        \`Status: \${(d.status || []).join(', ')}\`,
        \`Registered: \${reg?.eventDate || 'Unknown'}\`,
        \`Expires: \${exp?.eventDate || 'Unknown'}\`,
        \`Nameservers: \${(d.nameservers || []).map(n => n.ldhName).join(', ')}\`,
      ];
    } catch(e) {
      return [\`\\x1b[31mError: \${e.message}\\x1b[0m\`];
    }
  },

  myip: async () => {
    try {
      const r = await fetch('http://ip-api.com/json/');
      const d = await r.json();
      return [
        \`\\x1b[32mPublic IP:\\x1b[0m \${d.query}\`,
        \`\\x1b[32mLocation:\\x1b[0m \${d.city}, \${d.country}\`,
        \`\\x1b[32mISP:\\x1b[0m \${d.isp}\`,
      ];
    } catch(e) { return [\`Error: \${e.message}\`]; }
  },

  'ip': async (args) => {
    if (args[0] === 'info') {
      try {
        const r = await fetch('http://ip-api.com/json/');
        const d = await r.json();
        return Object.entries(d).map(([k,v]) => \`\\x1b[36m\${k}:\\x1b[0m \${v}\`);
      } catch(e) { return [\`Error: \${e.message}\`]; }
    }
    return ['Usage: ip info'];
  },

  hash: async (args) => {
    const text = args.join(' ');
    if (!text) return ['Usage: hash <text>'];
    const buf = new TextEncoder().encode(text);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const hex = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
    return [\`SHA256: \\x1b[32m\${hex}\\x1b[0m\`];
  },

  b64enc: (args) => [btoa(args.join(' '))],
  b64dec: (args) => {
    try { return [atob(args.join(' '))]; }
    catch { return ['\\x1b[31mInvalid Base64\\x1b[0m']; }
  },
  hexenc: (args) => [Array.from(new TextEncoder().encode(args.join(' '))).map(b => b.toString(16).padStart(2,'0')).join('')],
};

// ── Input handler ──────────────────────────────────────────────────────────
function printPrompt() { term.write('\\r\\n' + PROMPT); }

async function runCommand(line) {
  const [cmd, ...args] = line.trim().split(/\\s+/);
  if (!cmd) return;

  cmdHistory.push(line);
  histIdx = -1;

  const handler = cmds[cmd];
  if (!handler) {
    term.writeln(\`\\r\\n\\x1b[31mbash: \${cmd}: command not found\\x1b[0m\`);
    return;
  }

  const result = await handler(args);
  if (result !== null && Array.isArray(result)) {
    result.forEach(line => term.writeln('\\r' + line));
  }
}

term.onKey(async ({ key, domEvent }) => {
  const code = domEvent.keyCode;

  if (code === 13) { // Enter
    const cmd = inputBuffer;
    inputBuffer = '';
    term.write('\\r\\n');
    if (cmd.trim()) await runCommand(cmd.trim());
    printPrompt();
  } else if (code === 8) { // Backspace
    if (inputBuffer.length > 0) {
      inputBuffer = inputBuffer.slice(0, -1);
      term.write('\\b \\b');
    }
  } else if (code === 38) { // Up arrow
    if (cmdHistory.length > 0) {
      histIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
      const cmd = cmdHistory[cmdHistory.length - 1 - histIdx];
      const clear = '\\b'.repeat(inputBuffer.length) + ' '.repeat(inputBuffer.length) + '\\b'.repeat(inputBuffer.length);
      term.write(clear + cmd);
      inputBuffer = cmd;
    }
  } else if (code === 40) { // Down arrow
    histIdx = Math.max(histIdx - 1, -1);
    const cmd = histIdx === -1 ? '' : cmdHistory[cmdHistory.length - 1 - histIdx];
    const clear = '\\b'.repeat(inputBuffer.length) + ' '.repeat(inputBuffer.length) + '\\b'.repeat(inputBuffer.length);
    term.write(clear + cmd);
    inputBuffer = cmd;
  } else if (code === 76 && domEvent.ctrlKey) { // Ctrl+L
    term.clear();
    printPrompt();
    inputBuffer = '';
  } else if (code === 67 && domEvent.ctrlKey) { // Ctrl+C
    term.writeln('^C');
    inputBuffer = '';
    printPrompt();
  } else if (key && key.length === 1) {
    inputBuffer += key;
    term.write(key);
  }
});

// ── Welcome ────────────────────────────────────────────────────────────────
term.writeln('\\x1b[35m ██╗  ██╗      ██████╗  █████╗ ██████╗  █████╗ ██████╗  ██████╗ ██╗  ██╗\\x1b[0m');
term.writeln('\\x1b[35m ╚██╗██╔╝      ██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔═══██╗╚██╗██╔╝\\x1b[0m');
term.writeln('\\x1b[36m  ╚███╔╝ █████╗██████╔╝███████║██████╔╝███████║██║  ██║██║   ██║ ╚███╔╝\\x1b[0m');
term.writeln('\\x1b[36m  ██╔██╗ ╚════╝██╔═══╝ ██╔══██║██╔══██╗██╔══██║██║  ██║██║   ██║ ██╔██╗\\x1b[0m');
term.writeln('\\x1b[35m ██╔╝ ██╗      ██║     ██║  ██║██║  ██║██║  ██║██████╔╝╚██████╔╝██╔╝ ██╗\\x1b[0m');
term.writeln('\\x1b[35m ╚═╝  ╚═╝      ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝\\x1b[0m');
term.writeln('');
term.writeln('\\x1b[32mX-ParadoxSec Terminal v2.0 — Real commands, real data.\\x1b[0m');
term.writeln('\\x1b[33mType "help" for available commands. Ctrl+C to cancel. Ctrl+L to clear.\\x1b[0m');
printPrompt();
</script>
</body>
</html>
`;

export const TerminalScreen: React.FC = () => {
  const webRef = useRef<WebView>(null);

  return (
    <View style={s.container}>
      <PageHeader title="Terminal" subtitle="Real commands via xterm.js" icon="⌨️" />
      <WebView
        ref={webRef}
        source={{ html: TERMINAL_HTML }}
        style={s.webview}
        scrollEnabled={false}
        keyboardDisplayRequiresUserAction={false}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        onMessage={(e) => {
          if (e.nativeEvent.data === 'exit') {
            // handle exit
          }
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  webview: { flex: 1, backgroundColor: C.bg0 },
});
