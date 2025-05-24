const inquirer = require("inquirer").default;
const chalk = require("chalk");
const questions = require("./questions");

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

async function askQuestionWithTimeout(q, timeLimitMs) {
  try {
    const answer = await Promise.race([
      inquirer.prompt([
        {
          type: "list",
          name: "userAnswer",
          message: q.question,
          choices: q.options,
        },
      ]),
      timeout(timeLimitMs),
    ]);
    return answer.userAnswer;
  } catch (err) {
    if (err.message === "timeout") {
      return null;
    }
    throw err;
  }
}

async function startGame({timeLimitMs = 15000, questions}) {
  console.log(chalk.cyan.bold("\nWelcome to the Trivia Game!\n"));

  const results = [];
  const startTime = Date.now();

  for (const q of questions) {
    console.log(chalk.yellow(`You have ${timeLimitMs / 1000} seconds to answer.`));
    const userAnswer = await askQuestionWithTimeout(q, timeLimitMs);

    if (userAnswer === null) {
      console.log(chalk.red("Time's up! Moving to the next question.\n"));
      results.push({ question: q.question, correct: false, timedOut: true });
    } else if (userAnswer === q.answer) {
      console.log(chalk.green("Correct!\n"));
      results.push({ question: q.question, correct: true });
    } else {
      console.log(chalk.red(`Incorrect! The right answer is: ${q.answer}\n`));
      results.push({ question: q.question, correct: false });
    }
  }

  const endTime = Date.now();
  const totalTimeSec = ((endTime -startTime) / 1000).toFixed(2);
  const score = results.reduce((total, result) => result.correct ? total + 1 : total, 0);

  console.log(chalk.blue.bold(`Game Over! Your score: ${score} out of ${questions.length}\n`));
  console.log(chalk.blue.bold(`Total time taken: ${totalTimeSec} seconds\n`));
  
  lastGameStats = { score, totalQuestions: questions.length, totalTimeSec};

  return lastGameStats;
}

async function viewStats() {
    if(!lastGameStats) {
        console.log(chalk.yellow("\nNo game played yet. Play a game first!\n"));
        return;
    }

    console.log(chalk.magenta("\nLast Game Stats:"));
    console.log(`Score: ${lastGameStats.score} out of ${lastGameStats.totalQuestions}`);
    console.log(`Total time: ${lastGameStats.totalTimeSec} seconds\n`);
}

async function mainMenu({ timeLimitMs = 15000, questions }) {
    while(true) {
        const { action } = await inquirer.prompt({
            type: "list",
            name: "action",
            message: "Main Menu - Choose an option:",
            choices: [
                { name: "Start Game", value: "start"},
                { name: "View Last Game Stats", value: "stats" },
                { name: "Exit", value: "exit"},
            ],
        });

        if (action === "start") {
            await startGame({timeLimitMs: 15000, questions});
        } else if (action === "stats") {
            await viewStats();
        } else if (action === "exit") {
            console.log(chalk.green("Thanks for playing! GG's!"));
            break;
        }
    }
}

module.exports = { startGame, mainMenu };
