import { EnemyType } from '../config/enemyStyles';

export type PatternNode = {
  type: 'spawn';
  enemyType: EnemyType;
  lane: number;
  time: number;
} | {
  type: 'delay';
  duration: number;
};

export type EnemyPattern = {
  name: string;
  nodes: PatternNode[];
};
