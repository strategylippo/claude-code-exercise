// Mock Database - For exercise purposes only

export interface QueryResult {
  affectedRows: number;
}

export class Database {
  async query(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]> {
    // Mock implementation
    console.log('Executing query:', sql, params);
    return [];
  }

  async execute(sql: string, params?: unknown[]): Promise<QueryResult> {
    // Mock implementation
    console.log('Executing:', sql, params);
    return { affectedRows: 0 };
  }
}
