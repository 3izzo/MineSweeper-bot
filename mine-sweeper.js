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
    // console.time('getting info');

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
    // console.timeEnd('getting info');

    // console.time('solution');
    let solution = solve(allBoxes);

    // console.timeEnd('solution');

    let sureMines = solution.sureMines;
    let sureNotMines = solution.sureNotMines;

    // console.time('clicking');

    if (sureNotMines.length == 0 && sureMines.length == 0) {
      console.log("luck");
      let notMines = solution.notMines;
      if (notMines.length > 0) {
        let row = notMines[0].x + 1;
        let col = getLetter(notMines[0].y);
        await page.click('#' + col + row);
        // console.log('#' + col + row + ' is clicked');
      } else {
        await page.click('#' + getRandomLetter() + '10');
        await page.waitFor(500);
      }
    } else {
      // console.log(" whoooooo found an asnwer");
      // console.log(mines);
      if (sureNotMines.length > 0) {
        for (let i = 0; i < sureNotMines.length; i++) {
          const notMine = sureNotMines[i];
          let row = notMine.x + 1;
          let col = getLetter(notMine.y);
          await page.click('#' + col + row);
          console.log('#' + col + row + ' is clicked')
        }
      }
      if (sureMines.length > 0) {
        for (let i = 0; i < sureMines.length; i++) {
          let row = sureMines[i].x + 1;
          let col = getLetter(sureMines[i].y);
          await page.click('#' + col + row, { button: "right" });
          console.log('#' + col + row + ' is clicked');
        }
      }
    }
    // console.timeEnd('clicking');


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

  let notMines = [];
  let sureMines = [];
  let sureNotMines = [];

  let percents = defineEmpty2dArray(input.length);
  knownCells.forEach(row => {
    row.forEach(cell => {
      cell.neighbors.forEach(neighbor => {
        if (cell.value == 0) {
          sureNotMines[sureNotMines.length] = { y: neighbor.y, x: neighbor.x };
          return;
        }
        if (percents[neighbor.y][neighbor.x] == undefined)
          percents[neighbor.y][neighbor.x] = 0;
        percents[neighbor.y][neighbor.x] += (1 - percents[neighbor.y][neighbor.x]) * (cell.value / cell.possibleNeighborMines);
      });
    });
  });
  // console.table(percents);
  let min = 1;
  // let max = 0.6;
  percents.forEach(row => {
    row.forEach(cell => {
      if (cell < min && cell != 0)
        min = cell;
    });
  });
  // console.table(percents);
  // console.table(input);




  for (let x = 0; x < input[0].length; x++) {
    for (let y = 0; y < input.length; y++) {
      if (percents[y][x] == 0) {
        sureNotMines[sureNotMines.length] = { x: x, y: y };
      } else if (percents[y][x] == 1)
        sureMines.push({ x: x, y: y });
      else if (percents[y][x] == min) {
        notMines[notMines.length] = { x: x, y: y };
      }
    }
  }
  return { sureMines: sureMines, notMines: notMines, sureNotMines: sureNotMines };
}

function defineEmpty2dArray(ySize) {
  let result = [];
  for (let i = 0; i < ySize; i++) {
    result[i] = [];
  }
  return result;
}
