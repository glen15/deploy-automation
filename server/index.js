const serverless = require("serverless-http");
const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
});

// 데이터베이스 연결
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("데이터베이스 연결 완료");
  const createTableQuery = `CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_note TEXT,
        ai_note TEXT
    )`;
  db.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Notes 데이터베이스에 Notes 테이블 생성");
  });
});

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "연결 테스트 완료",
  });
});

// 전체 조회
app.get("/notes", (req, res, next) => {
  console.log("req", req.method);
  const sql = "SELECT * FROM notes";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// 메모 추가 요청 처리
app.post("/notes", (req, res) => {
  const userMessage = req.body.content;
  console.log(`입력받은 내용 : ${userMessage}`);

  // 데이터베이스에 사용자 메모 저장
  const sql = "INSERT INTO notes (user_note) VALUES (?)";
  const values = [userMessage];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("데이터베이스 저장 오류:", err);
      return res.status(500).json({ error: "데이터베이스 오류" });
    }
    const addedId = result.insertId;
    console.log("사용자 메모 데이터베이스에 저장 완료");
    res.json({
      message: "메모가 저장되었습니다",
      note: { id: addedId, user_note: userMessage },
    });
  });
});

// 특정 메모 삭제
app.delete("/notes/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM notes WHERE id = ?";
  db.query(sql, id, (err, result) => {
    if (err) throw err;
    res.send(`Note with id ${id} deleted`);
  });
  // delete marker 로직을 추가하기 어려움
  // db 생성시 scheme를 정했기 때문에 수정이 쉽지 않음
});

// 전체 메모 삭제
app.delete("/notes", (req, res) => {
  const sql = "DELETE FROM notes";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send("All notes deleted");
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
