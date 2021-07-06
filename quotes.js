let randomQuotes = [];
let currentList = [];
let currentPage = 0;
let quoteText = $("#quote-text");
let quoteAuthor = $("#quote-author");
const quoteBtn = $("#quote-btn");
async function fetchData(API) {
  if (!localStorage.quotesList) {
    try {
      const response = await fetch(API);
      const data = await response.json();
      localStorage.setItem('quotesList', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(error);
    }
  } else {
      return JSON.parse(localStorage.getItem('quotesList'));
  }
}
async function fetchAndCleanUpData() {
    const data = await fetchData("https://type.fit/api/quotes");
    randomQuotes = overWriteNullAuthors(data);
    availableQuotes = [...randomQuotes];
    currentList = [...randomQuotes];
    populateQuoteList(currentList);
}
const populateQuoteList = (quoteList) => {
  $(".single-quote").remove();
  const paginatedList = paginateList(quoteList);
  for (quote of paginatedList[0]) {
    const { text, author } = quote;
    $("#quote-list").append(`
      <div class="single-quote">
      <div class="single-quote-text">${text}</div>
      <div class="single-quote-author">${`-${author}`}</div>
      </div>
      `);
  }
  $(".single-quote").even().css("background-color", "gray");
  $("#current-page").text(
    `Page ${currentPage + 1} of ${paginateList(currentList).length}`
  );
};
const paginateList = (quoteList) => {
  let listCopy = [...quoteList];
  let paginatedList = [];
  while (listCopy.length > 0) {
    paginatedList.push(listCopy.splice(0, 20));
  }
  return paginatedList;
};
const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const splicedQuote = availableQuotes.splice([randomIndex], 1)[0];
  const { text, author } = splicedQuote;
  quoteText.text(text);
  quoteAuthor.text(`-${author}`);
  if (availableQuotes.length === 0) {
    availableQuotes = [...randomQuotes];
  }
};
const overWriteNullAuthors = (quoteList) => {
  for (quote of quoteList) {
    if (quote.author === null) {
      quote.author = "Unknown";
    }
  }
  return quoteList;
};
const changePage = (direction) => {
  const paginatedList = paginateList(currentList);
  if (direction === "up" && currentPage < paginatedList.length - 1) {
    currentPage++;
    populateQuoteList(paginatedList[currentPage]);
  }
  if (direction === "down" && currentPage > 0) {
    currentPage--;
    populateQuoteList(paginatedList[currentPage]);
  }
};
const ascending = (a, b) => {
  if (a.author < b.author) {
    return -1;
  }
  if (b.author < a.author) {
    return 1;
  }
  return 0;
};
const descending = (a, b) => {
  if (a.author > b.author) {
    return -1;
  }
  if (b.author > a.author) {
    return 1;
  }
  return 0;
};
const sortAscending = () => {
  currentPage = 0;
  currentList = [...randomQuotes].sort(ascending);
  populateQuoteList(currentList);
};
const sortDescending = () => {
  currentPage = 0;
  currentList = [...randomQuotes].sort(descending);
  populateQuoteList(currentList);
};
const searchList = (searchTerm) => {
  let listCopy = [...randomQuotes];
  let results = listCopy.filter((quote) =>
    quote.author.toUpperCase().includes(searchTerm.toUpperCase())
  );
  if (results.length === 0) {
    currentList = [
      { text: "No results found.", author: "The search function." },
    ];
  } else {
    currentList = results;
  }
  populateQuoteList(currentList);
};
const getRandomDogImgSrc = () => {
  const randomDogNum = Math.floor(Math.random() * 1000);
  $("#quote-container").css(
    "background-image",
    `url(https://placedog.net/950/640/${randomDogNum})`
  );
};
$("#quote-container").click(getRandomQuote);
$("#quote-container").click(getRandomDogImgSrc);
$("#next-page").click(function () {
  changePage("up");
});
$("#previous-page").click(function () {
  changePage("down");
});
$("#ascending").click(sortAscending);
$("#descending").click(sortDescending);
$("#search").click(function () {
  searchList($("#searchBox").val());
});
$("#searchBox").keypress(function (event) {
  const keycode = event.keyCode ? event.keyCode : event.which;
  if (keycode == "13") {
    searchList($("#searchBox").val());
  }
});
fetchAndCleanUpData();
