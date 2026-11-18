// GitHub repository configuration helper for Pencil FX
const STORAGE_KEY = 'pencilfx_github_config';

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
}

export function detectGitHubConfig(): GitHubRepoConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.owner && parsed.repo) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved github config:', e);
  }

  // Auto-detect from GitHub Pages hostname e.g. <owner>.github.io/<repo>/
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  if (hostname.endsWith('.github.io')) {
    const owner = hostname.replace('.github.io', '');
    const pathParts = pathname.split('/').filter(Boolean);
    const repo = pathParts.length > 0 ? pathParts[0] : 'PencilFX';
    return { owner, repo };
  }

  return {
    owner: 'prerithm',
    repo: 'PencilFX',
  };
}

export function saveGitHubConfig(config: GitHubRepoConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save github config:', e);
  }
}

/**
 * Builds the URL to create a new prefilled GitHub Issue using .github/ISSUE_TEMPLATE/new-order.yml
 */
export function buildNewOrderIssueUrl(orderData: {
  orderId: string;
  trackingToken: string;
  studentId: string;
  studentName: string;
  pickupSlot: string;
  payloadJson: string;
  studentNotes?: string;
}): string {
  const { owner, repo } = detectGitHubConfig();
  const title = `[Order] ${orderData.orderId} - ${orderData.studentName}`;
  
  const body = `### Pencil FX Pre-Order Registration
**Order ID:** \`${orderData.orderId}\`  
**Tracking Token:** \`${orderData.trackingToken}\`  
**Student ID:** \`${orderData.studentId}\`  
**Student Name:** ${orderData.studentName}  
**Pickup Slot:** ${orderData.pickupSlot}  
${orderData.studentNotes ? `**Notes:** ${orderData.studentNotes}\n` : ''}

\`\`\`json
${orderData.payloadJson}
\`\`\`

---
*Pencil FX Campus Automated Pre-Order System. Submitting this GitHub Issue triggers repository registration via GitHub Actions.*`;

  const encodedTitle = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(body);
  const encodedLabels = encodeURIComponent('new-order');

  return `https://github.com/${owner}/${repo}/issues/new?title=${encodedTitle}&body=${encodedBody}&labels=${encodedLabels}`;
}

export function buildIssueUrl(issueNumber?: number): string {
  const { owner, repo } = detectGitHubConfig();
  if (!issueNumber) {
    return `https://github.com/${owner}/${repo}/issues`;
  }
  return `https://github.com/${owner}/${repo}/issues/${issueNumber}`;
}
