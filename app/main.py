from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import sqlite3
import os

app = FastAPI()

DB_PATH = os.getenv('DB_PATH', 'todo.db')

# Ensure the directory exists
os.makedirs(os.path.dirname(DB_PATH) if os.path.dirname(DB_PATH) else '.', exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT 0
    )''')
    conn.commit()
    conn.close()

init_db()

class Todo(BaseModel):
    id: int | None = None
    title: str
    completed: bool = False
    
    class Config:
        from_attributes = True

@app.get('/todos', response_model=List[Todo])
def read_todos():
    conn = get_db()
    todos = conn.execute('SELECT * FROM todos').fetchall()
    conn.close()
    return [Todo(**dict(row)) for row in todos]

@app.post('/todos', response_model=Todo)
def create_todo(todo: Todo):
    conn = get_db()
    cur = conn.execute('INSERT INTO todos (title, completed) VALUES (?, ?)', (todo.title, todo.completed))
    conn.commit()
    todo.id = cur.lastrowid
    conn.close()
    return todo

@app.put('/todos/{todo_id}', response_model=Todo)
def update_todo(todo_id: int, todo: Todo):
    conn = get_db()
    cur = conn.execute('UPDATE todos SET title = ?, completed = ? WHERE id = ?', (todo.title, todo.completed, todo_id))
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail='Todo not found')
    conn.commit()
    conn.close()
    todo.id = todo_id
    return todo

@app.delete('/todos/{todo_id}')
def delete_todo(todo_id: int):
    conn = get_db()
    cur = conn.execute('DELETE FROM todos WHERE id = ?', (todo_id,))
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail='Todo not found')
    conn.commit()
    conn.close()
    return {'ok': True}
