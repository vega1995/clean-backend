import type Database from 'better-sqlite3';
import { ConflictError } from '../../../shared/domain/errors/domain.errors.ts';
import { User, type RestoreUserData } from '../../domain/entities/user.entity.ts';
import type { UserRepository } from '../../domain/repositories/user.repository.ts';

export class SqliteUserRepository implements UserRepository {
  private readonly selectByEmail: Database.Statement<[string], RestoreUserData>;
  private readonly insertUser: Database.Statement<[RestoreUserData]>;

  constructor(database: Database.Database) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL
      )
    `);

    this.selectByEmail = database.prepare(`
      SELECT id, name, email, role FROM users WHERE email = ?
    `);
    this.insertUser = database.prepare(`
      INSERT INTO users (id, name, email, role) VALUES (@id, @name, @email, @role)
      ON CONFLICT(email) DO NOTHING
    `);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const row = this.selectByEmail.get(email);
    return row === undefined ? undefined : User.restore(row);
  }

  async save({ id, name, email, role }: User): Promise<void> {
    const result = this.insertUser.run({ id, name, email, role });
    if (result.changes === 0) {
      throw new ConflictError('El usuario ya existe');
    }
  }
}
