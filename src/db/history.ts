import { db } from './index.ts';
import { evolutionHistory, algorithms } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function recordEvolutionCycle(data: {
  algorithmId: string;
  userId?: string;
  generation: number;
  mutationType: string;
  mutationRationale: string;
  code: string;
  avgLatencyUs: number;
  soundnessScore: number;
  proofTrace: string[];
}) {
  try {
    const inserted = await db.insert(evolutionHistory).values({
      algorithmId: data.algorithmId,
      userId: data.userId || null,
      generation: data.generation,
      mutationType: data.mutationType,
      mutationRationale: data.mutationRationale,
      code: data.code,
      avgLatencyUs: data.avgLatencyUs,
      soundnessScore: data.soundnessScore,
      proofTrace: JSON.stringify(data.proofTrace),
    }).returning();

    // Also update algorithms table
    await db.insert(algorithms).values({
      id: data.algorithmId,
      name: data.algorithmId,
      domain: 'Neurosymbolic Computation',
      currentGeneration: data.generation,
      activeCode: data.code,
      fitnessScore: data.soundnessScore,
      avgLatencyUs: data.avgLatencyUs,
    }).onConflictDoUpdate({
      target: algorithms.id,
      set: {
        currentGeneration: data.generation,
        activeCode: data.code,
        fitnessScore: data.soundnessScore,
        avgLatencyUs: data.avgLatencyUs,
        updatedAt: new Date(),
      },
    });

    return inserted[0];
  } catch (error) {
    console.error('Failed to record evolution in database:', error);
    // Non-fatal logging to preserve runtime
    return null;
  }
}

export async function getEvolutionHistory(algorithmId: string) {
  try {
    return await db
      .select()
      .from(evolutionHistory)
      .where(eq(evolutionHistory.algorithmId, algorithmId))
      .orderBy(desc(evolutionHistory.generation));
  } catch (error) {
    console.error('Failed to query evolution history:', error);
    return [];
  }
}
