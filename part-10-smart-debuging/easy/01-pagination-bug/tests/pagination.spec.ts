import { describe, it, expect, beforeEach } from 'vitest';
import { createTask, getTasks, clearTasks } from '../src/services/task.service';

describe('Task Pagination', () => {
  beforeEach(() => {
    clearTasks();
    // Create 15 tasks
    for (let i = 1; i <= 15; i++) {
      createTask(`Task ${i}`, `Description for task ${i}`);
    }
  });

  it('should return first 10 tasks on page 1', () => {
    const result = getTasks({ page: 1, limit: 10 });

    expect(result.data.length).toBe(10);
    expect(result.data[0].title).toBe('Task 1');
    expect(result.data[9].title).toBe('Task 10');
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('should return remaining 5 tasks on page 2', () => {
    const result = getTasks({ page: 2, limit: 10 });

    expect(result.data.length).toBe(5);
    // This test fails! Page 2 should show tasks 11-15, not tasks 1-5
    expect(result.data[0].title).toBe('Task 11');
    expect(result.data[4].title).toBe('Task 15');
  });

  it('should not have duplicate tasks between pages', () => {
    const page1 = getTasks({ page: 1, limit: 10 });
    const page2 = getTasks({ page: 2, limit: 10 });

    const page1Ids = page1.data.map((t) => t.id);
    const page2Ids = page2.data.map((t) => t.id);

    // Check no duplicates
    const duplicates = page1Ids.filter((id) => page2Ids.includes(id));
    expect(duplicates.length).toBe(0);
  });

  it('should handle page 3 correctly', () => {
    // Create more tasks to have 3 pages
    for (let i = 16; i <= 25; i++) {
      createTask(`Task ${i}`, `Description for task ${i}`);
    }

    const result = getTasks({ page: 3, limit: 10 });

    expect(result.data.length).toBe(5);
    expect(result.data[0].title).toBe('Task 21');
    expect(result.data[4].title).toBe('Task 25');
  });
});
