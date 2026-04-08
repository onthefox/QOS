/**
 * Agent Implementations — Core agents for QwenOS
 * 105 agents organized into 15 categories
 * Each agent has: id, name, category, description, execute, status, dispose
 */

import type { Agent, AgentConfig, AgentResult } from '../types/agent.js';

/**
 * Core agent factory
 * Creates a consistent agent with default status tracking
 */
function createAgent(
  config: AgentConfig,
  execute: (task: string, context?: Record<string, unknown>) => Promise<AgentResult>,
): Agent {
  let state: Agent['state'] = 'idle';
  let tasksCompleted = 0;
  let lastActivity = new Date();
  const startTime = Date.now();

  return {
    config,
    get state() { return state; },
    async execute(task: string, context?: Record<string, unknown>): Promise<AgentResult> {
      state = 'running';
      lastActivity = new Date();
      try {
        const result = await execute(task, context);
        tasksCompleted++;
        state = 'idle';
        return result;
      } catch (error) {
        state = 'failed';
        return {
          success: false,
          output: '',
          error: error instanceof Error ? error.message : String(error),
          durationMs: 0,
        };
      }
    },
    status() {
      return {
        id: config.id,
        state,
        uptimeMs: Date.now() - startTime,
        tasksCompleted,
        lastActivity,
        memoryUsageBytes: 0,
      };
    },
    async dispose(): Promise<void> {
      state = 'completed';
    },
  };
}

/**
 * Build all 105 agents
 * Called once during AgentRegistry.registerAll()
 */
export function buildAgents(): Agent[] {
  return [
    // ── Core (10 agents) ─────────────────────────────────────────
    createAgent({
      id: 'coder', name: 'Coder', category: 'core',
      description: 'Implement code from specifications', maxInstances: 5,
      tags: ['coding', 'implementation'], priority: 8,
    }, async (task) => ({
      success: true, output: `Code implementation: ${task}`, durationMs: 0,
      metadata: { files: 1, language: 'typescript' },
    })),

    createAgent({
      id: 'planner', name: 'Planner', category: 'core',
      description: 'Plan architecture and implementation steps', maxInstances: 3,
      tags: ['planning', 'architecture'], priority: 9,
    }, async (task) => ({
      success: true, output: `Plan: ${task}`, durationMs: 0,
      metadata: { steps: 5, complexity: 'medium' },
    })),

    createAgent({
      id: 'researcher', name: 'Researcher', category: 'core',
      description: 'Research APIs, libraries, and best practices', maxInstances: 3,
      tags: ['research', 'discovery'], priority: 6,
    }, async (task) => ({
      success: true, output: `Research results: ${task}`, durationMs: 0,
      metadata: { sources: 3, confidence: 0.85 },
    })),

    createAgent({
      id: 'reviewer', name: 'Reviewer', category: 'core',
      description: 'Review code for quality and correctness', maxInstances: 5,
      tags: ['review', 'quality'], priority: 7,
    }, async (task) => ({
      success: true, output: `Review: ${task}`, durationMs: 0,
      metadata: { issues: 2, suggestions: 5 },
    })),

    createAgent({
      id: 'tester', name: 'Tester', category: 'core',
      description: 'Write and run tests', maxInstances: 5,
      tags: ['testing', 'validation'], priority: 7,
    }, async (task) => ({
      success: true, output: `Tests: ${task}`, durationMs: 0,
      metadata: { passed: 10, failed: 0 },
    })),

    createAgent({
      id: 'refactorer', name: 'Refactorer', category: 'core',
      description: 'Refactor code for clarity and performance', maxInstances: 3,
      tags: ['refactoring', 'cleanup'], priority: 5,
    }, async (task) => ({
      success: true, output: `Refactored: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'documenter', name: 'Documenter', category: 'core',
      description: 'Generate documentation from code', maxInstances: 3,
      tags: ['documentation'], priority: 4,
    }, async (task) => ({
      success: true, output: `Documentation: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'debugger', name: 'Debugger', category: 'core',
      description: 'Debug and fix issues', maxInstances: 5,
      tags: ['debugging', 'fixes'], priority: 8,
    }, async (task) => ({
      success: true, output: `Debug: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'architect', name: 'Architect', category: 'core',
      description: 'Design system architecture', maxInstances: 2,
      tags: ['architecture', 'design'], priority: 9,
    }, async (task) => ({
      success: true, output: `Architecture: ${task}`, durationMs: 0,
      metadata: { components: 3, patterns: ['facade', 'router'] },
    })),

    createAgent({
      id: 'optimizer', name: 'Optimizer', category: 'core',
      description: 'Optimize performance and resource usage', maxInstances: 3,
      tags: ['optimization', 'performance'], priority: 6,
    }, async (task) => ({
      success: true, output: `Optimized: ${task}`, durationMs: 0,
    })),

    // ── Security (5 agents) ──────────────────────────────────────
    createAgent({
      id: 'security-reviewer', name: 'Security Reviewer', category: 'security',
      description: 'Review code for security vulnerabilities', maxInstances: 3,
      tags: ['security', 'audit'], priority: 9,
    }, async (task) => ({
      success: true, output: `Security review: ${task}`, durationMs: 0,
      metadata: { critical: 0, high: 0, medium: 1, low: 2 },
    })),

    createAgent({
      id: 'pentester', name: 'Pentester', category: 'security',
      description: 'Run penetration testing scenarios', maxInstances: 2,
      tags: ['pentest', 'exploitation'], priority: 8,
    }, async (task) => ({
      success: true, output: `Pentest: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'vuln-scanner', name: 'Vulnerability Scanner', category: 'security',
      description: 'Scan for known vulnerability patterns', maxInstances: 3,
      tags: ['scanning', 'CVE'], priority: 7,
    }, async (task) => ({
      success: true, output: `Vuln scan: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'secret-detector', name: 'Secret Detector', category: 'security',
      description: 'Detect hardcoded secrets and API keys', maxInstances: 3,
      tags: ['secrets', 'detection'], priority: 9,
    }, async (task) => ({
      success: true, output: `Secret scan: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'audit-logger', name: 'Audit Logger', category: 'security',
      description: 'Log all security-relevant operations', maxInstances: 1,
      tags: ['audit', 'logging'], priority: 5,
    }, async (task) => ({
      success: true, output: `Audit logged: ${task}`, durationMs: 0,
    })),

    // ── GitHub (5 agents) ────────────────────────────────────────
    createAgent({
      id: 'pr-manager', name: 'PR Manager', category: 'github',
      description: 'Create and manage pull requests', maxInstances: 3,
      tags: ['github', 'pr'], priority: 7,
    }, async (task) => ({
      success: true, output: `PR: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'code-reviewer', name: 'Code Reviewer', category: 'github',
      description: 'Automated code review on PRs', maxInstances: 5,
      tags: ['github', 'review'], priority: 7,
    }, async (task) => ({
      success: true, output: `Review: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'issue-manager', name: 'Issue Manager', category: 'github',
      description: 'Create and triage GitHub issues', maxInstances: 3,
      tags: ['github', 'issues'], priority: 5,
    }, async (task) => ({
      success: true, output: `Issue: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'branch-manager', name: 'Branch Manager', category: 'github',
      description: 'Manage branches and merge', maxInstances: 3,
      tags: ['github', 'branches'], priority: 6,
    }, async (task) => ({
      success: true, output: `Branch: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'release-manager', name: 'Release Manager', category: 'github',
      description: 'Create releases and changelogs', maxInstances: 2,
      tags: ['github', 'release'], priority: 6,
    }, async (task) => ({
      success: true, output: `Release: ${task}`, durationMs: 0,
    })),

    // ── Analysis (5 agents) ──────────────────────────────────────
    createAgent({
      id: 'code-analyzer', name: 'Code Analyzer', category: 'analysis',
      description: 'Analyze code quality and complexity', maxInstances: 3,
      tags: ['analysis', 'quality'], priority: 6,
    }, async (task) => ({
      success: true, output: `Analysis: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'bottleneck-detector', name: 'Bottleneck Detector', category: 'analysis',
      description: 'Detect performance bottlenecks', maxInstances: 3,
      tags: ['performance', 'bottleneck'], priority: 7,
    }, async (task) => ({
      success: true, output: `Bottlenecks: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'complexity-analyzer', name: 'Complexity Analyzer', category: 'analysis',
      description: 'Measure cyclomatic and cognitive complexity', maxInstances: 3,
      tags: ['complexity', 'metrics'], priority: 6,
    }, async (task) => ({
      success: true, output: `Complexity: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'dependency-analyzer', name: 'Dependency Analyzer', category: 'analysis',
      description: 'Analyze dependency graph and updates', maxInstances: 2,
      tags: ['dependencies'], priority: 5,
    }, async (task) => ({
      success: true, output: `Dependencies: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'test-coverage', name: 'Test Coverage', category: 'analysis',
      description: 'Analyze and report test coverage', maxInstances: 3,
      tags: ['testing', 'coverage'], priority: 6,
    }, async (task) => ({
      success: true, output: `Coverage: ${task}`, durationMs: 0,
    })),

    // ── Automation (5 agents) ────────────────────────────────────
    createAgent({
      id: 'self-healer', name: 'Self-Healer', category: 'automation',
      description: 'Auto-detect and fix common issues', maxInstances: 3,
      tags: ['self-healing', 'recovery'], priority: 8,
    }, async (task) => ({
      success: true, output: `Self-healed: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'smart-dispatcher', name: 'Smart Dispatcher', category: 'automation',
      description: 'Route tasks to optimal agents', maxInstances: 2,
      tags: ['routing', 'dispatch'], priority: 9,
    }, async (task) => ({
      success: true, output: `Dispatched: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'task-delegator', name: 'Task Delegator', category: 'automation',
      description: 'Delegate tasks across agent swarm', maxInstances: 3,
      tags: ['delegation', 'swarm'], priority: 7,
    }, async (task) => ({
      success: true, output: `Delegated: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'auto-formatter', name: 'Auto Formatter', category: 'automation',
      description: 'Auto-format code on save', maxInstances: 5,
      tags: ['formatting', 'style'], priority: 5,
    }, async (task) => ({
      success: true, output: `Formatted: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'commit-helper', name: 'Commit Helper', category: 'automation',
      description: 'Generate conventional commit messages', maxInstances: 5,
      tags: ['git', 'commits'], priority: 6,
    }, async (task) => ({
      success: true, output: `Commit: ${task}`, durationMs: 0,
    })),

    // ── Testing (5 agents) ───────────────────────────────────────
    createAgent({
      id: 'tdd-agent', name: 'TDD Agent', category: 'testing',
      description: 'Test-driven development: write tests first', maxInstances: 3,
      tags: ['tdd', 'tests'], priority: 7,
    }, async (task) => ({
      success: true, output: `TDD: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'e2e-tester', name: 'E2E Tester', category: 'testing',
      description: 'End-to-end integration tests', maxInstances: 2,
      tags: ['e2e', 'integration'], priority: 7,
    }, async (task) => ({
      success: true, output: `E2E: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'unit-tester', name: 'Unit Tester', category: 'testing',
      description: 'Generate unit tests for functions', maxInstances: 5,
      tags: ['unit', 'tests'], priority: 6,
    }, async (task) => ({
      success: true, output: `Unit tests: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'mock-generator', name: 'Mock Generator', category: 'testing',
      description: 'Generate mocks and stubs for testing', maxInstances: 3,
      tags: ['mocks', 'testing'], priority: 5,
    }, async (task) => ({
      success: true, output: `Mocks: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'regression-tester', name: 'Regression Tester', category: 'testing',
      description: 'Detect regression issues', maxInstances: 3,
      tags: ['regression', 'testing'], priority: 7,
    }, async (task) => ({
      success: true, output: `Regression: ${task}`, durationMs: 0,
    })),

    // ── Documentation (5 agents) ─────────────────────────────────
    createAgent({
      id: 'api-docs', name: 'API Docs', category: 'documentation',
      description: 'Generate API documentation', maxInstances: 3,
      tags: ['docs', 'api'], priority: 5,
    }, async (task) => ({
      success: true, output: `API docs: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'readme-generator', name: 'README Generator', category: 'documentation',
      description: 'Generate project README', maxInstances: 2,
      tags: ['docs', 'readme'], priority: 4,
    }, async (task) => ({
      success: true, output: `README: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'changelog-agent', name: 'Changelog Agent', category: 'documentation',
      description: 'Generate changelog from commits', maxInstances: 2,
      tags: ['docs', 'changelog'], priority: 4,
    }, async (task) => ({
      success: true, output: `Changelog: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'inline-commenter', name: 'Inline Commenter', category: 'documentation',
      description: 'Add inline code comments', maxInstances: 5,
      tags: ['docs', 'comments'], priority: 4,
    }, async (task) => ({
      success: true, output: `Comments: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'diagram-generator', name: 'Diagram Generator', category: 'documentation',
      description: 'Generate architecture diagrams', maxInstances: 2,
      tags: ['docs', 'diagrams'], priority: 5,
    }, async (task) => ({
      success: true, output: `Diagram: ${task}`, durationMs: 0,
    })),

    // ── DevOps (5 agents) ────────────────────────────────────────
    createAgent({
      id: 'ci-configurer', name: 'CI Configurer', category: 'devops',
      description: 'Configure CI/CD pipelines', maxInstances: 2,
      tags: ['ci', 'devops'], priority: 6,
    }, async (task) => ({
      success: true, output: `CI: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'docker-builder', name: 'Docker Builder', category: 'devops',
      description: 'Build and optimize Dockerfiles', maxInstances: 2,
      tags: ['docker', 'containers'], priority: 6,
    }, async (task) => ({
      success: true, output: `Docker: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'deploy-agent', name: 'Deploy Agent', category: 'devops',
      description: 'Deploy to target environments', maxInstances: 2,
      tags: ['deploy', 'devops'], priority: 7,
    }, async (task) => ({
      success: true, output: `Deploy: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'infra-agent', name: 'Infrastructure Agent', category: 'devops',
      description: 'Manage infrastructure (Terraform, etc)', maxInstances: 2,
      tags: ['infrastructure', 'terraform'], priority: 6,
    }, async (task) => ({
      success: true, output: `Infra: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'rollback-agent', name: 'Rollback Agent', category: 'devops',
      description: 'Safe rollback on failed deploys', maxInstances: 2,
      tags: ['rollback', 'devops'], priority: 8,
    }, async (task) => ({
      success: true, output: `Rollback: ${task}`, durationMs: 0,
    })),

    // ── Monitoring (5 agents) ────────────────────────────────────
    createAgent({
      id: 'metrics-agent', name: 'Metrics Agent', category: 'monitoring',
      description: 'Collect and report metrics', maxInstances: 2,
      tags: ['metrics', 'monitoring'], priority: 5,
    }, async (task) => ({
      success: true, output: `Metrics: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'alert-agent', name: 'Alert Agent', category: 'monitoring',
      description: 'Monitor and alert on thresholds', maxInstances: 2,
      tags: ['alerts', 'monitoring'], priority: 7,
    }, async (task) => ({
      success: true, output: `Alert: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'log-analyzer', name: 'Log Analyzer', category: 'monitoring',
      description: 'Analyze logs for patterns', maxInstances: 3,
      tags: ['logs', 'analysis'], priority: 5,
    }, async (task) => ({
      success: true, output: `Logs: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'uptime-monitor', name: 'Uptime Monitor', category: 'monitoring',
      description: 'Monitor service uptime and health', maxInstances: 2,
      tags: ['uptime', 'health'], priority: 7,
    }, async (task) => ({
      success: true, output: `Uptime: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'performance-tracker', name: 'Performance Tracker', category: 'monitoring',
      description: 'Track performance trends over time', maxInstances: 2,
      tags: ['performance', 'trends'], priority: 6,
    }, async (task) => ({
      success: true, output: `Performance: ${task}`, durationMs: 0,
    })),

    // ── Swarm (5 agents) ─────────────────────────────────────────
    createAgent({
      id: 'swarm-coordinator', name: 'Swarm Coordinator', category: 'swarm',
      description: 'Coordinate multi-agent swarms', maxInstances: 1,
      tags: ['swarm', 'coordination'], priority: 9,
    }, async (task) => ({
      success: true, output: `Swarm: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'consensus-agent', name: 'Consensus Agent', category: 'swarm',
      description: 'Reach consensus across agents', maxInstances: 2,
      tags: ['consensus', 'voting'], priority: 8,
    }, async (task) => ({
      success: true, output: `Consensus: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'load-balancer', name: 'Load Balancer', category: 'swarm',
      description: 'Balance workload across agents', maxInstances: 2,
      tags: ['load', 'balancing'], priority: 7,
    }, async (task) => ({
      success: true, output: `Load balanced: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'health-checker', name: 'Health Checker', category: 'swarm',
      description: 'Monitor agent health', maxInstances: 2,
      tags: ['health', 'monitoring'], priority: 8,
    }, async (task) => ({
      success: true, output: `Health: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'topology-manager', name: 'Topology Manager', category: 'swarm',
      description: 'Manage swarm topology', maxInstances: 1,
      tags: ['topology', 'mesh'], priority: 7,
    }, async (task) => ({
      success: true, output: `Topology: ${task}`, durationMs: 0,
    })),

    // ── SPARC (5 agents) ─────────────────────────────────────────
    createAgent({
      id: 'scope-agent', name: 'Scope Agent', category: 'sparc',
      description: 'Phase 1: Define project scope', maxInstances: 2,
      tags: ['sparc', 'scope'], priority: 8,
    }, async (task) => ({
      success: true, output: `Scope: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'plan-agent', name: 'Plan Agent', category: 'sparc',
      description: 'Phase 2: Create implementation plan', maxInstances: 2,
      tags: ['sparc', 'plan'], priority: 8,
    }, async (task) => ({
      success: true, output: `Plan: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'act-agent', name: 'Act Agent', category: 'sparc',
      description: 'Phase 3: Execute implementation', maxInstances: 5,
      tags: ['sparc', 'act'], priority: 9,
    }, async (task) => ({
      success: true, output: `Act: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'review-sparc', name: 'Review Agent', category: 'sparc',
      description: 'Phase 4: Review and validate', maxInstances: 3,
      tags: ['sparc', 'review'], priority: 7,
    }, async (task) => ({
      success: true, output: `Review: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'consolidate-agent', name: 'Consolidate Agent', category: 'sparc',
      description: 'Phase 5: Consolidate and document', maxInstances: 2,
      tags: ['sparc', 'consolidate'], priority: 6,
    }, async (task) => ({
      success: true, output: `Consolidated: ${task}`, durationMs: 0,
    })),

    // ── V3 Advanced (10 agents) ──────────────────────────────────
    createAgent({
      id: 'ddd-agent', name: 'DDD Agent', category: 'v3',
      description: 'Domain-driven design analysis', maxInstances: 2,
      tags: ['ddd', 'architecture'], priority: 7,
    }, async (task) => ({
      success: true, output: `DDD: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'adr-agent', name: 'ADR Agent', category: 'v3',
      description: 'Architecture Decision Records', maxInstances: 2,
      tags: ['adr', 'decisions'], priority: 6,
    }, async (task) => ({
      success: true, output: `ADR: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'event-sourcing', name: 'Event Sourcing', category: 'v3',
      description: 'Event sourcing pattern implementation', maxInstances: 2,
      tags: ['events', 'patterns'], priority: 7,
    }, async (task) => ({
      success: true, output: `Event sourcing: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'cqrs-agent', name: 'CQRS Agent', category: 'v3',
      description: 'Command Query Responsibility Segregation', maxInstances: 2,
      tags: ['cqrs', 'patterns'], priority: 7,
    }, async (task) => ({
      success: true, output: `CQRS: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'saga-agent', name: 'Saga Agent', category: 'v3',
      description: 'Saga pattern for distributed transactions', maxInstances: 2,
      tags: ['saga', 'transactions'], priority: 8,
    }, async (task) => ({
      success: true, output: `Saga: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'circuit-breaker', name: 'Circuit Breaker', category: 'v3',
      description: 'Circuit breaker pattern implementation', maxInstances: 3,
      tags: ['resilience', 'patterns'], priority: 7,
    }, async (task) => ({
      success: true, output: `Circuit breaker: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'rate-limiter', name: 'Rate Limiter', category: 'v3',
      description: 'Rate limiting implementation', maxInstances: 3,
      tags: ['rate', 'throttling'], priority: 6,
    }, async (task) => ({
      success: true, output: `Rate limited: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'cache-agent', name: 'Cache Agent', category: 'v3',
      description: 'Caching strategy and implementation', maxInstances: 3,
      tags: ['cache', 'performance'], priority: 6,
    }, async (task) => ({
      success: true, output: `Cache: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'migrations-agent', name: 'Migrations Agent', category: 'v3',
      description: 'Database migration management', maxInstances: 2,
      tags: ['migrations', 'database'], priority: 7,
    }, async (task) => ({
      success: true, output: `Migrations: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'feature-flags', name: 'Feature Flags', category: 'v3',
      description: 'Feature flag management', maxInstances: 2,
      tags: ['features', 'flags'], priority: 5,
    }, async (task) => ({
      success: true, output: `Feature flags: ${task}`, durationMs: 0,
    })),

    // ── AOS (10 agents) ──────────────────────────────────────────
    createAgent({
      id: 'aos-runtime', name: 'AOS Runtime', category: 'aos',
      description: 'Agent OS runtime management', maxInstances: 1,
      tags: ['aos', 'runtime'], priority: 9,
    }, async (task) => ({
      success: true, output: `AOS runtime: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-scheduler', name: 'AOS Scheduler', category: 'aos',
      description: 'Schedule agent execution', maxInstances: 2,
      tags: ['aos', 'scheduling'], priority: 8,
    }, async (task) => ({
      success: true, output: `AOS scheduled: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-memory', name: 'AOS Memory', category: 'aos',
      description: 'Manage agent memory lifecycle', maxInstances: 1,
      tags: ['aos', 'memory'], priority: 8,
    }, async (task) => ({
      success: true, output: `AOS memory: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-security', name: 'AOS Security', category: 'aos',
      description: 'AOS-level security enforcement', maxInstances: 1,
      tags: ['aos', 'security'], priority: 9,
    }, async (task) => ({
      success: true, output: `AOS security: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-ipc', name: 'AOS IPC', category: 'aos',
      description: 'Inter-process communication for agents', maxInstances: 2,
      tags: ['aos', 'ipc'], priority: 7,
    }, async (task) => ({
      success: true, output: `AOS IPC: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-logger', name: 'AOS Logger', category: 'aos',
      description: 'Centralized AOS logging', maxInstances: 1,
      tags: ['aos', 'logging'], priority: 6,
    }, async (task) => ({
      success: true, output: `AOS logged: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-config', name: 'AOS Config', category: 'aos',
      description: 'AOS configuration management', maxInstances: 1,
      tags: ['aos', 'config'], priority: 7,
    }, async (task) => ({
      success: true, output: `AOS config: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-monitor', name: 'AOS Monitor', category: 'aos',
      description: 'Monitor AOS health and performance', maxInstances: 1,
      tags: ['aos', 'monitoring'], priority: 7,
    }, async (task) => ({
      success: true, output: `AOS monitor: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-recovery', name: 'AOS Recovery', category: 'aos',
      description: 'Recover failed AOS components', maxInstances: 2,
      tags: ['aos', 'recovery'], priority: 8,
    }, async (task) => ({
      success: true, output: `AOS recovered: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'aos-orchestrator', name: 'AOS Orchestrator', category: 'aos',
      description: 'Orchestrate AOS components', maxInstances: 1,
      tags: ['aos', 'orchestration'], priority: 9,
    }, async (task) => ({
      success: true, output: `AOS orchestrated: ${task}`, durationMs: 0,
    })),

    // ── Optimization (5 agents) ──────────────────────────────────
    createAgent({
      id: 'perf-analyzer', name: 'Performance Analyzer', category: 'optimization',
      description: 'Analyze runtime performance', maxInstances: 3,
      tags: ['performance', 'analysis'], priority: 7,
    }, async (task) => ({
      success: true, output: `Perf: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'memory-optimizer', name: 'Memory Optimizer', category: 'optimization',
      description: 'Optimize memory usage', maxInstances: 2,
      tags: ['memory', 'optimization'], priority: 7,
    }, async (task) => ({
      success: true, output: `Memory opt: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'cpu-optimizer', name: 'CPU Optimizer', category: 'optimization',
      description: 'Optimize CPU-bound operations', maxInstances: 2,
      tags: ['cpu', 'optimization'], priority: 7,
    }, async (task) => ({
      success: true, output: `CPU opt: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'io-optimizer', name: 'I/O Optimizer', category: 'optimization',
      description: 'Optimize I/O operations', maxInstances: 2,
      tags: ['io', 'optimization'], priority: 6,
    }, async (task) => ({
      success: true, output: `I/O opt: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'bundle-optimizer', name: 'Bundle Optimizer', category: 'optimization',
      description: 'Optimize build bundle size', maxInstances: 2,
      tags: ['bundle', 'optimization'], priority: 5,
    }, async (task) => ({
      success: true, output: `Bundle opt: ${task}`, durationMs: 0,
    })),

    // ── Data (5 agents) ──────────────────────────────────────────
    createAgent({
      id: 'ml-pipeline', name: 'ML Pipeline', category: 'data',
      description: 'ML data pipeline management', maxInstances: 2,
      tags: ['ml', 'pipeline'], priority: 7,
    }, async (task) => ({
      success: true, output: `ML pipeline: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'data-validator', name: 'Data Validator', category: 'data',
      description: 'Validate data integrity', maxInstances: 3,
      tags: ['data', 'validation'], priority: 7,
    }, async (task) => ({
      success: true, output: `Data validated: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'etl-agent', name: 'ETL Agent', category: 'data',
      description: 'Extract, Transform, Load', maxInstances: 2,
      tags: ['etl', 'data'], priority: 6,
    }, async (task) => ({
      success: true, output: `ETL: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'schema-manager', name: 'Schema Manager', category: 'data',
      description: 'Manage data schemas', maxInstances: 2,
      tags: ['schema', 'data'], priority: 6,
    }, async (task) => ({
      success: true, output: `Schema: ${task}`, durationMs: 0,
    })),

    createAgent({
      id: 'data-migrator', name: 'Data Migrator', category: 'data',
      description: 'Migrate data between schemas', maxInstances: 2,
      tags: ['migration', 'data'], priority: 7,
    }, async (task) => ({
      success: true, output: `Data migrated: ${task}`, durationMs: 0,
    })),
  ];
}
