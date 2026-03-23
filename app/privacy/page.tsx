import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Ernesto Monge",
  description: "Privacy policy for Trading OS platform, covering data collection, security practices, and user rights.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/60 text-lg">
            Last Updated: March 23, 2026
          </p>
          <p className="text-white/50 text-sm mt-2">
            Effective Date: March 23, 2026
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6 mb-12">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-white/70">
            <li><a href="#overview" className="hover:text-white transition">1. Overview</a></li>
            <li><a href="#data-collection" className="hover:text-white transition">2. Data Collection & Use</a></li>
            <li><a href="#plaid-integration" className="hover:text-white transition">3. Plaid Integration</a></li>
            <li><a href="#security" className="hover:text-white transition">4. Security Practices</a></li>
            <li><a href="#data-retention" className="hover:text-white transition">5. Data Retention & Deletion</a></li>
            <li><a href="#user-rights" className="hover:text-white transition">6. Your Rights</a></li>
            <li><a href="#contact" className="hover:text-white transition">7. Contact Us</a></li>
          </ul>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* 1. Overview */}
          <section id="overview">
            <h2 className="text-2xl font-bold mb-4">1. Overview</h2>
            <div className="space-y-4 text-white/70 leading-relaxed">
              <p>
                Trading OS ("we," "us," "our," or "Company") operates a comprehensive financial technology platform that helps you manage your trading strategies, portfolios, and market analysis. This Privacy Policy explains how we collect, use, process, and protect your personal information.
              </p>
              <p>
                We are committed to maintaining the highest standards of data protection and security, complying with applicable privacy regulations including GDPR, CCPA, and other jurisdiction-specific laws.
              </p>
              <p className="text-sm text-white/50 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                <strong>Important:</strong> By using our platform, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </section>

          {/* 2. Data Collection & Use */}
          <section id="data-collection">
            <h2 className="text-2xl font-bold mb-4">2. Data Collection & Use</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">2.1 Information We Collect</h3>
                <div className="space-y-4">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Account Information</h4>
                    <ul className="text-white/70 space-y-1 ml-4 list-disc">
                      <li>Name and email address</li>
                      <li>Authentication credentials</li>
                      <li>User preferences and settings</li>
                      <li>Profile information</li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Financial Data (via Plaid)</h4>
                    <ul className="text-white/70 space-y-1 ml-4 list-disc">
                      <li>Bank account information and balances</li>
                      <li>Transaction history</li>
                      <li>Institution and account details</li>
                      <li>Portfolio positions and holdings</li>
                      <li>Trading activity and history</li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Usage Information</h4>
                    <ul className="text-white/70 space-y-1 ml-4 list-disc">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent</li>
                      <li>Features used and API calls made</li>
                      <li>Cookies and analytics data</li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">System-Generated Data</h4>
                    <ul className="text-white/70 space-y-1 ml-4 list-disc">
                      <li>Trading signals and recommendations</li>
                      <li>Risk assessments and portfolio analytics</li>
                      <li>Strategy performance metrics</li>
                      <li>Logs and audit trails</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">2.2 How We Use Your Data</h3>
                <div className="space-y-2 text-white/70">
                  <p>✓ <strong>Service Delivery:</strong> Providing trading analysis, portfolio management, and strategy execution</p>
                  <p>✓ <strong>Risk Management:</strong> Assessing financial risk and enforcing capital protection rules</p>
                  <p>✓ <strong>Analytics:</strong> Generating performance reports and market insights</p>
                  <p>✓ <strong>Fraud Prevention:</strong> Detecting and preventing unauthorized access</p>
                  <p>✓ <strong>Compliance:</strong> Meeting legal and regulatory obligations</p>
                  <p>✓ <strong>Improvement:</strong> Enhancing platform features and user experience</p>
                  <p>✓ <strong>Communication:</strong> Sending service updates and important notices</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">2.3 Consent</h3>
                <p className="text-white/70 mb-3">
                  By creating an account and using our platform, you explicitly consent to:
                </p>
                <ul className="text-white/70 space-y-2 ml-4 list-disc">
                  <li>Collection and processing of your personal information</li>
                  <li>Storage of financial data and trading activity</li>
                  <li>Use of data for service provision and improvement</li>
                  <li>Integration with third-party services (Plaid, exchanges, AI models)</li>
                </ul>
                <p className="text-white/50 text-sm mt-4">You can withdraw consent at any time by requesting account deletion (see Section 5).</p>
              </div>
            </div>
          </section>

          {/* 3. Plaid Integration */}
          <section id="plaid-integration">
            <h2 className="text-2xl font-bold mb-4">3. Plaid Integration</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">3.1 What Plaid Does</h3>
                <p className="text-white/70 mb-4">
                  We use Plaid, Inc. as our financial data aggregation partner. Plaid securely connects to your financial institutions to retrieve account and transaction information.
                </p>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Plaid Process Flow:</h4>
                  <ol className="text-white/70 space-y-2 ml-4 list-decimal">
                    <li>You initiate "Connect Bank" in our app</li>
                    <li>Plaid Link modal appears (hosted by Plaid)</li>
                    <li>You select your financial institution and authenticate</li>
                    <li>Plaid securely retrieves your authorization</li>
                    <li>Plaid provides us with an encrypted access token</li>
                    <li>We store this token in our encrypted vault</li>
                    <li>We use this token to fetch account data via Plaid API</li>
                    <li>Data is stored in our database and used for analysis</li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">3.2 Data Sharing with Plaid</h3>
                <p className="text-white/70 mb-3">
                  When you connect your bank account, we share the following with Plaid:
                </p>
                <ul className="text-white/70 space-y-1 ml-4 list-disc">
                  <li>Your Plaid Link token (one-time exchange)</li>
                  <li>Your request for account/transaction data</li>
                  <li>Your IP address (for fraud detection)</li>
                </ul>
                <p className="text-white/50 text-sm mt-4">
                  <strong>Note:</strong> Plaid operates under their own privacy policy at <a href="https://plaid.com/privacy" className="text-blue-400 hover:underline">plaid.com/privacy</a>. We recommend reviewing it.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">3.3 Your Plaid Rights</h3>
                <ul className="text-white/70 space-y-2 ml-4 list-disc">
                  <li><strong>Disconnect:</strong> You can disconnect your bank account at any time in Settings</li>
                  <li><strong>Revoke Access:</strong> You can revoke Plaid access through your financial institution's settings</li>
                  <li><strong>Data Deletion:</strong> We will delete your Plaid access token immediately upon request</li>
                  <li><strong>Plaid Contact:</strong> Contact Plaid directly at <a href="mailto:privacy@plaid.com" className="text-blue-400 hover:underline">privacy@plaid.com</a></li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Security Practices */}
          <section id="security">
            <h2 className="text-2xl font-bold mb-4">4. Security Practices</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">4.1 Encryption</h3>
                <div className="space-y-3 text-white/70">
                  <p>
                    <strong>In-Transit Encryption:</strong> All data between your browser and our servers is encrypted using TLS 1.3. Your connection is secure (HTTPS).
                  </p>
                  <p>
                    <strong>At-Rest Encryption:</strong> Sensitive data including API keys, access tokens, and financial information are encrypted at rest using AES-256.
                  </p>
                  <p>
                    <strong>Vault System:</strong> We operate a dedicated credential vault that encrypts and manages all third-party API credentials (Plaid tokens, exchange API keys, etc.) with a master encryption key.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">4.2 Authentication & Access Control</h3>
                <div className="space-y-3">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">User Authentication</h4>
                    <ul className="text-white/70 space-y-1 ml-4 list-disc text-sm">
                      <li>Firebase Authentication with email/password or OAuth</li>
                      <li>Session tokens with expiration</li>
                      <li>Secure password reset procedures</li>
                      <li><strong className="text-green-300">Multi-factor authentication (MFA) REQUIRED</strong> before connecting Plaid bank accounts</li>
                      <li>MFA enforced for all sensitive operations (withdrawals, API key management)</li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Access Control Architecture</h4>
                    <ul className="text-white/70 space-y-2 ml-4 list-disc text-sm">
                      <li>
                        <strong>Firewall & Network Isolation:</strong> All services behind Docker network; only API gateway exposed
                      </li>
                      <li>
                        <strong>Role-Based Access Control (RBAC):</strong> User, Analyst, Admin roles with graduated permissions
                      </li>
                      <li>
                        <strong>User Data Encryption:</strong> All user identifiers encrypted; cross-service calls include encrypted user context
                      </li>
                      <li>
                        <strong>VPN & IP Allowlisting:</strong> Production deployments use VPN; critical operations restricted to allowlisted IPs
                      </li>
                      <li>
                        <strong>Comprehensive Logging:</strong> All access attempts logged; audit trails maintained for 2 years
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Database-Level Security</h4>
                    <ul className="text-white/70 space-y-1 ml-4 list-disc text-sm">
                      <li>Row-Level Security (RLS) enforced on all user data</li>
                      <li>API queries filtered by user_id automatically</li>
                      <li>JWT token validation on every request</li>
                      <li>Service-to-service authentication via encrypted credentials</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">4.3 Infrastructure Security</h3>
                <div className="space-y-3 text-white/70">
                  <p>
                    <strong>Database:</strong> PostgreSQL running in Docker with encrypted volumes, regular backups, and access controls.
                  </p>
                  <p>
                    <strong>Caching:</strong> Redis running in isolated Docker container with password protection.
                  </p>
                  <p>
                    <strong>Firewall:</strong> Services communicate via defined internal network; only necessary ports exposed.
                  </p>
                  <p>
                    <strong>Monitoring:</strong> Health checks and logging for all services; unusual activity triggers alerts.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">4.4 Vulnerability Management</h3>
                <div className="space-y-3">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Vulnerability Scanning Program</h4>
                    <ul className="text-white/70 space-y-2 ml-4 list-disc text-sm">
                      <li>
                        <strong>Frequency:</strong> Monthly automated dependency scanning with real-time alerts for critical vulnerabilities
                      </li>
                      <li>
                        <strong>Tools:</strong> OWASP Dependency-Check, Snyk, and GitHub Security scanning
                      </li>
                      <li>
                        <strong>Coverage:</strong> Python packages, npm dependencies, Docker base images, system libraries
                      </li>
                      <li>
                        <strong>Patch Timeline:</strong> Critical vulnerabilities patched within 7 days; high-severity within 30 days
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Security Review Process</h4>
                    <ul className="text-white/70 space-y-1 ml-4 list-disc text-sm">
                      <li>Code review for all security-sensitive changes</li>
                      <li>Annual penetration testing in production-like environments</li>
                      <li>Regular security hardening of APIs and services</li>
                      <li>Incident response plan with 24-hour notification</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                    <p className="text-white/70 text-sm">
                      <strong>Transparency:</strong> We report security incidents to affected users within 24 hours and to regulatory bodies as required by law.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-green-400">4.5 Data Isolation</h3>
                <p className="text-white/70 mb-3">
                  Each user's data is completely isolated:
                </p>
                <ul className="text-white/70 space-y-1 ml-4 list-disc">
                  <li>All database queries filter by user_id</li>
                  <li>API responses include only user-owned data</li>
                  <li>Service-to-service communication includes user context</li>
                  <li>One user cannot access another user's strategies, trades, or financial data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Data Retention & Deletion */}
          <section id="data-retention">
            <h2 className="text-2xl font-bold mb-4">5. Data Retention & Deletion Policy</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-400">5.1 Data Retention</h3>
                <div className="space-y-3">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Active Account Data</h4>
                    <p className="text-white/70 text-sm">
                      Retained for the duration of your account and as long as your account is active. This includes strategies, trades, positions, and performance metrics.
                    </p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Financial Transaction Data</h4>
                    <p className="text-white/70 text-sm">
                      Retained for 7 years for compliance with financial regulations (SOX, tax reporting, etc.)
                    </p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Audit Logs</h4>
                    <p className="text-white/70 text-sm">
                      Retained for 2 years for security and compliance purposes.
                    </p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Usage Analytics</h4>
                    <p className="text-white/70 text-sm">
                      Retained for 90 days; older data is aggregated and historical identifiers removed.
                    </p>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Deleted Account Data</h4>
                    <p className="text-white/70 text-sm">
                      Upon account deletion, all personal data is deleted within 30 days, except financial records retained per regulatory requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-400">5.2 Data Deletion Rights</h3>
                <p className="text-white/70 mb-4">
                  You have the right to request deletion of your data at any time:
                </p>
                <div className="space-y-3">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Full Account Deletion</h4>
                    <p className="text-white/70 text-sm mb-2">
                      Request deletion in Settings &gt; Account &gt; Delete Account
                    </p>
                    <ul className="text-white/70 text-sm space-y-1 ml-4 list-disc">
                      <li>All personal data deleted within 30 days</li>
                      <li>Financial records retained per law (7 years)</li>
                      <li>Account cannot be recovered after deletion</li>
                    </ul>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Selective Data Deletion</h4>
                    <p className="text-white/70 text-sm mb-2">
                      You can delete specific information:
                    </p>
                    <ul className="text-white/70 text-sm space-y-1 ml-4 list-disc">
                      <li>Disconnect bank accounts (removes Plaid connection)</li>
                      <li>Delete individual trades or strategies</li>
                      <li>Clear usage history and analytics</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-orange-400">5.3 Requesting Data Deletion</h3>
                <p className="text-white/70 mb-3">
                  To request data deletion:
                </p>
                <ol className="text-white/70 space-y-2 ml-4 list-decimal">
                  <li>Contact us at <a href="mailto:privacy@example.com" className="text-blue-400 hover:underline">privacy@example.com</a></li>
                  <li>Provide your email address and account ID</li>
                  <li>Specify what data should be deleted</li>
                  <li>We will confirm deletion within 30 days</li>
                  <li>You will receive a confirmation email</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 6. Your Rights */}
          <section id="user-rights">
            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            
            <div className="space-y-6">
              <p className="text-white/70">
                Under applicable privacy laws (GDPR, CCPA, etc.), you have the following rights:
              </p>

              <div className="space-y-3">
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🔍 Right to Access</h4>
                  <p className="text-white/70 text-sm">
                    You can request a copy of all personal data we hold about you. Use Settings &gt; Data Export or contact us.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">✏️ Right to Rectification</h4>
                  <p className="text-white/70 text-sm">
                    You can update or correct your personal information in Settings or by contacting us.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🗑️ Right to Erasure</h4>
                  <p className="text-white/70 text-sm">
                    You can request deletion of your account and associated data (subject to legal retention requirements).
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🚫 Right to Object</h4>
                  <p className="text-white/70 text-sm">
                    You can object to certain uses of your data (e.g., marketing communications, analytics).
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">⛓️ Right to Data Portability</h4>
                  <p className="text-white/70 text-sm">
                    You can request your data in a standard format (JSON, CSV) for transfer to another service.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">⚖️ Right to Restrict Processing</h4>
                  <p className="text-white/70 text-sm">
                    You can request that we limit how we use your data while a dispute is being resolved.
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Exercising Your Rights</h4>
                <p className="text-white/70 text-sm">
                  To exercise any of these rights, contact us at <a href="mailto:privacy@example.com" className="text-blue-400 hover:underline">privacy@example.com</a> with "DATA REQUEST" in the subject line. We will respond within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Contact */}
          <section id="contact">
            <h2 className="text-2xl font-bold mb-4">7. Contact & Support</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">7.1 Privacy Contact</h3>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg space-y-2">
                  <p className="text-white/70">
                    <strong>Name:</strong> Ernesto S., Founder & Developer
                  </p>
                  <p className="text-white/70">
                    <strong>Email:</strong> <a href="mailto:privacy@example.com" className="text-blue-400 hover:underline">privacy@example.com</a>
                  </p>
                  <p className="text-white/70">
                    <strong>Response Time:</strong> 30 days maximum
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">7.2 Third-Party Contacts</h3>
                <div className="space-y-3">
                  <div className="text-white/70">
                    <strong>🏦 Plaid, Inc.</strong><br/>
                    <a href="https://plaid.com/privacy" className="text-blue-400 hover:underline">plaid.com/privacy</a><br/>
                    <a href="mailto:privacy@plaid.com" className="text-blue-400 hover:underline">privacy@plaid.com</a>
                  </div>
                  <div className="text-white/70">
                    <strong>🔥 Firebase (Google)</strong><br/>
                    <a href="https://policies.google.com/privacy" className="text-blue-400 hover:underline">policies.google.com/privacy</a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-400">7.3 Regulatory Bodies</h3>
                <p className="text-white/70 mb-3">
                  If you believe we violate privacy laws, you can file a complaint with your local data protection authority:
                </p>
                <ul className="text-white/70 space-y-1 ml-4 list-disc">
                  <li><strong>EU:</strong> European Data Protection Board (EDPB)</li>
                  <li><strong>US:</strong> Federal Trade Commission (FTC)</li>
                  <li><strong>California:</strong> California Privacy Protection Agency (CPPA)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Changes & Updates */}
          <section className="mt-12 pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold mb-4">Policy Updates</h2>
            <p className="text-white/70 mb-4">
              We may update this Privacy Policy from time to time. Changes become effective immediately upon posting. We will notify you of material changes via email.
            </p>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-lg">
              <p className="text-white/60 text-sm">
                <strong>Version History:</strong><br/>
                v1.0 — March 23, 2026: Initial policy covering Trading OS, Plaid integration, multi-user security, and data privacy.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            <p>
              © 2026 Trading OS. All rights reserved. This Privacy Policy is provided as-is and may be subject to legal review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
