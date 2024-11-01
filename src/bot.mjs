// src/bot.js
import { Telegraf } from "telegraf";
import dotenvConfig from "./config/DotenvConfig.mjs";
import obtenerDEC from "./comands/ObtenerDEC.mjs";
import helpCommand from "./comands/Help.mjs";
import startCommand from "./comands/Start.mjs";
import textHandler from "./events/TextHandler.mjs";

//Configuring dotenv to use environment variables
dotenvConfig();

//Initialize the bot using the token from environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);

// Define los comandos del bot
bot.command("obtener_dDEC", obtenerDEC);
bot.command("obtener_rDEC", obtenerDEC);
bot.command("help", helpCommand);
bot.command("start", startCommand);

//Defines the handler for text messages other than commands
bot.on("text", textHandler);

//Start the bot and wait for messages
bot.launch().then(() => console.log("Bot iniciado"));

//Handles the termination of the process in case of receiving closure signals
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
