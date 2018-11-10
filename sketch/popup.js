function setup() {
  noCanvas();
  let bgpage = chrome.extension.getBackgroundPage();
  let text = bgpage.word;
  chrome.tabs.detectLanguage(function(lang) {
    const ISOlanguageCODE = lang;

    const project_id = `yso-${ISOlanguageCODE}` || 'yso-en';
    const url = `http://api.annif.org/v1/projects/${project_id}/analyze`;
    const POST_DATA_FOR_ANNIF = {
      project_id,
      text,
      limit: 3,
    };

    $.ajax({
      url,
      method: 'POST',
      data: POST_DATA_FOR_ANNIF,
      success: finished,
    });

    function finished(response) {
      const annifLabels = [];

      response.results.map(key => {
        //Keyword from ANNIF API
        const keyword = key.label;
        const filter = {
          en: 'eng',
          fi: 'fin',
          sv: 'swe',
        };
        // DATA for GET REQUEST to FINNA API
        const GET_DATA_FOR_FINNA = {
          lookfor: keyword,
          type: 'Subject',
          field: ['id', 'title', 'nonPresenterAuthors'],
          filter: [`language: ${filter[ISOlanguageCODE]}`],
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
            }
          },
        });

        // To show the subject/keyword that is used for the search
        const bookBased = document.querySelector('.parent p');
        const subject = document.createElement('span');
        subject.textContent = keyword;
        bookBased.appendChild(subject);

        annifLabels.push(encodeURI(keyword));
      });

      // Main header
      const parent = document.querySelector('.parent');
      const InternalizedText = {
        popUpTitle: chrome.i18n.getMessage('name'),
      };
      const title = document.createElement('h1');
      title.setAttribute('class', 'title');
      title.textContent = InternalizedText.popUpTitle;
      parent.appendChild(title);

      // Link for show more button that sends to Finna library with the same keywords are used from Annif
      const toFinna = `
    https://www.finna.fi/Search/Results?sort=relevance&bool0%5B%5D=OR&lookfor0%5B%5D=
    ${annifLabels[0]}
    &type0%5B%5D=Subject&lookfor0%5B%5D=
    ${annifLabels[1]}
    &type0%5B%5D=Subject&lookfor0%5B%5D=
    ${annifLabels[2]}
    &type0%5B%5D=Subject&join=AND&limit=20`;

      const showMore = document.createElement('a');
      showMore.setAttribute('class', 'show-more');
      showMore.href = toFinna.trim();
      showMore.textContent = 'Show More';
      showMore.target = '_blank';
      parent.appendChild(showMore);
    }
  });
}

// Printing to the UI
function interface(key) {
  const InternalizedText = {
    visitButtonLabel: chrome.i18n.getMessage('visitButtonLabel'),
    AuthorLabel: chrome.i18n.getMessage('AuthorLabel'),
  };
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
  author.textContent = `${InternalizedText.AuthorLabel}: ${authorLoop}`;
  card.appendChild(author);

  const button = document.createElement('button');
  const a = document.createElement('a');
  a.href = `https://finna.fi/Record/${key.id}`;
  a.target = '_blank';
  button.appendChild(a);
  a.textContent = InternalizedText.visitButtonLabel;
  card.appendChild(button);
}
