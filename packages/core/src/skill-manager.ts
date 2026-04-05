/**
 * SkillManager - 31 skills from qwen-only, deduplicated
 */

export class SkillManager {
  private skills = new Map<string, SkillDefinition>();

  /**
   * Load all skills from the unified catalog
   */
  async loadAll(): Promise<void> {
    const skills: Array<[string, SkillDefinition]> = [
      // Core skills
      ['agentdb-advanced', { name: 'agentdb-advanced', category: 'memory', description: 'Advanced AgentDB operations with HNSW indexing' }],
      ['agentdb-learning', { name: 'agentdb-learning', category: 'memory', description: 'Automatic pattern learning from sessions' }],
      ['pdf', { name: 'pdf', category: 'io', description: 'Read and process PDF files' }],
      ['xlsx', { name: 'xlsx', category: 'io', description: 'Read and write Excel spreadsheets' }],
      ['ms-office-suite', { name: 'ms-office-suite', category: 'io', description: 'Microsoft Office suite integration' }],

      // Architecture skills
      ['system-design', { name: 'system-design', category: 'architecture', description: 'System design patterns and best practices' }],
      ['ddd-patterns', { name: 'ddd-patterns', category: 'architecture', description: 'Domain-driven design patterns' }],
      ['clean-architecture', { name: 'clean-architecture', category: 'architecture', description: 'Clean architecture principles' }],

      // Security skills
      ['security-audit', { name: 'security-audit', category: 'security', description: 'Security auditing methodology' }],
      ['pentest-basics', { name: 'pentest-basics', category: 'security', description: 'Basic penetration testing skills' }],

      // Development skills
      ['test-driven-dev', { name: 'test-driven-dev', category: 'dev', description: 'Test-driven development practices' }],
      ['refactoring', { name: 'refactoring', category: 'dev', description: 'Code refactoring patterns' }],
      ['code-review-checklist', { name: 'code-review-checklist', category: 'dev', description: 'Comprehensive code review checklist' }],

      // DevOps skills
      ['ci-cd-pipeline', { name: 'ci-cd-pipeline', category: 'devops', description: 'CI/CD pipeline configuration' }],
      ['docker-compose', { name: 'docker-compose', category: 'devops', description: 'Docker Compose orchestration' }],
      ['kubernetes-basics', { name: 'kubernetes-basics', category: 'devops', description: 'Kubernetes deployment patterns' }],

      // Data skills
      ['data-analysis', { name: 'data-analysis', category: 'data', description: 'Statistical data analysis' }],
      ['ml-pipeline', { name: 'ml-pipeline', category: 'data', description: 'Machine learning pipeline design' }],

      // Documentation skills
      ['api-docs', { name: 'api-docs', category: 'docs', description: 'API documentation generation' }],
      ['architecture-docs', { name: 'architecture-docs', category: 'docs', description: 'Architecture documentation' }],
      ['adr-writing', { name: 'adr-writing', category: 'docs', description: 'Architecture Decision Records' }],

      // GitHub skills
      ['github-workflows', { name: 'github-workflows', category: 'github', description: 'GitHub Actions workflow design' }],
      ['git-advanced', { name: 'git-advanced', category: 'github', description: 'Advanced Git operations' }],
      ['pr-review', { name: 'pr-review', category: 'github', description: 'Pull request review methodology' }],

      // Optimization skills
      ['performance-tuning', { name: 'performance-tuning', category: 'optimization', description: 'Application performance optimization' }],
      ['memory-management', { name: 'memory-management', category: 'optimization', description: 'Memory usage optimization' }],
      ['caching-strategies', { name: 'caching-strategies', category: 'optimization', description: 'Caching architecture and strategies' }],

      // Communication skills
      ['swarm-coordination', { name: 'swarm-coordination', category: 'communication', description: 'Multi-agent swarm coordination' }],
      ['consensus-building', { name: 'consensus-building', category: 'communication', description: 'Consensus protocol implementation' }],
    ];

    for (const [id, skill] of skills) {
      this.skills.set(id, skill);
    }
  }

  /**
   * Get a skill by name
   */
  get(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  /**
   * List all skills (with optional category filter)
   */
  list(category?: string): SkillDefinition[] {
    const all = Array.from(this.skills.values());
    return category ? all.filter(s => s.category === category) : all;
  }

  /**
   * Get skill count
   */
  get count(): number {
    return this.skills.size;
  }
}

export interface SkillDefinition {
  name: string;
  category: string;
  description: string;
}
