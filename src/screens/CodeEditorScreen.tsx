// src/screens/CodeEditorScreen.tsx
// Real Monaco Editor (VS Code engine) via WebView

import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { PageHeader, GlassCard } from '../components/UI';
import { C, F, R, S } from '../theme';

const SNIPPETS = [
  { name: 'Port Scanner', lang: 'python', code: `#!/usr/bin/env python3
import socket, concurrent.futures

def scan(host, port):
    try:
        s = socket.socket()
        s.settimeout(1)
        s.connect((host, port))
        s.close()
        return port, True
    except:
        return port, False

host = input("Target: ")
ports = range(1, 1025)
with concurrent.futures.ThreadPoolExecutor(50) as ex:
    for port, open in ex.map(lambda p: scan(host, p), ports):
        if open: print(f"[OPEN] {host}:{port}")` },
  { name: 'DNS Lookup', lang: 'python', code: `import dns.resolver

def lookup(domain):
    for rtype in ['A','AAAA','MX','TXT','NS']:
        try:
            answers = dns.resolver.resolve(domain, rtype)
            for r in answers:
                print(f"{rtype}: {r}")
        except: pass

lookup(input("Domain: "))` },
  { name: 'HTTP Headers', lang: 'python', code: `import requests

url = input("URL: ")
r = requests.get(url, timeout=5)
print(f"Status: {r.status_code}")
for k, v in r.headers.items():
    print(f"{k}: {v}")` },
  { name: 'Hash All', lang: 'python', code: `import hashlib

text = input("Text: ").encode()
for algo in ['md5','sha1','sha224','sha256','sha384','sha512']:
    h = hashlib.new(algo, text).hexdigest()
    print(f"{algo.upper()}: {h}")` },
  { name: 'AES Encrypt', lang: 'python', code: `from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import base64, hashlib

def encrypt(text, key):
    k = hashlib.sha256(key.encode()).digest()
    cipher = AES.new(k, AES.MODE_CBC)
    ct = cipher.encrypt(pad(text.encode(), 16))
    return base64.b64encode(cipher.iv + ct).decode()

print(encrypt(input("Text: "), input("Key: ")))` },
  { name: 'Bash Recon', lang: 'bash', code: `#!/bin/bash
TARGET=$1
echo "=== Recon: $TARGET ==="
echo "[+] WHOIS"
whois $TARGET | grep -E "Registrar:|Creation|Expiry|Name Server"
echo "[+] DNS Records"
dig $TARGET +short
dig MX $TARGET +short
echo "[+] Nmap Quick"
nmap -sV --open -T4 $TARGET` },
  { name: 'Hello World (Go)', lang: 'go', code: `package main

import (
    "fmt"
    "net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "X-ParadoxSec running!")
    fmt.Printf("[%s] %s %s\\n", r.RemoteAddr, r.Method, r.URL)
}

func main() {
    http.HandleFunc("/", handler)
    fmt.Println("Listening on :8080")
    http.ListenAndServe(":8080", nil)
}` },
  { name: 'SQL Injection Test', lang: 'python', code: `# Educational: test only on systems you own
import requests

url = input("URL with param (e.g. http://site.com/page?id=1): ")
payloads = ["'", "''", "1 OR 1=1", "1; DROP TABLE users--", "1 UNION SELECT NULL--"]

for p in payloads:
    test = url.replace("=1", f"={p}")
    try:
        r = requests.get(test, timeout=3)
        indicator = "ERROR" in r.text.upper() or "SQL" in r.text.upper()
        print(f"[{'VULN?' if indicator else 'OK'}] {p}")
    except: pass` },
];

const MONACO_HTML = (code: string, lang: string) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#0D0D14; height:100vh; overflow:hidden; }
  #editor { width:100%; height:100vh; }
</style>
</head>
<body>
<div id="editor"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.js"></script>
<script>
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: ${JSON.stringify(code)},
    language: ${JSON.stringify(lang)},
    theme: 'vs-dark',
    fontSize: 13,
    fontFamily: 'monospace',
    lineNumbers: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    wordWrap: 'on',
    tabSize: 4,
    insertSpaces: true,
    formatOnPaste: true,
    suggestOnTriggerCharacters: true,
  });

  // Send content changes to RN
  editor.onDidChangeModelContent(() => {
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'change', value: editor.getValue()
    }));
  });

  // Listen for snippet changes from RN
  window.addEventListener('message', (e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'setCode') {
        editor.setValue(msg.code);
        monaco.editor.setModelLanguage(editor.getModel(), msg.lang);
      }
    } catch {}
  });
});
</script>
</body>
</html>
`;

export const CodeEditorScreen: React.FC = () => {
  const webRef = useRef<WebView>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState(SNIPPETS[0]);

  const loadSnippet = (snippet: typeof SNIPPETS[0]) => {
    setCurrentSnippet(snippet);
    webRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({ type: 'setCode', code: ${JSON.stringify(snippet.code)}, lang: '${snippet.lang}' }), '*');
    `);
    setShowPicker(false);
  };

  return (
    <View style={s.container}>
      <PageHeader title="Code Editor" subtitle="Monaco Editor — All languages" icon="✏️" accent={C.cyan} />

      {/* Toolbar */}
      <View style={s.toolbar}>
        <View style={s.langBadge}>
          <Text style={s.langText}>{currentSnippet.lang.toUpperCase()}</Text>
        </View>
        <Text style={s.fileName}>{currentSnippet.name}</Text>
        <TouchableOpacity style={s.toolBtn} onPress={() => setShowPicker(true)}>
          <Text style={s.toolBtnText}>SNIPPETS</Text>
        </TouchableOpacity>
      </View>

      {/* Monaco Editor */}
      <WebView
        ref={webRef}
        source={{ html: MONACO_HTML(currentSnippet.code, currentSnippet.lang) }}
        style={{ flex: 1, backgroundColor: C.bg0 }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        keyboardDisplayRequiresUserAction={false}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            // Could save content here
          } catch {}
        }}
      />

      {/* Snippet picker modal */}
      <Modal visible={showPicker} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>SELECT SNIPPET</Text>
            <ScrollView>
              {SNIPPETS.map((sn) => (
                <TouchableOpacity key={sn.name} style={s.snippetItem} onPress={() => loadSnippet(sn)}>
                  <Text style={s.snippetName}>{sn.name}</Text>
                  <View style={[s.langPill, { borderColor: C.cyan + '55', backgroundColor: C.cyan + '18' }]}>
                    <Text style={[s.langPillText, { color: C.cyan }]}>{sn.lang}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowPicker(false)}>
              <Text style={s.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg0 },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', gap: S.sm,
    paddingHorizontal: S.md, paddingBottom: S.sm,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  langBadge: {
    backgroundColor: C.cyan + '18', borderWidth: 1, borderColor: C.cyan + '55',
    borderRadius: R.sm, paddingHorizontal: S.sm, paddingVertical: 3,
  },
  langText: { color: C.cyan, fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700' },
  fileName: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.sm, flex: 1 },
  toolBtn: {
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    borderRadius: R.sm, paddingHorizontal: S.sm, paddingVertical: 4,
  },
  toolBtnText: { color: C.textSecondary, fontFamily: 'monospace', fontSize: F.xs },
  modalBg: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: C.bg1, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl,
    padding: S.md, maxHeight: '70%', borderTopWidth: 1, borderColor: C.borderViolet,
  },
  modalTitle: { color: C.violetBright, fontFamily: 'monospace', fontSize: F.sm, fontWeight: '700', letterSpacing: 2, marginBottom: S.md },
  snippetItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: S.sm, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  snippetName: { color: C.textPrimary, fontFamily: 'monospace', fontSize: F.sm },
  langPill: { borderWidth: 1, borderRadius: R.full, paddingHorizontal: S.sm, paddingVertical: 2 },
  langPillText: { fontFamily: 'monospace', fontSize: F.xs, fontWeight: '700' },
  cancelBtn: { marginTop: S.md, padding: S.sm, alignItems: 'center' },
  cancelText: { color: C.textMuted, fontFamily: 'monospace', fontSize: F.sm },
});
