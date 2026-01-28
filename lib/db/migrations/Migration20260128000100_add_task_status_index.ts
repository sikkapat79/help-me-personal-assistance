import { Migration } from '@mikro-orm/migrations';

export class Migration20260128000100_add_task_status_index extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'create index if not exists "task_status_idx" on "task" ("status");',
    );
  }

  override async down(): Promise<void> {
    this.addSql('drop index if exists "task_status_idx";');
  }
}
