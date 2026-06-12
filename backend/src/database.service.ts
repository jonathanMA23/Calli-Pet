import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

interface CountRow {
  count: number;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'callipet',
    user: process.env.POSTGRES_USER ?? 'callipet',
    password: process.env.POSTGRES_PASSWORD ?? 'callipet_dev_2026',
    max: 5,
  });

  async getSystemStatus(): Promise<{
    databaseName: string;
    postgresVersion: string;
    counts: {
      users: number;
      pets: number;
      providers: number;
      bookings: number;
    };
  }> {
    const client = await this.pool.connect();

    try {
      const databaseResult = await client.query<{
        database_name: string;
        postgres_version: string;
      }>(`
        SELECT
          current_database() AS database_name,
          current_setting('server_version') AS postgres_version
      `);

      const [users, pets, providers, bookings] = await Promise.all([
        client.query<CountRow>('SELECT COUNT(*)::int AS count FROM users'),
        client.query<CountRow>('SELECT COUNT(*)::int AS count FROM pets'),
        client.query<CountRow>('SELECT COUNT(*)::int AS count FROM providers'),
        client.query<CountRow>('SELECT COUNT(*)::int AS count FROM bookings'),
      ]);

      return {
        databaseName: databaseResult.rows[0].database_name,
        postgresVersion: databaseResult.rows[0].postgres_version,
        counts: {
          users: users.rows[0].count,
          pets: pets.rows[0].count,
          providers: providers.rows[0].count,
          bookings: bookings.rows[0].count,
        },
      };
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
