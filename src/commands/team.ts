import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import { getMemberRank, balanceTeams, calcTeamScore, Player } from "../teamBalancer.js";
import { getRankEmoji } from "../ranks.js";

export const data = new SlashCommandBuilder()
  .setName("team")
  .setDescription("ボイスチャンネルのメンバーをAPEXランクでバランスよくチーム分けします")
  .addIntegerOption((opt) =>
    opt
      .setName("num_teams")
      .setDescription("チーム数（2〜20）")
      .setMinValue(2)
      .setMaxValue(20)
      .setRequired(false)
  );

const TEAM_COLORS = [
  0xff4444, 0x44aaff, 0x44ff88, 0xffaa44, 0xff44ff,
  0x44ffff, 0xffff44, 0xff8844, 0x8844ff, 0x44ff44,
  0xff6699, 0x6699ff, 0x99ff66, 0xff9966, 0xcc44ff,
  0x44ffcc, 0xffcc44, 0xff4499, 0x4499ff, 0x99ff44,
] as const;

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const member = interaction.member as GuildMember;
  const voiceChannel = member.voice.channel as VoiceChannel | null;

  if (!voiceChannel) {
    await interaction.editReply("❌ ボイスチャンネルに参加してからコマンドを使用してください。");
    return;
  }

  const vcMembers = voiceChannel.members.filter((m) => !m.user.bot);

  if (vcMembers.size === 0) {
    await interaction.editReply("❌ ボイスチャンネルにメンバーがいません。");
    return;
  }

  const numTeams = interaction.options.getInteger("num_teams") ?? 2;

  if (numTeams > vcMembers.size) {
    await interaction.editReply(
      `❌ チーム数（${numTeams}）がメンバー数（${vcMembers.size}）を超えています。`
    );
    return;
  }

  const players: Player[] = vcMembers.map((m) => getMemberRank(m));
  const teams = balanceTeams(players, numTeams);
  const hasEstimated = players.some((p) => p.isEstimated);

  const embed = new EmbedBuilder()
    .setTitle(`⚔️ チーム振り分け結果 — ${voiceChannel.name}`)
    .setDescription(`**${numTeams}チーム** に分けました（APEXランクによるバランス調整済み）`)
    .setColor(TEAM_COLORS[0])
    .setTimestamp();

  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const totalScore = calcTeamScore(team);
    const avgScore = totalScore / team.length;

    const lines = [...team]
      .sort((a, b) => b.score - a.score)
      .map((p) => {
        const emoji = getRankEmoji(p.rankTier);
        return `${emoji} **${p.member.displayName}** — ${p.rankDisplay}`;
      });

    embed.addFields({
      name: `🏟️ チーム ${i + 1}　（平均スコア: ${avgScore.toFixed(0)}）`,
      value: lines.join("\n"),
      inline: false,
    });
  }

  if (hasEstimated) {
    embed.setFooter({
      text: "※ APEXランクロール未設定のメンバーはRookieとして計算されました",
    });
  }

  await interaction.editReply({ embeds: [embed] });
}
