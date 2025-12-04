import { createIcons, AlertTriangle, ShieldAlert, ShieldCheck, MousePointerClick } from 'lucide';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Page-Specific Cloud Diagram Logic ---
    const misconfigurationData = {
        'component-igw': {
            title: 'Internet Gateway',
            misconfiguration: 'Lack of a Web Application Firewall (WAF) at the network edge.',
            risk: 'Without a WAF, malicious web traffic (like SQL injection, Cross-Site Scripting) can travel directly from the internet to the EC2 instance. This bypasses a critical layer of defense, forcing the application itself to be the sole protector against common web exploits.',
            remediation: 'Implement a WAF (like AWS WAF) and associate it with the Application Load Balancer or API Gateway handling the ingress traffic. Configure it with managed rule sets (e.g., for the OWASP Top 10) and custom rules to block known bad traffic patterns before they ever reach your application.'
        },
        'component-sg': {
            title: 'Security Group',
            misconfiguration: 'Overly Permissive Ingress Rule (`0.0.0.0/0` on Port 22/SSH).',
            risk: 'Exposing SSH to the entire internet makes the instance a prime target for brute-force attacks, automated scanning, and credential stuffing, which can lead to a full system compromise.',
            remediation: 'Restrict the source IP range to a known, trusted address (e.g., a corporate VPN or a specific bastion host). For production systems, avoid direct SSH access entirely in favor of using a session manager service (like AWS SSM Session Manager).'
        },
        'component-s3': {
            title: 'S3 Bucket',
            misconfiguration: 'Publicly Accessible Bucket.',
            risk: 'Critical risk of sensitive data exposure. If the bucket contains user data, intellectual property, or configuration files, making it public can lead to massive data breaches, compliance violations (GDPR, CCPA), and reputational damage.',
            remediation: `
        <ul class="list-decimal">
          <li><strong>Enable Block Public Access (BPA):</strong> This is a top-level account setting that acts as the primary defense.</li>
          <li><strong>Apply Restrictive Bucket Policies:</strong> Ensure the bucket policy does not contain statements that allow anonymous principals (\`"Principal": "*"\`).</li>
          <li><strong>Use IAM Access Analyzer:</strong> Continuously monitor for and be alerted to any publicly accessible S3 buckets.</li>
        </ul>
      `
        },
        'component-iam': {
            title: 'IAM Role',
            misconfiguration: 'Overly Permissive Role with Wildcard Permissions (`"Action": "*:*"`)',
            risk: 'Violates the principle of least privilege. If the EC2 instance is compromised, an attacker can inherit these god-like permissions to access, modify, or destroy any resource in the entire cloud account.',
            remediation: "Create a fine-grained IAM policy that only grants the specific permissions the application needs to function. For example, if the application only needs to read objects from a specific S3 bucket, the policy should only allow the `s3:GetObject` action on that specific bucket's ARN."
        },
        'component-ec2': {
            title: 'EC2 Instance',
            misconfiguration: 'Exposed Instance Metadata Service (IMDSv1).',
            risk: 'The instance metadata service can be accessed by any process running on the instance to retrieve temporary credentials. If a Server-Side Request Forgery (SSRF) vulnerability exists in the web application, an attacker can exploit it to query the metadata service and steal the IAM role credentials.',
            remediation: `
        <ul class="list-decimal">
          <li><strong>Enforce IMDSv2:</strong> This version requires a session-oriented approach with a secret token, which protects against basic SSRF attacks.</li>
          <li><strong>Firewall Rules:</strong> Apply local firewall rules (iptables) on the instance itself to prevent the web server process from being able to reach the metadata endpoint (\`169.254.169.254\`).</li>
        </ul>
      `
        }
    };

    const diagram = document.getElementById('cloud-diagram');
    const analysisContent = document.getElementById('analysis-content');
    const initialMessage = document.getElementById('initial-message');
    const components = diagram.querySelectorAll('.diagram-component');

    function displayInfo(componentId) {
        const data = misconfigurationData[componentId];
        if (!data) return;

        initialMessage.classList.add('hidden');

        analysisContent.innerHTML = `
      <h4 class="text-xl font-bold text-blue-300">${data.title}</h4>
      <div class="space-y-4">
        <div>
          <h5 class="font-semibold text-blue-400 flex items-center"><span class="mr-2" id="icon-misconfig"></span>Misconfiguration</h5>
          <p class="pl-7 border-l-2 border-gray-700 ml-2.5 text-gray-200">${data.misconfiguration}</p>
        </div>
        <div>
          <h5 class="font-semibold text-red-400 flex items-center"><span class="mr-2" id="icon-risk"></span>Risk</h5>
          <p class="pl-7 border-l-2 border-gray-700 ml-2.5 text-gray-200">${data.risk}</p>
        </div>
        <div>
          <h5 class="font-semibold text-green-400 flex items-center"><span class="mr-2" id="icon-remediation"></span>Remediation</h5>
          <div class="pl-7 border-l-2 border-gray-700 ml-2.5 text-gray-200">${data.remediation}</div>
        </div>
      </div>
    `;

        createIcons({
            icons: {
                'icon-misconfig': AlertTriangle,
                'icon-risk': ShieldAlert,
                'icon-remediation': ShieldCheck,
            },
            attrs: { strokeWidth: 2, size: 20 }
        });
    }

    components.forEach(component => {
        if (misconfigurationData[component.id]) {
            component.addEventListener('click', () => {
                components.forEach(c => c.classList.remove('active'));
                component.classList.add('active');
                displayInfo(component.id);
            });
        }
    });

    // Render page specific icons
    createIcons({
        icons: {
            'icon-click': MousePointerClick
        },
        attrs: { color: "#38bdf8", size: 24, strokeWidth: 2 }
    });

});
