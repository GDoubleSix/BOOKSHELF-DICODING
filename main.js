const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

document.addEventListener('DOMContentLoaded', function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBooks();
  });

  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBOOKList = document.getElementById('books');
    const completedBOOKlist = document.getElementById('completed-books');
    uncompletedBOOKList.innerHTML = '';
    completedBOOKlist.innerHTML = '';

    for (const bookItem of books) {
      const bookElement = makeBook(bookItem);

      if (!bookItem.isCompleted) {
        uncompletedBOOKList.appendChild(bookElement);
      } else {
        completedBOOKlist.appendChild(bookElement);
      }
    }
  });

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
  });

  document.dispatchEvent(new Event(RENDER_EVENT)); 

  function searchBooks() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const filteredBooks = books.filter((book) => {
      const title = book.title.toLowerCase();
      const author = book.author.toLowerCase();
      return title.includes(searchInput) || author.includes(searchInput);
    });

    const uncompletedBOOKList = document.getElementById('books');
    const completedBOOKlist = document.getElementById('completed-books');
    uncompletedBOOKList.innerHTML = '';
    completedBOOKlist.innerHTML = '';

    for (const bookItem of filteredBooks) {
      const bookElement = makeBook(bookItem);

      if (!bookItem.isCompleted) {
        uncompletedBOOKList.appendChild(bookElement);
      } else {
        completedBOOKlist.appendChild(bookElement);
      }
    }
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      books.length = 0; 
      for (const book of data) {
        books.push(book);
      }
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }

  function isStorageExist() /* boolean */ {
    return typeof Storage !== 'undefined';
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function generateId() {
    return +new Date();
  }

  function generatebookObject(id, title, author, timestamp, isCompleted) {
    return {
      id,
      title,
      author,
      timestamp,
      isCompleted
    };
  }

  function addBook() {
    const textBook = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const timestamp = document.getElementById('date').value;

    if (textBook.trim() === '' || author.trim() === '' || timestamp.trim() === '') {
      alert('Please fill in all fields (title, author, date) before adding a book.');
      return;
    }

    const generatedID = generateId();
    const bookObject = generatebookObject(generatedID, textBook, author, timestamp, false);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function makeBook(bookObject) {
    const textTitle = document.createElement('h2');
    textTitle.innerText = bookObject.title;
   
    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;
   
    const textTimestamp = document.createElement('p');
    textTimestamp.innerText = bookObject.timestamp;
   
    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textAuthor, textTimestamp);
   
    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);
    
    if (bookObject.isCompleted) {
      const undoButton = document.createElement('button');
      undoButton.classList.add('undo-button');
   
      undoButton.addEventListener('click', function () {
        undoTaskFromCompleted(bookObject.id);
      });
   
      const trashButton = document.createElement('button');
      trashButton.classList.add('trash-button');
   
      trashButton.addEventListener('click', function () {
        if (window.confirm('Are you sure you want to delete this book?')) {
          removeTaskFromCompleted(bookObject.id);
        }
      });
   
      container.append(undoButton, trashButton);
    } else {
      const checkButton = document.createElement('button');
      checkButton.classList.add('check-button');
      
      checkButton.addEventListener('click', function () {
        addTaskToCompleted(bookObject.id);
      });

      const trashButton = document.createElement('button');
      trashButton.classList.add('trash-button');
      
      trashButton.addEventListener('click', function () {
        if (window.confirm('Are you sure you want to delete this book?')) {
          removeTaskFromCompleted(bookObject.id);
        }
      });
      container.append(checkButton, trashButton);
    }

    return container;
  }

  function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function removeTaskFromCompleted(bookId) {
    const bookIndex = findBookIndex(bookId);
   
    if (bookIndex !== -1) {
      books.splice(bookIndex, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
    }
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
  }

  function findBookIndex(bookId) {
    return books.findIndex((book) => book.id === bookId);
  }
});
