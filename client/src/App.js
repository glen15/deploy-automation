import React, { useState, useEffect } from "react";
import "./App.css";

// 'REACT_APP_' prefix 필수
const { REACT_APP_API_URL } = process.env;
function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  // 브라우저가 렌더링(접속 또는 새로고침)될때마다 실행
  const fetchNotes = () => {
    console.log("[fetchNotes] fetch notes from database");
    fetch(`${REACT_APP_API_URL}/notes`)
      .then((res) => res.json())
      .then((notes) => {
        setNotes(notes);
      });
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote) return;

    fetch(`${REACT_APP_API_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setNotes([...notes, data.note]);
        setNewNote("");
      });
  };

  const deleteNote = (id) => {
    console.log("[deleteNote] delete ONE note");
    fetch(`${REACT_APP_API_URL}/notes/${id}`, {
      method: "DELETE",
    }).then(() => {
      setNotes(notes.filter((note) => note.id !== id));
    });
  };

  const deleteNotes = () => {
    console.log("[deleteNotes] delete ALL notes");
    setNotes([]);
  };

  return (
    <div className="App">
      <h1>학습 기록 애플리케이션</h1>
      <h3>오늘 학습한 내용을 기록해보세요.</h3>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="무엇을 공부하셨나요?"
      />
      <br />
      <button onClick={addNote}>학습 기록 추가</button>
      <button onClick={deleteNotes}>전체 기록 삭제</button>

      <h2>내 학습 기록</h2>
      <div>
        {notes.map((note) => (
          <div key={note.id} className="note">
            <button onClick={() => deleteNote(note.id)}>삭제</button>
            <div>
              <strong>사용자 메모:</strong> {note.user_note}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
