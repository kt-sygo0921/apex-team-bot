import { getMemberRank, balanceTeams, calcTeamScore, Player } from '../teamBalancer.js';

function makeMember(roleNames: string[]) {
  return {
    roles: {
      cache: new Map(roleNames.map(name => [name, { name }])),
    },
  } as any;
}

function makePlayer(score: number): Player {
  return {
    member: makeMember([]),
    score,
    rankDisplay: `Rank(${score})`,
    rankTier: 'test',
    isEstimated: false,
  };
}

// ─── getMemberRank ───────────────────────────────────────────────────────────

describe('getMemberRank', () => {
  it('既知のロールに対して正しいランクを返す', () => {
    const member = makeMember(['Gold II']);
    const player = getMemberRank(member);
    expect(player.score).toBe(450);
    expect(player.rankDisplay).toBe('Gold II');
    expect(player.rankTier).toBe('gold');
    expect(player.isEstimated).toBe(false);
  });

  it('ロール名の大文字小文字を区別しない', () => {
    const player = getMemberRank(makeMember(['GOLD II']));
    expect(player.score).toBe(450);
    expect(player.rankDisplay).toBe('Gold II');
  });

  it('ランクロールがない場合 Rookie（推定）を返す', () => {
    const player = getMemberRank(makeMember(['SomeOtherRole']));
    expect(player.score).toBe(100);
    expect(player.isEstimated).toBe(true);
    expect(player.rankDisplay).toBe('Rookie（未設定）');
    expect(player.rankTier).toBe('rookie');
  });

  it('ロールがゼロ個の場合 Rookie（推定）を返す', () => {
    const player = getMemberRank(makeMember([]));
    expect(player.isEstimated).toBe(true);
    expect(player.score).toBe(100);
  });

  it('複数のランクロールを持つ場合、最高スコアを選ぶ', () => {
    const player = getMemberRank(makeMember(['Gold IV', 'Diamond I']));
    expect(player.score).toBe(675); // Diamond I
    expect(player.rankDisplay).toBe('Diamond I');
    expect(player.isEstimated).toBe(false);
  });

  it('Predator ロールを正しく処理する', () => {
    const player = getMemberRank(makeMember(['Predator']));
    expect(player.score).toBe(1000);
    expect(player.rankTier).toBe('predator');
    expect(player.isEstimated).toBe(false);
  });

  it('返された Player が元の member 参照を保持する', () => {
    const member = makeMember(['Master']);
    const player = getMemberRank(member);
    expect(player.member).toBe(member);
  });
});

// ─── calcTeamScore ───────────────────────────────────────────────────────────

describe('calcTeamScore', () => {
  it('空チームのスコアは 0', () => {
    expect(calcTeamScore([])).toBe(0);
  });

  it('チーム内のスコアを合計する', () => {
    const team = [makePlayer(400), makePlayer(600), makePlayer(300)];
    expect(calcTeamScore(team)).toBe(1300);
  });

  it('1人チームのスコアはその選手のスコア', () => {
    expect(calcTeamScore([makePlayer(800)])).toBe(800);
  });
});

// ─── balanceTeams ────────────────────────────────────────────────────────────

describe('balanceTeams', () => {
  it('全選手がいずれかのチームに割り当てられる', () => {
    const players = [makePlayer(1000), makePlayer(800), makePlayer(600), makePlayer(400)];
    const teams = balanceTeams(players, 2);
    const total = teams.reduce((sum, t) => sum + t.length, 0);
    expect(total).toBe(players.length);
  });

  it('指定したチーム数のチームを返す', () => {
    const players = Array.from({ length: 6 }, (_, i) => makePlayer((i + 1) * 100));
    expect(balanceTeams(players, 3)).toHaveLength(3);
  });

  it('スコアが均等な 4 人を 2 チームに分けた場合、チームスコアが等しい', () => {
    const players = [makePlayer(400), makePlayer(400), makePlayer(400), makePlayer(400)];
    const [t1, t2] = balanceTeams(players, 2);
    expect(calcTeamScore(t1)).toBe(calcTeamScore(t2));
    expect(t1).toHaveLength(2);
    expect(t2).toHaveLength(2);
  });

  it('高低ランクの組み合わせでチームスコアがバランスされる', () => {
    // [1000,675,375,100] → [1000,100] vs [675,375] = 1100 vs 1050
    const players = [makePlayer(1000), makePlayer(675), makePlayer(375), makePlayer(100)];
    const [t1, t2] = balanceTeams(players, 2);
    expect(Math.abs(calcTeamScore(t1) - calcTeamScore(t2))).toBeLessThanOrEqual(50);
  });

  it('チーム数 1 の場合、全選手が 1 つのチームに入る', () => {
    const players = [makePlayer(500), makePlayer(600), makePlayer(700)];
    const teams = balanceTeams(players, 1);
    expect(teams).toHaveLength(1);
    expect(teams[0]).toHaveLength(3);
  });

  it('元の配列を変更しない', () => {
    const players = [makePlayer(500), makePlayer(600), makePlayer(300)];
    const snapshot = players.map(p => p.score);
    balanceTeams(players, 2);
    expect(players.map(p => p.score)).toEqual(snapshot);
  });

  it('選手数と同じチーム数の場合、各チームに 1 人ずつ割り当てられる', () => {
    const players = [makePlayer(1000), makePlayer(800), makePlayer(600)];
    const teams = balanceTeams(players, 3);
    expect(teams).toHaveLength(3);
    for (const team of teams) {
      expect(team).toHaveLength(1);
    }
  });
});
