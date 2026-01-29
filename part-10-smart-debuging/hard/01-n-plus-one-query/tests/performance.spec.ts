import { describe, it, expect, beforeEach } from 'vitest';
import { ReportService, resetQueryStats, getQueryStats } from '../src/services/report-service';
import { initializeTestData } from '../src/repositories';

describe('Report Service Performance', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
    resetQueryStats();
  });

  describe('generateProjectReport', () => {
    it('should generate report with acceptable query count for 10 tasks', async () => {
      initializeTestData(10);

      const report = await reportService.generateProjectReport('project-1');
      const stats = reportService.getQueryStatistics();

      expect(report.totalTasks).toBe(10);
      expect(report.tasks.length).toBe(10);

      // BUG: Current implementation makes 1 + (10 * 3) = 31 queries
      // Should be ~4-5 queries max (batch loading)
      console.log('Query stats for 10 tasks:', stats);

      // This test will fail with current N+1 implementation
      expect(stats.totalQueries).toBeLessThanOrEqual(5);
    });

    it('should generate report with acceptable query count for 100 tasks', async () => {
      initializeTestData(100);

      const startTime = Date.now();
      const report = await reportService.generateProjectReport('project-1');
      const duration = Date.now() - startTime;
      const stats = reportService.getQueryStatistics();

      expect(report.totalTasks).toBe(100);

      // BUG: Current implementation makes 1 + (100 * 3) = 301 queries
      // Should be ~4-5 queries max
      console.log('Query stats for 100 tasks:', stats);
      console.log('Duration:', duration, 'ms');

      // Should complete in under 100ms with proper batching
      // Currently takes 300+ queries * 5ms = 1500ms+
      expect(stats.totalQueries).toBeLessThanOrEqual(5);
      expect(duration).toBeLessThan(200);
    });

    it('should not scale linearly with task count', async () => {
      // Test with 10 tasks
      initializeTestData(10);
      resetQueryStats();
      await reportService.generateProjectReport('project-1');
      const stats10 = getQueryStats();

      // Test with 100 tasks
      initializeTestData(100);
      resetQueryStats();
      await reportService.generateProjectReport('project-1');
      const stats100 = getQueryStats();

      console.log('10 tasks:', stats10.totalQueries, 'queries');
      console.log('100 tasks:', stats100.totalQueries, 'queries');

      // With N+1: 100 tasks = 10x queries of 10 tasks
      // With batching: 100 tasks = same queries as 10 tasks
      // Allow small increase (2x) but not linear (10x)
      expect(stats100.totalQueries).toBeLessThan(stats10.totalQueries * 2);
    });
  });

  describe('getTasksWithAssignees', () => {
    it('should fetch tasks efficiently', async () => {
      initializeTestData(50);
      resetQueryStats();

      const taskIds = Array.from({ length: 20 }, (_, i) => `task-${i + 1}`);
      const result = await reportService.getTasksWithAssignees(taskIds);
      const stats = getQueryStats();

      expect(result.length).toBe(20);

      // BUG: Current makes 20 * 3 = 60 queries
      // Should be 3 queries (tasks, users, comments)
      expect(stats.totalQueries).toBeLessThanOrEqual(4);
    });
  });

  describe('Query type distribution', () => {
    it('should use batch queries instead of individual queries', async () => {
      initializeTestData(20);
      resetQueryStats();

      await reportService.generateProjectReport('project-1');
      const stats = getQueryStats();

      console.log('Query types:', stats.queryTypes);

      // Should NOT have individual getUserById, getCommentsByTaskId, etc.
      // Should have batch versions: getUsersByIds, getCommentCountsByTaskIds
      expect(stats.queryTypes['getUserById'] || 0).toBe(0);
      expect(stats.queryTypes['getCommentsByTaskId'] || 0).toBe(0);
      expect(stats.queryTypes['getActivityLogByTaskId'] || 0).toBe(0);

      // Should have batch queries
      expect(stats.queryTypes['getTasksByProjectId']).toBe(1);
      expect(stats.queryTypes['getUsersByIds']).toBe(1);
      expect(stats.queryTypes['getCommentCountsByTaskIds']).toBe(1);
      expect(stats.queryTypes['getRecentActivitiesByTaskIds']).toBe(1);
    });
  });
});
