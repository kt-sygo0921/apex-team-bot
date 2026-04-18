import "dotenv/config";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  REST,
  Routes,
} from "discord.js";

import * as teamCommand from "./commands/team.js";
import * as rankcheckCommand from "./commands/rankcheck.js";
import * as ranksCommand from "./commands/ranks.js";

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

const commands: Command[] = [teamCommand, rankcheckCommand, ranksCommand];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const commandCollection = new Collection<string, Command>();
for (const cmd of commands) {
  commandCollection.set(cmd.data.name, cmd);
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ ${c.user.tag} としてログインしました`);

  const token = process.env.DISCORD_TOKEN!;
  const clientId = process.env.CLIENT_ID!;
  const guildId = process.env.GUILD_ID;

  const rest = new REST().setToken(token);
  const body = commands.map((cmd) => cmd.data.toJSON());

  try {
    if (guildId) {
      // 開発中: ギルド単位で即時反映
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
      console.log(`📡 ギルドコマンドを登録しました（Guild: ${guildId}）`);
    } else {
      // 本番: グローバル登録（反映に最大1時間）
      await rest.put(Routes.applicationCommands(clientId), { body });
      console.log("📡 グローバルコマンドを登録しました");
    }
  } catch (err) {
    console.error("❌ コマンド登録エラー:", err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandCollection.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ コマンド実行エラー [${interaction.commandName}]:`, err);
    const msg = "コマンドの実行中にエラーが発生しました。";
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(msg);
    } else {
      await interaction.reply({ content: msg, ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
