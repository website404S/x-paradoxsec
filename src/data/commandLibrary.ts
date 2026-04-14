// src/data/commandLibrary.ts
// Educational command reference for security professionals

export interface Command {
  cmd: string;
  description: string;
  example: string;
  category: string;
}

export interface CommandCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  commands: Command[];
}

export const COMMAND_LIBRARY: CommandCategory[] = [
  {
    id: 'networking',
    label: 'Networking',
    icon: '🌐',
    color: '#00E5FF',
    commands: [
      { cmd: 'ifconfig', description: 'Show network interfaces (legacy)', example: 'ifconfig eth0', category: 'networking' },
      { cmd: 'ip addr show', description: 'Show IP addresses (modern)', example: 'ip addr show eth0', category: 'networking' },
      { cmd: 'ip route', description: 'Show routing table', example: 'ip route show', category: 'networking' },
      { cmd: 'netstat -tulnp', description: 'List open ports and services', example: 'netstat -tulnp', category: 'networking' },
      { cmd: 'ss -tulnp', description: 'Socket statistics (modern netstat)', example: 'ss -tulnp', category: 'networking' },
      { cmd: 'ping', description: 'Test host reachability', example: 'ping -c 4 google.com', category: 'networking' },
      { cmd: 'traceroute', description: 'Trace packet route to host', example: 'traceroute google.com', category: 'networking' },
      { cmd: 'nslookup', description: 'DNS lookup query', example: 'nslookup google.com', category: 'networking' },
      { cmd: 'dig', description: 'DNS lookup (detailed)', example: 'dig +short google.com A', category: 'networking' },
      { cmd: 'curl', description: 'Transfer data with URL', example: 'curl -I https://example.com', category: 'networking' },
      { cmd: 'wget', description: 'Download files from web', example: 'wget https://example.com/file.zip', category: 'networking' },
      { cmd: 'whois', description: 'Domain registration info', example: 'whois google.com', category: 'networking' },
      { cmd: 'arp -a', description: 'Show ARP cache (local network devices)', example: 'arp -a', category: 'networking' },
      { cmd: 'tcpdump', description: 'Capture network traffic', example: 'tcpdump -i eth0 -n port 80', category: 'networking' },
    ],
  },
  {
    id: 'nmap',
    label: 'Nmap',
    icon: '🔍',
    color: '#00FF88',
    commands: [
      { cmd: 'nmap -sn', description: 'Ping scan — discover live hosts, no port scan', example: 'nmap -sn 192.168.1.0/24', category: 'nmap' },
      { cmd: 'nmap -sV', description: 'Detect service versions on open ports', example: 'nmap -sV 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap -O', description: 'OS detection (requires root)', example: 'sudo nmap -O 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap -A', description: 'Aggressive scan: OS, version, scripts, traceroute', example: 'sudo nmap -A 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap -p', description: 'Scan specific port(s)', example: 'nmap -p 22,80,443 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap -p-', description: 'Scan all 65535 ports', example: 'nmap -p- 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap --script', description: 'Run NSE scripts for deeper analysis', example: 'nmap --script vuln 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap -sU', description: 'UDP port scan', example: 'sudo nmap -sU -p 53,161 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap -oN', description: 'Save scan results to file', example: 'nmap -oN scan.txt 192.168.1.1', category: 'nmap' },
      { cmd: 'nmap -T4', description: 'Faster scan timing (T0-T5)', example: 'nmap -T4 192.168.1.1', category: 'nmap' },
    ],
  },
  {
    id: 'kali',
    label: 'Kali Tools',
    icon: '🐉',
    color: '#BF00FF',
    commands: [
      { cmd: 'airmon-ng start', description: 'Enable monitor mode on WiFi adapter', example: 'airmon-ng start wlan0', category: 'kali' },
      { cmd: 'airodump-ng', description: 'Capture WiFi packets / discover networks', example: 'airodump-ng wlan0mon', category: 'kali' },
      { cmd: 'hashcat', description: 'GPU-accelerated password cracker', example: 'hashcat -m 0 hash.txt wordlist.txt', category: 'kali' },
      { cmd: 'john', description: 'John the Ripper — password recovery tool', example: 'john --wordlist=rockyou.txt hash.txt', category: 'kali' },
      { cmd: 'hydra', description: 'Network login brute-force tool', example: 'hydra -l admin -P pass.txt ssh://192.168.1.1', category: 'kali' },
      { cmd: 'nikto', description: 'Web server vulnerability scanner', example: 'nikto -h http://target.com', category: 'kali' },
      { cmd: 'sqlmap', description: 'Automatic SQL injection detection', example: 'sqlmap -u "http://site.com/page?id=1"', category: 'kali' },
      { cmd: 'gobuster', description: 'Directory & file brute-force scanner', example: 'gobuster dir -u http://target.com -w wordlist.txt', category: 'kali' },
      { cmd: 'wpscan', description: 'WordPress vulnerability scanner', example: 'wpscan --url http://target.com', category: 'kali' },
      { cmd: 'msfconsole', description: 'Metasploit Framework interactive console', example: 'msfconsole', category: 'kali' },
      { cmd: 'burpsuite', description: 'Web application security testing proxy', example: 'burpsuite', category: 'kali' },
      { cmd: 'wireshark', description: 'GUI network protocol analyzer', example: 'wireshark &', category: 'kali' },
    ],
  },
  {
    id: 'linux',
    label: 'Linux Essentials',
    icon: '🐧',
    color: '#FFD700',
    commands: [
      { cmd: 'chmod', description: 'Change file permissions', example: 'chmod 755 script.sh', category: 'linux' },
      { cmd: 'chown', description: 'Change file owner', example: 'chown xora:xora file.txt', category: 'linux' },
      { cmd: 'ps aux', description: 'List all running processes', example: 'ps aux | grep nginx', category: 'linux' },
      { cmd: 'kill', description: 'Send signal to process', example: 'kill -9 1234', category: 'linux' },
      { cmd: 'top', description: 'Real-time process monitor', example: 'top', category: 'linux' },
      { cmd: 'htop', description: 'Interactive process viewer', example: 'htop', category: 'linux' },
      { cmd: 'find', description: 'Search for files', example: 'find / -name "*.conf" 2>/dev/null', category: 'linux' },
      { cmd: 'grep', description: 'Search text in files', example: 'grep -r "password" /etc/', category: 'linux' },
      { cmd: 'awk', description: 'Pattern scanning and processing', example: "awk -F: '{print $1}' /etc/passwd", category: 'linux' },
      { cmd: 'sed', description: 'Stream editor for text transformation', example: "sed 's/old/new/g' file.txt", category: 'linux' },
      { cmd: 'cron / crontab -e', description: 'Schedule recurring tasks', example: '0 2 * * * /path/to/script.sh', category: 'linux' },
      { cmd: 'ssh', description: 'Secure remote shell connection', example: 'ssh user@192.168.1.1 -p 22', category: 'linux' },
    ],
  },
  {
    id: 'recon',
    label: 'Reconnaissance',
    icon: '🕵️',
    color: '#FF6B00',
    commands: [
      { cmd: 'theHarvester', description: 'Email, subdomain, IP OSINT tool', example: 'theHarvester -d target.com -b google', category: 'recon' },
      { cmd: 'maltego', description: 'Visual link analysis / OSINT platform', example: 'maltego', category: 'recon' },
      { cmd: 'shodan', description: 'Search engine for internet-connected devices', example: 'shodan search "apache country:ID"', category: 'recon' },
      { cmd: 'sublist3r', description: 'Subdomain enumeration tool', example: 'sublist3r -d target.com', category: 'recon' },
      { cmd: 'fierce', description: 'DNS reconnaissance tool', example: 'fierce --domain target.com', category: 'recon' },
      { cmd: 'dnsenum', description: 'DNS enumeration utility', example: 'dnsenum target.com', category: 'recon' },
      { cmd: 'recon-ng', description: 'Full-featured web reconnaissance framework', example: 'recon-ng', category: 'recon' },
    ],
  },
];
