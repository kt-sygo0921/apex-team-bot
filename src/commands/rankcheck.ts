import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import { getMemberRank } from "../teamBalancer.js";
import { getRankEmoji } from "../ranks.js";

export const data = new SlashCommandBuilder()
  .setName("rankcheck")
  .setDescription("ボイスチャンネルのメンバーのAPEXランクを一覧表示します");

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

  const players = vcMembers.map((m) => getMemberRank(m));
  players.sort((a, b) => b.score - a.score);

  const lines = players.map((p) => {
    const emoji = getRankEmoji(p.rankTier);
    return `${emoji} **${p.member.displayName}** — ${p.rankDisplay}`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`📊 ランク一覧 — ${voiceChannel.name}`)
    .setDescription(lines.join("\n"))
    .setColor(0xffd700)
    .setFooter({ text: `合計 ${players.length} 人` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
