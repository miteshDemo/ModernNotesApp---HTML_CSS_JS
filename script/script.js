let notes = JSON.parse(localStorage.getItem("notes")) || [];
let trash = JSON.parse(localStorage.getItem("trash")) || [];
let editIndex = null;

// Save notes to localStorage
function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Save trash to localStorage
function saveTrash() {
  localStorage.setItem("trash", JSON.stringify(trash));
}

// Show success popup
function showSuccessMessege(messege = "Note Added!") {
  const successPopup = document.getElementById("successPopup");
  if (successPopup) {
    successPopup.textContent = messege;
    successPopup.classList.add("show");

    setTimeout(() => {
      successPopup.classList.remove("show");
    }, 2000);
  }
}

// Show error popup
function showError(messege = "Character limit 200!") {
  const popUp = document.getElementById("popupError");
  if (popUp) {
    popUp.textContent = messege;
    popUp.classList.add("show");

    setTimeout(() => {
      popUp.classList.remove("show");
    }, 2000);
  }
}

// Show delete popup
function showDeleteMessege(messege = "Note Deleted!") {
  const deletePopup = document.getElementById("deletePopup");
  if (deletePopup) {
    deletePopup.textContent = messege;
    deletePopup.classList.add("show");

    setTimeout(() => {
      deletePopup.classList.remove("show");
    }, 2000);
  }
}

//Trash Count
function updateTrashCount() {
  const badge = document.getElementById("trashCount");
  if (!badge) return;

  badge.textContent = trash.length;

  if (trash.length === 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "inline-block";
  }
}

// Render notes
function renderNotes(filter = "", categoryFilter = "All") {
  const container = document.getElementById("notesContainer");
  if (!container) return;

  container.innerHTML = "";

  const filteredNotes = notes
    .sort((a, b) => (b.pinned === true) - (a.pinned === true))
    .filter((note) => {
      const text = typeof note === "string" ? note : note.text;
      const category = typeof note === "string" ? "General" : note.category;
      return (
        text.toLowerCase().includes(filter.toLowerCase()) &&
        (categoryFilter === "All" || category === categoryFilter)
      );
    });

  if (filteredNotes.length === 0) {
    const div = document.createElement("div");
    div.className = "no-notes";
    div.textContent = "OOPS! Not Available";
    div.style.textAlign = "center";
    div.style.marginTop = "40px";
    div.style.color = "gray";
    div.style.fontWeight = "700";
    container.appendChild(div);
    return;
  }

  filteredNotes.forEach((note, index) => {
    const text = typeof note === "string" ? note : note.text;
    const category = typeof note === "string" ? "General" : note.category;
    const timestamp = note.timestamp || "";

    const div = document.createElement("div");
    div.className = "note" + (note.pinned ? " pinned" : "");

    div.innerHTML = `
      <div>
        <p><strong>${category}</strong> ${text}</p>
        <span class="note-timestamp">${timestamp}</span>
      </div>
      <div class="note-actions">
        <button class="pin" onclick="togglePin(${index})">${note.pinned ? "Unpin" : "Pin"}</button>
        <button class="edit" onclick="editNotes(${index})">Edit</button>
        <button class="delete" onclick="deleteNotes(${index})">Delete</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// Render trash
function renderTrash() {
  const container = document.getElementById("trashContainer");
  if (!container) return;

  container.innerHTML = "";

  if (trash.length === 0) {
    container.innerHTML = "<p style='text-align:center'>Trash is Empty!</p>";
    return;
  }

  trash.forEach((note, index) => {
    const div = document.createElement("div");
    div.className = "note trash-note";

    div.innerHTML = `<p>${note.text}</p>
      <div class="note-actions">
        <button onclick="restoreNote(${index})">Restore</button>
        <button onclick="deleteForever(${index})">Delete</button>
      </div>`;

    container.appendChild(div);
  });
}

// Add or edit note
function addNotes() {
  const textEl = document.getElementById("noteText");
  if (!textEl) return;
  const text = textEl.value.trim();
  const category = document.getElementById("noteCategory").value;

  const charCount = document.getElementById("charCount");
  if (charCount) {
    charCount.textContent = "0 / 200";
    charCount.style.color = "gray";
  }

  if (!text) {
    showError("Write Something...!");
    textEl.style.border = "2px solid red";
    return;
  }

  if (text.length > 200) {
    showError("Maximum 200 Characters allowed!");
    textEl.style.border = "2px solid red";
    return;
  }

  textEl.style.border = "1px solid #ccc";

  let noteObj;

  if (editIndex !== null) {
    noteObj = {
      text,
      category,
      pinned: notes[editIndex].pinned,
      timestamp: notes[editIndex].timestamp,
    };
    notes[editIndex] = noteObj;
    editIndex = null;
  } else {
    noteObj = {
      text,
      category,
      pinned: false,
      timestamp: new Date().toLocaleString(),
    };
    notes.push(noteObj);
  }

  textEl.value = "";
  saveNotes();
  renderNotes();
  showSuccessMessege();
}

// Delete note
function deleteNotes(index) {
  const deleteNote = notes.splice(index, 1)[0];
  trash.push(deleteNote);

  saveNotes();
  saveTrash();
  renderNotes();
  showDeleteMessege("Moved to Trash!");
  updateTrashCount();
}

// Restore note
function restoreNote(index) {
  const restored = trash.splice(index, 1)[0];
  notes.push(restored);

  saveNotes();
  saveTrash();
  renderTrash();
  updateTrashCount();
}

// Permanently delete note
function deleteForever(index) {
  trash.splice(index, 1);
  saveTrash();
  renderTrash();
  updateTrashCount();
}

// Edit note
function editNotes(index) {
  const noteText = document.getElementById("noteText");
  const noteCategory = document.getElementById("noteCategory");
  if (!noteText || !noteCategory) return;

  noteText.value = notes[index].text;
  noteCategory.value = notes[index].category;
  editIndex = index;
}

// Pin/Unpin note
function togglePin(index) {
  notes[index].pinned = !notes[index].pinned;
  saveNotes();
  renderNotes();
}

// Character counter
const noteInput = document.getElementById("noteText");
if (noteInput) {
  noteInput.addEventListener("input", () => {
    const charCount = document.getElementById("charCount");
    if (charCount) {
      const length = noteInput.value.length;
      charCount.textContent = `${length} / 200`;
      charCount.style.color = length > 200 ? "red" : "gray";
    }
  });
}

// Search notes
const searchInput = document.getElementById("search");
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    renderNotes(e.target.value);
  });
}

// Theme toggle
const toggleBtn = document.getElementById("themeToggle");
if (toggleBtn) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "LIGHT";
  } else {
    toggleBtn.textContent = "DARK";
  }

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
      toggleBtn.textContent = "LIGHT";
    } else {
      localStorage.setItem("theme", "light");
      toggleBtn.textContent = "DARK";
    }
  });
}

// Render notes initially
renderNotes();
updateTrashCount();
