import { getRankEmoji, APEX_RANKS, RANK_TIERS } from '../ranks.js';

describe('getRankEmoji', () => {
  it.each([
    ['rookie',   '🔰'],
    ['bronze',   '🥉'],
    ['silver',   '🥈'],
    ['gold',     '🥇'],
    ['platinum', '🔷'],
    ['diamond',  '💎'],
    ['master',   '👑'],
    ['predator', '🦅'],
  ])('ティア %s に対して正しい絵文字 %s を返す', (tier, emoji) => {
    expect(getRankEmoji(tier)).toBe(emoji);
  });

  it('未知のティアに対して ❓ を返す', () => {
    expect(getRankEmoji('unknown')).toBe('❓');
    expect(getRankEmoji('')).toBe('❓');
  });
});

describe('APEX_RANKS', () => {
  it('28個のランクエントリを持つ', () => {
    expect(Object.keys(APEX_RANKS)).toHaveLength(28);
  });

  it('全てのキーが小文字である', () => {
    for (const key of Object.keys(APEX_RANKS)) {
      expect(key).toBe(key.toLowerCase());
    }
  });

  it('Rookie のスコアは 100', () => {
    expect(APEX_RANKS['rookie'].score).toBe(100);
  });

  it('Predator のスコアは 1000', () => {
    expect(APEX_RANKS['predator'].score).toBe(1000);
  });

  it('全スコアが正の整数である', () => {
    for (const info of Object.values(APEX_RANKS)) {
      expect(info.score).toBeGreaterThan(0);
      expect(Number.isInteger(info.score)).toBe(true);
    }
  });

  it('Bronze 内の各サブランクがスコア昇順（IV < III < II < I）', () => {
    expect(APEX_RANKS['bronze iv'].score).toBeLessThan(APEX_RANKS['bronze iii'].score);
    expect(APEX_RANKS['bronze iii'].score).toBeLessThan(APEX_RANKS['bronze ii'].score);
    expect(APEX_RANKS['bronze ii'].score).toBeLessThan(APEX_RANKS['bronze i'].score);
  });

  it('ティア間でスコアが昇順になっている', () => {
    expect(APEX_RANKS['bronze iv'].score).toBeGreaterThan(APEX_RANKS['rookie'].score);
    expect(APEX_RANKS['silver iv'].score).toBeGreaterThan(APEX_RANKS['bronze i'].score);
    expect(APEX_RANKS['gold iv'].score).toBeGreaterThan(APEX_RANKS['silver i'].score);
    expect(APEX_RANKS['platinum iv'].score).toBeGreaterThan(APEX_RANKS['gold i'].score);
    expect(APEX_RANKS['diamond iv'].score).toBeGreaterThan(APEX_RANKS['platinum i'].score);
    expect(APEX_RANKS['master'].score).toBeGreaterThan(APEX_RANKS['diamond i'].score);
    expect(APEX_RANKS['predator'].score).toBeGreaterThan(APEX_RANKS['master'].score);
  });

  it('ティア名のみのキー（"bronze"等）が平均スコアを持つ', () => {
    expect(APEX_RANKS['bronze'].score).toBe(238);
    expect(APEX_RANKS['silver'].score).toBe(338);
    expect(APEX_RANKS['gold'].score).toBe(438);
    expect(APEX_RANKS['platinum'].score).toBe(538);
    expect(APEX_RANKS['diamond'].score).toBe(638);
  });

  it('各エントリに score / display / tier フィールドを持つ', () => {
    for (const info of Object.values(APEX_RANKS)) {
      expect(typeof info.score).toBe('number');
      expect(typeof info.display).toBe('string');
      expect(typeof info.tier).toBe('string');
    }
  });
});

describe('RANK_TIERS', () => {
  it('8 ティアを持つ', () => {
    expect(RANK_TIERS).toHaveLength(8);
  });

  it('ティア名が正しい順序で並んでいる', () => {
    const names = RANK_TIERS.map(t => t.name);
    expect(names).toEqual([
      'Rookie', 'Bronze', 'Silver', 'Gold',
      'Platinum', 'Diamond', 'Master', 'Predator',
    ]);
  });

  it('各ティアに絵文字とロール名を持つ', () => {
    for (const tier of RANK_TIERS) {
      expect(tier.emoji).toBeTruthy();
      expect(tier.roles.length).toBeGreaterThan(0);
    }
  });

  it('各ティアの絵文字が getRankEmoji と一致する', () => {
    for (const tier of RANK_TIERS) {
      expect(tier.emoji).toBe(getRankEmoji(tier.name.toLowerCase()));
    }
  });
});
