function setup() {
  noCanvas();
  let bgpage = chrome.extension.getBackgroundPage();
  let text = bgpage.word;

  const POST_DATA_FOR_ANNIF = {
    project_id: 'yso-en',
    text,
    limit: 3,
  };

  $.ajax({
    url: 'http://api.annif.org/v1/projects/yso-en/analyze',
    method: 'POST',
    data: POST_DATA_FOR_ANNIF,
    success: finished,
  });

  function finished(response) {
    response.results.map(key => {
      //Keyword from ANNIF API
      const keyword = key.label;

      // DATA for GET REQUEST to FINNA API
      const GET_DATA_FOR_FINNA = {
        lookfor: keyword,
        type: 'Subject',
        field: ['id', 'title', 'nonPresenterAuthors', 'images'],
        filter: ['language: eng'],
        sort: 'relevance,id asc',
        limit: 3,
        prettyPrint: false,
        lng: 'en-gb',
      };

      $.ajax({
        type: 'GET',
        url: 'https://api.finna.fi/api/v1/search',
        data: GET_DATA_FOR_FINNA,
        success: function(data) {
          if (data.resultCount > 0) {
            data.records.map(values => {
              interface(values);
            });
          } else {
            console.log('no results');
          }
        },
      });

      // To show the subject/keyword that is used for the search
      const keywords = key.label;
      const bookBased = document.querySelector('.parent p');
      const subject = document.createElement('span');
      subject.textContent = keywords;
      bookBased.appendChild(subject);
    });
  }
}

// Printing to the UI
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
