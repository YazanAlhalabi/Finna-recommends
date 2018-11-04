function setup() {
  noCanvas();
  let bgpage = chrome.extension.getBackgroundPage();
  let word = bgpage.word.trim();

  const data = {
    project_id: 'yso-en',
    text: word,
    limit: 1,
  };

  $.ajax({
    url: 'http://api.annif.org/v1/projects/yso-en/analyze',
    method: 'POST',
    data,
    success: finished,
  });

  function finished(response) {
    response.results.map(key => {
      let encoded = encodeURI(key.label);
      let url = `https://api.finna.fi/api/v1/search?lookfor=${encoded}&type=Subject&field[]=id&field[]=title&field[]=nonPresenterAuthors&filter[]=language%3Aeng&sort=relevance%2Cid%20asc&page=1&limit=3&prettyPrint=false&lng=en-gb`;

      url = url.replace(/\s+/g, '');
      loadJSON(url, gotData);

      function gotData(data) {
        createP(data);
      }

      function createP(word) {
        word.records.map(key => {
          interface(key);
        });
      }
    });
  }
}

function interface(key) {
  const authorLoop =
    key.nonPresenterAuthors.length > 0
      ? key.nonPresenterAuthors.map(key => {
          return key.name;
        })
      : '';

  const parent = document.querySelector('.parent');

  const card = document.createElement('div');
  const link = document.createElement('a');
  link.href = `https://finna.fi/Record/${key.id}`;
  parent.appendChild(card);
  card.setAttribute('class', 'suggestion');
  card.setAttribute('class', 'card');

  const book = document.createElement('div');
  card.appendChild(book);
  const icon = document.createElement('i');
  book.appendChild(icon);
  icon.setAttribute('class', 'fas fa-book');
  const title = document.createElement('h2');
  title.textContent = key.title;
  book.appendChild(title);

  const author = document.createElement('span');
  author.textContent = `Author: ${authorLoop}`;
  card.appendChild(author);

  const button = document.createElement('button');
  const a = document.createElement('a');
  a.href = `https://finna.fi/Record/${key.id}`;
  a.target = '_blank';
  button.appendChild(a);
  a.textContent = 'visit';
  card.appendChild(button);
}
