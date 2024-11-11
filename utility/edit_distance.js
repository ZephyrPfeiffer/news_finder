// calculate the minimum number of changes that need to be made to a given string in order to convert it to another string

// taking in two string (user provided and comparison strings), both strings can have any assortment of characters, strings will never be empty/null
// returning an integer which represent edit distance

function getEditDistance(string1, string2) {
  // check if the strings are the same, return 0 if they are
  // create a 2d array with dimensions based off the length of input strings
  // populate the first row and column with numbers 1 to length of both strings (position 0,0 will always be zero)
  // loop through the array (starting from 1,1 position within 2d array) and find minimum number of changes that need to be made to convert current substring to other substring (follow edit distance formula)
  // once we loop through the whole 2d array, return the edit distance

  if (string1 === string2) {
    return 0;
  }

  let matrix = [[0]];

  for (let i = 0; i < string1.length; i++) {
    matrix[0].push(i + 1);
  }

  for (let i = 0; i < string2.length; i++) {
    matrix.push([i + 1, ...Array(string1.length)]);
  }

  for (let i = 1; i < matrix.length; i++) {
    for (let j = 1; j < matrix[i].length; j++) {
      let minValue =
        matrix[i - 1][j - 1] + (string1[i - 1] === string2[i - 1] ? 0 : 1);

      if (matrix[i - 1][j] + 1 < minValue) {
        minValue = matrix[i - 1][j] + 1;
      } else if (matrix[i][j - 1] + 1 < minValue) {
        minValue = matrix[i][j - 1] + 1;
      }

      matrix[i][j] = minValue;
    }
  }

  return matrix[matrix.length - 1][matrix[matrix.length - 1].length - 1];
}

// getEditDistance('bob', 'lob') => 1
// getEditDistance('bob', 'bob') => 0
// getEditDistance('robby', 'lob') => 3

module.exports = getEditDistance;
