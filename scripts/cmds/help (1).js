const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "Aesther",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{pn} / help cmdName ",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    const deleteMessageAfterOneMinute = async (msgID) => {
      setTimeout(async () => {
        try {
          await message.unsend(msgID);
        } catch (error) {
          console.error("Error unsending message:", error);
        }
      }, 60000); // 60 seconds
    };

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      msg += `》[📑𝗟𝗜𝗦𝗧 - 𝗖𝗠𝗗𝙨]\n〓〓〓〓〓〓〓〓〓〓〓\n\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const category = value.config.category || "Uncategorized";
        categories[category] = categories[category] || { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        if (category !== "info") {
          msg += ` \n✙ ━「${category.toUpperCase()}」━`;
          const names = categories[category].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 3).map((item) => `\n⌨︎_${item}`);
            msg += ` ${cmds.join(" ".repeat(Math.max(1, 10 - cmds.join("").length)))}`;
          }

          msg += ``;
        }
      });

      const totalCommands = commands.size;
      msg += `\n\n〓〓〓〓〓〓〓〓〓〓〓\n➪[📅] Total Commands [${totalCommands}]\n➪[🛄] OWNER: ༶•┈┈⛧┈♛GUMBALL ༶•┈┈⛧┈♛\n➪[🔱] NB: use called in any report`;
      msg += `\n\n/// 🪫 SONIC BOT ////`;
      msg += ``;

      const response = await message.reply({ body: msg });
      deleteMessageAfterOneMinute(response.messageID);
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description" : "No description";

        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `🫗𝗡𝗔𝗠𝗘⚪\n--------------------------------------\n
 〉[ ${configCommand.name}]\n
🫙𝗜𝗡𝗙𝗢🫙\n--------------------------------------\n
   〉[description]:\n▶︎${longDescription}\n
   〉🔵[Other-names]:\n▶︎${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"} Other names in your group: Do not have\n
   〉🔵[Version]:\n▶︎${configCommand.version || "1.0"}\n
   〉🔵[Role]:\n▶︎${roleText}\n
   〉🔵Time per command:\n ▶︎${configCommand.countDown || 1}s\n
   〉🔵[Author]:\n▶︎${author}\n
🟢𝗨𝗦𝗔𝗚𝗘⚪\n--------------------------------------\n
▶︎ ${usage}\n--------------------------------------\n🟢  GOOD ⚪`;

        const responseMessage = await message.reply(response);
        deleteMessageAfterOneMinute(responseMessage.messageID);
      }
    }
  },
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
            }
