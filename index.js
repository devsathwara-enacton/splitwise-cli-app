import chalk from "chalk";
import inquirer from "inquirer";
import { program } from "commander";
import figlet from "figlet";

let friends = [];
program
  .name("split-wise")
  .version("1.0.0")
  .description("split your bills/expenses💰 among your friends");

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
  }
}

getInput();
