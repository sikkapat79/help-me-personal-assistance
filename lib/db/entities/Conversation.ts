import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Conversation {
  @PrimaryKey()
  id!: number;

  @Property()
  title: string;

  @Property()
  createdAt: Date = new Date();

  constructor(title: string) {
    this.title = Conversation.normalizeTitle(title);
  }

  // Pure domain method (no DB/network):
  rename(nextTitle: string) {
    this.title = Conversation.normalizeTitle(nextTitle);
  }

  private static normalizeTitle(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new Error("Conversation title is required");
    if (trimmed.length > 120) throw new Error("Conversation title is too long");
    return trimmed;
  }
}

