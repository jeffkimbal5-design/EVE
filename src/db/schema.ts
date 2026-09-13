import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'algorithms' table
export const algorithms = pgTable('algorithms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain').notNull(),
  currentGeneration: integer('current_generation').notNull().default(0),
  activeCode: text('active_code').notNull(),
  fitnessScore: integer('fitness_score').notNull().default(100),
  avgLatencyUs: integer('avg_latency_us').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define the 'evolution_history' table
export const evolutionHistory = pgTable('evolution_history', {
  id: serial('id').primaryKey(),
  algorithmId: text('algorithm_id').notNull(),
  userId: text('user_id'),
  generation: integer('generation').notNull(),
  mutationType: text('mutation_type').notNull(),
  mutationRationale: text('mutation_rationale').notNull(),
  code: text('code').notNull(),
  avgLatencyUs: integer('avg_latency_us').notNull(),
  soundnessScore: integer('soundness_score').notNull(),
  proofTrace: text('proof_trace').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  evolutions: many(evolutionHistory),
}));

export const evolutionHistoryRelations = relations(evolutionHistory, ({ one }) => ({
  user: one(users, {
    fields: [evolutionHistory.userId],
    references: [users.uid],
  }),
}));
