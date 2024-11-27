// sort a set of news articles based on what date they were published

// taking in an array of objects, array can't be empty, objects inside array also can't be empty
// taking in a string, must have a value of empty (""), "ascending", or "descending"

function sortNews(newsItems, sort) {
  // determine how to sort array based on value in sort variable
  // sort array and return it

  if (sort === "ascending") {
    return [...newsItems].sort((a, b) => {
      return a.date - b.date;
    });
  }

  return [...newsItems].sort((a, b) => {
    return b.date - a.date;
  });
}

module.exports = sortNews;
