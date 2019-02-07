const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({height: 1080, width: 1920});
    await page.goto('https://cardgames.io/minesweeper/');
    // await page.goto('https://minesweeper.online/en/game/148953674');

    await page.click('#expert');

    await page.setCacheEnabled(true);

    let boxes = await page.evaluate(() => {
      return document.querySelectorAll('td');
    })

    // await page.click('#E1', { button: "right" } );
    // await page.click('#B3');
    await page.click('#C10');

    let cycles = 0;

    while (true) {
      let allBoxes = [];
      let count = 0;

      for (let i = 0; i < 16; i++) {
        let currentRow = [];
        for (let j = 0; j < 30; j++) {
          let currentCellClass = await page.evaluate((x) => {
            return document.querySelectorAll('td')[x].className;
          }, count)
          // console.log(getValue(currentCellClass) + " " + count);
          currentRow.push(getValue(currentCellClass));
          count++;
        }
        allBoxes.push(currentRow);
      }

      let notMines = solve(allBoxes);

      if (notMines.length == 0) {
        await page.click('#'+getRandomLetter()+'10');
      } else {
        console.log(" whoooooo found an asnwer");
        console.log(notMines);
        let row = notMines[0].x;
        let col = getLetter(notMines[0].y);
        await page.click('#'+col+row);
      }

      await page.evaluate(() => {
        document.querySelector('#gdpr-agree').click()
      });

      await page.waitFor(30000);
    }



    // console.log(solve(allBoxes));

    await page.waitFor(1000000);
    await page.close();
    await browser.close();
})();

function getValue(className) {
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
}

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
  var ySize = input.length;
  var xSize = input[0].length;
  let values = defineEmpty2dArray(ySize);
  let dividers = defineEmpty2dArray(ySize);
 
      for (let y = 0; y < ySize; y++) {
          const element = input[y];
          for (let x = 0; x < xSize; x++) {
          const squareValue = element[x];
          if (squareValue == "f")
              continue;
          //does not count zeros or mines.
          //if the loop encounters a mine the square value is --
          let neighborsCount = 0;
          for (let i = x - 1; i <= x + 1; i++) {
              for (let j = y - 1; j <= y + 1; j++) {
                  if ((i == x && j == y) || (i < 0 || i >= xSize || j < 0 || j >= ySize))
                      continue;
                  if (input[y][x] == "f") {
                      squareValue--;
                  } else if (input[y][x] == 0 || input[y][x] == -1) {
                      continue;
                  } else {
                      neighborsCount++;
                  }
              }
          }
          for (let i = x - 1; i <= x + 1; i++) {
              for (let j = y - 1; j <= y + 1; j++) {
                  if ((i == x && j == y) || (i < 0 || i >= xSize || j < 0 || j >= ySize))
                      continue;
                  if (input[y][x] == "f") {
                      squareValue--;
                  } else if (input[y][x] == 0) {
                      continue;
                  } else {
                      if (values[j][i] == undefined) {
                          values[j][i] = 0;
                          dividers[j][i] = 0;
                      }
                      values[j][i] += squareValue;
                      dividers[j][i] += neighborsCount;
                  }
              }
          }
      }
  }
  let percents = defineEmpty2dArray(ySize);
  for (let x = 0; x < xSize; x++) {
      for (let y = 0; y < ySize; y++) {
          percents[y][x] = values[y][x] / dividers[y][x];
      }
  }
  let max = 0;
  percents.forEach(row => {
      row.forEach(cell => {
          if (cell > max)
              max = cell;
      });
  });
  let result = [];
  for (let x = 0; x < xSize; x++) {
      for (let y = 0; y < ySize; y++) {
          if (percents[y][x] == max) {
              result[result.length] = { x: x, y: y };
          }
      }
  }
  return result;
}


function defineEmpty2dArray(ySize) {
  let result = [];
  for (let i = 0; i < ySize; i++) {
      result[i] = [];
  }
  return result;
}
