import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { RANK_TIERS } from "../ranks.js";

export const data = new SlashCommandBuilder()
  .setName("ranks")
  .setDescription("設定可能なAPEXランクロールの一覧を表示します");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setTitle("🏆 APEXランク一覧")
    .setDescription("以下のロール名をサーバーに作成してメンバーに付与してください。")
    .setColor(0xff6600);

  for (const tier of RANK_TIERS) {
    embed.addFields({
      name: `${tier.emoji} ${tier.name}`,
      value: tier.roles.map((r) => `\`${r}\``).join("\n"),
      inline: true,
    });
  }

  embed.setFooter({
    text: "ロール名は大文字小文字を区別しません（例: gold i / Gold I どちらでもOK）",
  });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
