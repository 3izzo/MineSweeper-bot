const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ height: 1080, width: 1920 });
  await page.goto('https://cardgames.io/minesweeper/');
  // await page.goto('https://minesweeper.online/en/game/148953674');

  await page.waitFor(5000);

  await page.click('#gdpr-agree');
  console.log("clicked gdpr");
  await page.waitFor(500);
  await page.click('#expert');
  console.log("clicked expert");
  await page.waitFor(500);
  await page.setCacheEnabled(true);

  let boxes = await page.evaluate(() => {
    return document.querySelectorAll('td');
  })

  // await page.click('#E1', { button: "right" } );
  // await page.click('#B3');
  await page.click('#C10');

  let cycles = 0;
  mainloop:
  while (true) {
    // let allBoxes = [];
    let count = 0;
    console.time('getting info');

    // let currentRow = [];
    // for (let j = 0; j < 31; j++) {
    //   let currentCellClass = await page.evaluate((x) => {
    //     let qrs = document.querySelectorAll('td')[x];
    //     return qrs.className;
    //   }, count)
    //   // console.log(getValue(currentCellClass) + " " + count);
    //   currentRow.push(getValue(currentCellClass));
    //   count++;
    // }

    let allBoxes = await page.evaluate(function () {
      let result = [];
      let getValueFunc = function getValue(className) {
        switch (className) {
          case 'closed':
            return -1;
          case 'blank':
            return 0;
          case 'flag':
            return 'f';
          case 'nr nr1':
            return 1;
          case 'nr nr2':
            return 2;
          case 'nr nr3':
            return 3;
          case 'nr nr4':
            return 4;
          case 'nr nr5':
            return 5;
          case 'nr nr6':
            return 6;
        }
      };
      for (let i = 0; i < 16; i++) {
        let row = []
        let qrs = document.querySelectorAll('td');
        for (let j = 0; j < 31; j++) {
          row[j] = getValueFunc(qrs[i * 31 + j].className);

        }
        if (row.includes(undefined) || row.includes(null)) {
          return null;
        }
        result.push(row);
      }
      return result;
    });
    if (allBoxes == null) {
      // await page.click('#expert');
      // console.log("clicked expert");
      await page.waitFor(500);
      continue mainloop;
    }
    console.timeEnd('getting info');

    console.time('solution');
    let solution = solve(allBoxes);

    console.timeEnd('solution');

    let sureMines = solution.sureMines;
    let notMines = solution.notMines;

    console.time('clicking');

    if (notMines.length == 0 && sureMines.length == 0) {
      await page.click('#' + getRandomLetter() + '10');
    } else {
      // console.log(" whoooooo found an asnwer");
      // console.log(mines);
      if (notMines.length > 0) {
        for (let i = 0; i < notMines.length; i++) {
          const notMine = notMines[i];
          let row = notMine.x + 1;
          let col = getLetter(notMine.y);
          await page.click('#' + col + row);
        }
        // console.log('#' + col + row + ' is clicked')
      } else {
        let row = sureMines[0].x + 1;
        let col = getLetter(sureMines[0].y);
        await page.click('#' + col + row, { button: "right" });
        // console.log('#' + col + row + ' is clicked');


      }
    }
    console.timeEnd('clicking');


    await page.waitFor(50);
  }

  // console.log(solve(allBoxes));

  // await page.waitFor(1000000);
  // await page.close();
  // await browser.close();
})();

// function getValue(className) {
//   switch (className) {
//     case 'closed':
//       return -1;
//     case 'blank':
//       return 0;
//     case 'flag':
//       return 'f';
//     case 'nr nr1':
//       return 1;
//     case 'nr nr2':
//       return 2;
//     case 'nr nr3':
//       return 3;
//     case 'nr nr4':
//       return 4;
//     case 'nr nr5':
//       return 5;
//     case 'nr nr6':
//       return 6;
//   }
// }

function getLetter(number) {
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  return letters[number];
}

function getRandomLetter() {
  let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  let randomNumber = Math.floor(Math.random() * 10);
  return letters[randomNumber];
}

function solve1(input) {
  // var ySize = input.length;
  // var xSize = input[0].length;

  // let values = defineEmpty2dArray(ySize);
  // let dividers = defineEmpty2dArray(ySize);

  // for (let y = 0; y < ySize; y++) {
  //   const element = input[y];
  //   for (let x = 0; x < xSize; x++) {
  //     let squareValue = element[x];
  //     if (squareValue == 'f')
  //       continue;
  //     //does not count zeros or mines.
  //     //if the loop encounters a mine the square value is --
  //     let neighborsCount = 0;
  //     for (let i = x - 1; i <= x + 1; i++) {
  //       for (let j = y - 1; j <= y + 1; j++) {
  //         if ((i == x && j == y) || (i < 0 || i >= xSize || j < 0 || j >= ySize))
  //           continue;
  //         if (input[j][i] == 'f') {
  //           squareValue--;
  //         } else if (input[j][i] == -1) {
  //           neighborsCount++;
  //         }
  //       }
  //     }

  //     // if (squareValue <= 0)
  //     //   continue;


  //     for (let i = x - 1; i <= x + 1; i++) {
  //       for (let j = y - 1; j <= y + 1; j++) {
  //         if ((i == x && j == y) || (i < 0 || i >= xSize || j < 0 || j >= ySize))
  //           continue;
  //         if (input[j][i] >= 0 || input[j][i] == 'f') {
  //           continue;
  //         } else {
  //           if (squareValue >= 0) {
  //             if (values[j][i] == undefined) {
  //               values[j][i] = 0;
  //               dividers[j][i] = 1;
  //             }
  //             values[j][i] += squareValue;
  //             dividers[j][i] += neighborsCount;
  //           } else {
  //             values[j][i] = -10;
  //             dividers[j][i] = 1;
  //           }
  //         }
  //       }
  //     }

  //   }
  // }


  // //initialize the percent array with input

  // var percents = input.map(function (arr) {
  //   return arr.map(function (value) {
  //     if (value == -1)
  //       return -1;
  //     return 0;
  //   });
  // });

  // for (let x = 0; x < xSize; x++) {
  //   for (let y = 0; y < ySize; y++) {
  //     if (dividers[y][x] != undefined && dividers[y][x] != 0)
  //       percents[y][x] = values[y][x] / dividers[y][x];
  //   }
  // }
  // let max = -90876986798765789;
  // percents.forEach(row => {
  //   row.forEach(cell => {
  //     if (cell > max && cell != 0)
  //       max = cell;
  //   });
  // });
  // console.table(input);
  // console.table(percents);
  // let mines = [];
  // for (let x = 0; x < xSize; x++) {
  //   for (let y = 0; y < ySize; y++) {
  //     if (percents[y][x] == max) {
  //       mines[mines.length] = { x: x, y: y };
  //     }
  //   }
  // }
  // return mines;
}

function solve(input) {

  let knownCells = defineEmpty2dArray(input.length);

  for (let y = 0; y < input.length; y++) {
    let row = input[y];
    for (let x = 0; x < row.length; x++) {
      let cell = row[x];
      if (cell != -1 && cell != 'f') {
        let possibleNeighborMines = 0;
        let neighbors = [];

        //get number of possible mines
        for (let y2 = (y == 0) ? 0 : y - 1; y2 <= y + 1 && y2 < input.length; y2++) {
          let row = input[y];
          for (let x2 = (x == 0) ? 0 : x - 1; x2 <= x + 1 && x2 < input[0].length; x2++) {

            if ((x2 == x && y2 == y))
              continue;
            if (input[y2][x2] == 'f') {
              cell--;
              continue;
            }
            if (input[y2][x2] != -1)
              continue;
            neighbors[neighbors.length] = { x: x2, y: y2 };
            possibleNeighborMines++;
          }
        }
        if (cell < 0)
          cell = 0;
        knownCells[y][x] = { value: cell, possibleNeighborMines: possibleNeighborMines, neighbors: neighbors }
      }
    }
  }

  let mines = [];
  let notMines = [];

  let percents = defineEmpty2dArray(input.length);
  knownCells.forEach(row => {
    row.forEach(cell => {
      cell.neighbors.forEach(neighbor => {
        if (cell.value == 0) {
          notMines[notMines.length] = { y: neighbor.y, x: neighbor.x };
          return;
        }
        if (percents[neighbor.y][neighbor.x] == undefined)
          percents[neighbor.y][neighbor.x] = 0;
        percents[neighbor.y][neighbor.x] += (1 - percents[neighbor.y][neighbor.x]) * (cell.value / cell.possibleNeighborMines);
      });
    });
  });
  // console.table(percents);
  // let max = 0.000000000001;
  let max = 0.5;
  percents.forEach(row => {
    row.forEach(cell => {
      if (cell > max && cell != 0)
        max = cell;
    });
  });
  // console.table(percents);
  // console.table(input);




  for (let x = 0; x < input[0].length; x++) {
    for (let y = 0; y < input.length; y++) {
      if (percents[y][x] == 0) {
        notMines[notMines.length] = { x: x, y: y };
      }
      else if (percents[y][x] == max) {
        mines[mines.length] = { x: x, y: y };
      }
    }
  }
  return { sureMines: mines, notMines: notMines };
}

function defineEmpty2dArray(ySize) {
  let result = [];
  for (let i = 0; i < ySize; i++) {
    result[i] = [];
  }
  return result;
}
