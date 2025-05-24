#!/usr/bin/env node

const { Command } = require("commander");
const chalk = require("chalk");
const allQuestions = require("../src/questions");
const { mainMenu } = require("../src/game");
const questions = require("../src/questions");

const program = new Command();

program
  .name("trivia")
  .description("CLI Trivia Game")
  .version("1.0.0");

program
  .option("-t, --time <seconds>", "Time limit per question in seconds", "15")
  .option("-n, --number <count>", "Number of questions to ask");

program.parse(process.argv);

const options = program.opts();

(async () => {
  try {
    const timeLimitMs = parseInt(options.time, 10) * 1000;
    const numQuestions = options.number ? parseInt(options.number, 10) : null;
    const questions = numQuestions ? allQuestions.slice(0, numQuestions) : allQuestions;

    await mainMenu({ timeLimitMs, questions });
  } catch (error) {
    console.error(chalk.red("Error:"), error.message);
    process.exit(1);
  }
})();
