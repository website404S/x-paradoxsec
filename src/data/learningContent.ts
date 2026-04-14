// src/data/learningContent.ts

export interface LearningArticle {
  id: string;
  title: string;
  category: string;
  icon: string;
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: LearningSection[];
}

export interface LearningSection {
  heading: string;
  body: string;
}

export const LEARNING_ARTICLES: LearningArticle[] = [
  {
    id: 'what-is-cybersecurity',
    title: 'What is Cybersecurity?',
    category: 'Fundamentals',
    icon: '🛡️',
    readTime: '5 min',
    difficulty: 'Beginner',
    content: [
      {
        heading: 'Definition',
        body: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks usually aim to access, change, or destroy sensitive information; extort money; or disrupt business processes.',
      },
      {
        heading: 'The CIA Triad',
        body: '• Confidentiality: Only authorized parties access data.\n• Integrity: Data is accurate and unaltered.\n• Availability: Systems are accessible when needed.\n\nAll security decisions revolve around these three principles.',
      },
      {
        heading: 'Types of Threats',
        body: '• Malware (viruses, ransomware, spyware)\n• Phishing attacks\n• Man-in-the-Middle (MitM) attacks\n• SQL Injection\n• Denial of Service (DoS/DDoS)\n• Social Engineering\n• Zero-day exploits',
      },
      {
        heading: 'Why It Matters',
        body: 'In 2023, the average cost of a data breach was $4.45 million USD. Personal data, financial records, medical information — all are valuable targets. Understanding cybersecurity is now an essential life skill.',
      },
    ],
  },
  {
    id: 'how-dns-works',
    title: 'How DNS Works',
    category: 'Networking',
    icon: '🌐',
    readTime: '7 min',
    difficulty: 'Beginner',
    content: [
      {
        heading: 'Domain Name System',
        body: 'DNS is the "phonebook of the internet." When you type google.com, your device asks a DNS server: "What IP address does this domain belong to?" DNS translates human-readable names into machine-readable IP addresses.',
      },
      {
        heading: 'DNS Resolution Steps',
        body: '1. You type google.com in your browser.\n2. Browser checks its local DNS cache.\n3. If not cached, asks your OS resolver.\n4. OS asks your configured DNS server (often 8.8.8.8).\n5. DNS server queries Root → TLD (.com) → Authoritative nameserver.\n6. IP is returned and cached for future use.',
      },
      {
        heading: 'Common DNS Record Types',
        body: '• A — Maps domain to IPv4 address\n• AAAA — Maps domain to IPv6 address\n• CNAME — Alias for another domain\n• MX — Mail exchange server\n• TXT — Text records (SPF, DKIM verification)\n• NS — Nameserver for the domain\n• SOA — Start of Authority',
      },
      {
        heading: 'DNS Security Issues',
        body: '• DNS Spoofing / Cache Poisoning: Attacker injects fake DNS records.\n• DNS Hijacking: Redirecting DNS traffic to malicious servers.\n• DNS over HTTPS (DoH): Encrypts DNS queries to prevent snooping.\n• DNSSEC: Adds cryptographic signatures to DNS records.',
      },
    ],
  },
  {
    id: 'ethical-hacking',
    title: 'Intro to Ethical Hacking',
    category: 'Ethical Hacking',
    icon: '🎯',
    readTime: '10 min',
    difficulty: 'Intermediate',
    content: [
      {
        heading: 'What is Ethical Hacking?',
        body: 'Ethical hacking (also called penetration testing or "pen testing") is the authorized practice of bypassing system security to identify vulnerabilities. Ethical hackers work WITH organizations — not against them — to improve defenses.',
      },
      {
        heading: 'The 5 Phases of Penetration Testing',
        body: '1. Reconnaissance — Gather info about target (passive/active)\n2. Scanning — Discover open ports, services, vulnerabilities\n3. Gaining Access — Exploit vulnerabilities (with permission)\n4. Maintaining Access — Test persistence mechanisms\n5. Reporting — Document findings with remediation steps',
      },
      {
        heading: 'Legal & Ethical Framework',
        body: '• ALWAYS have written authorization before testing.\n• Bug Bounty programs (HackerOne, Bugcrowd) offer legal scopes.\n• Certifications: CEH, OSCP, CompTIA Security+\n• Never test systems you don\'t own or have permission to test.\n• Responsible disclosure: report vulnerabilities privately first.',
      },
      {
        heading: 'Common Vulnerability Types (OWASP Top 10)',
        body: '• Injection (SQL, Command, XSS)\n• Broken Authentication\n• Sensitive Data Exposure\n• Security Misconfiguration\n• Using Components with Known Vulnerabilities\n• Insufficient Logging & Monitoring',
      },
    ],
  },
  {
    id: 'android-security',
    title: 'Android App Security',
    category: 'Mobile Security',
    icon: '📱',
    readTime: '8 min',
    difficulty: 'Intermediate',
    content: [
      {
        heading: 'Android Permission Model',
        body: 'Android uses a permission system to protect user data. Apps must declare permissions in AndroidManifest.xml, and dangerous permissions require explicit user approval. Always question why an app needs permissions unrelated to its function.',
      },
      {
        heading: 'Risky Permissions to Watch',
        body: '• READ_SMS / SEND_SMS — Can read/send your messages\n• RECORD_AUDIO — Can record microphone anytime\n• ACCESS_FINE_LOCATION — Precise GPS tracking\n• READ_CONTACTS — Access your contact list\n• BIND_ACCESSIBILITY_SERVICE — Can control your screen\n• SYSTEM_ALERT_WINDOW — Overlay on any app (often spyware)',
      },
      {
        heading: 'Sideloading Risks',
        body: 'Sideloading = installing APKs from outside the Play Store. Risks include:\n• No malware scanning by Google Play Protect\n• Fake/modified versions of popular apps (WhatsApp mods, etc.)\n• Bundled spyware, adware, ransomware\n• No automatic security updates\n\nOnly sideload from verified, trusted sources.',
      },
      {
        heading: 'Staying Safe on Android',
        body: '• Keep OS and apps updated\n• Use Google Play Protect\n• Review app permissions regularly\n• Use a reputable antivirus/security app\n• Enable screen lock (PIN/biometric)\n• Use a VPN on public WiFi\n• Be cautious with app permissions at install time',
      },
    ],
  },
  {
    id: 'phishing',
    title: 'Phishing Attack Anatomy',
    category: 'Threats',
    icon: '🎣',
    readTime: '6 min',
    difficulty: 'Beginner',
    content: [
      {
        heading: 'What is Phishing?',
        body: 'Phishing is a social engineering attack where attackers impersonate legitimate entities to trick users into revealing sensitive information (passwords, credit cards, OTPs). It\'s the #1 cause of data breaches globally.',
      },
      {
        heading: 'Types of Phishing',
        body: '• Email Phishing — Mass fake emails (most common)\n• Spear Phishing — Targeted attack using personal info\n• Whaling — Targeting executives/high-value individuals\n• Smishing — Phishing via SMS\n• Vishing — Phishing via voice calls\n• Clone Phishing — Duplicating legitimate emails with malicious links',
      },
      {
        heading: 'Red Flags in URLs',
        body: '• Misspelled domains: paypa1.com, arnazon.com\n• Extra subdomains: paypal.com.login.evil.com\n• HTTP instead of HTTPS\n• URL shorteners hiding the real destination\n• Free hosting TLDs: .tk, .ml, .xyz\n• Unicode/Punycode tricks: аррle.com (Cyrillic "а")',
      },
      {
        heading: 'How to Protect Yourself',
        body: '• Always verify sender email addresses carefully\n• Hover over links before clicking (check destination)\n• Enable 2FA on all accounts\n• Use a password manager (won\'t auto-fill on fake sites)\n• Report suspicious emails\n• When in doubt, go directly to the site — don\'t click the link',
      },
    ],
  },
];
