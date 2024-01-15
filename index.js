#!/usr/bin/env node
import chalk from "chalk";
import inquirer from "inquirer";
import { program } from "commander";
import figlet from "figlet";
import chalkAnimation from "chalk-animation";

let friends = [];
let totalAmount = 0;
let averageExpense = 0;

// Set up the CLI program
program
  .name("split-wise")
  .version("1.0.0")
  .description("Split your bills/expenses💰 among your friends");

program
  .command("add")
  .description("Add a friend and their expenses")
  .action(() => {
    clearConsole();
    displayTitle();
    getInput();
  });

program
  .command("exit")
  .description("Exit Split Wise")
  .action(() => {
    clearConsole();
    process.exit();
  });

// Function to clear the console
function clearConsole() {
  console.clear();
}

// Function to display the Split Wise title
function displayTitle() {
  console.log(
    chalk.green(figlet.textSync("Split Wise", { horizontalLayout: "full" }))
  );
}

// Function to get user input
async function getInput() {
  const { name } = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What is the name of the person you want to add?",
      validate: (input) => {
        return input.trim() !== "" ? true : "Name cannot be empty.";
      },
    },
  ]);

  const { amount } = await inquirer.prompt([
    {
      type: "input",
      name: "amount",
      message: `What is the amount of ${name}?`,
      validate: (input) => {
        const parsedAmount = parseFloat(input);
        return !isNaN(parsedAmount) && parsedAmount >= 0
          ? true
          : "Please enter a valid non-negative number.";
      },
    },
  ]);

  friends.push({
    name: name,
    amount: parseFloat(amount),
    amountOwed: null,
    debtStatus: null,
  });

  const { addMore } = await inquirer.prompt([
    {
      type: "confirm",
      name: "addMore",
      message: "Do you want to add more people?",
      default: true,
    },
  ]);

  if (addMore) {
    await getInput();
  } else {
    calculateExpense();
  }
}

// Function to calculate expenses
async function calculateExpense() {
  console.log(chalk.yellow("\nCalculating expenses...\n"));

  for (let friend of friends) {
    totalAmount += friend.amount;
  }

  averageExpense = totalAmount / friends.length;

  for (let friend of friends) {
    friend.amountOwed =
      Math.round((friend.amount - averageExpense) * 100) / 100; // Round to two decimal places
    friend.debtStatus = friend.amountOwed < 0 ? "owes" : "take";
  }

  displayResults();
}

// Function to display results with some styling and animations
function displayResults() {
  console.log(chalk.cyan("Total Amount: " + totalAmount));
  console.log(chalk.cyan("Average expense: " + averageExpense));
  console.log(chalk.magenta("\nDistribution of Money:\n"));

  const animation = chalkAnimation
    .rainbow("Calculating Transactions...")
    .start();

  setTimeout(() => {
    animation.stop();
    console.log("\nTransactions:\n");

    for (let friend of friends) {
      if (friend.debtStatus === "take") {
        const owingFriends = friends.filter(
          (f) => f.debtStatus === "owes" && f.amountOwed < 0
        );

        for (let owingFriend of owingFriends) {
          const amountToTransfer =
            friend.amountOwed < Math.abs(owingFriend.amountOwed)
              ? friend.amountOwed
              : Math.abs(owingFriend.amountOwed);

          if (amountToTransfer > 0) {
            console.log(
              `${friend.name} owes ${chalk.green(
                amountToTransfer.toFixed(2)
              )} to ${owingFriend.name}`
            );

            friend.amountOwed -= amountToTransfer;
            owingFriend.amountOwed += amountToTransfer;
          }
        }
      }
    }
  }, 2000);
}

// Parse the command line arguments
program.parse(process.argv);
