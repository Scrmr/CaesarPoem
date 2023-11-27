import sqlite3
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Global counter for updates and threshold for saving
update_counter = 0
UPDATE_THRESHOLD = 50  # Save after these many updates

class PredictionRequest(BaseModel):
    state: str

class UpdateRequest(BaseModel):
    state: str
    action: str
    reward: int
    next_state: str

def get_db_connection():
    conn = sqlite3.connect('qlearning_game.db')
    conn.row_factory = sqlite3.Row
    return conn

def initialize_q_table():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS q_table (
            state TEXT PRIMARY KEY,
            action_A REAL,
            action_D REAL
        )''')
    conn.execute("INSERT OR IGNORE INTO q_table (state, action_A, action_D) VALUES ('A', 0, 0), ('D', 0, 0)")
    conn.commit()
    conn.close()

def get_q_values(state):
    conn = get_db_connection()
    q_values = conn.execute('SELECT * FROM q_table WHERE state = ?', (state,)).fetchone()
    conn.close()
    return q_values if q_values else {'action_A': 0, 'action_D': 0}

def update_q_table(state, action, reward, next_state, alpha, gamma):
    global update_counter
    conn = get_db_connection()
    current_q = get_q_values(state)[f'action_{action}']
    max_next_q = max(get_q_values(next_state).values())
    new_q = current_q + alpha * (reward + gamma * max_next_q - current_q)
    conn.execute(f'UPDATE q_table SET action_{action} = ? WHERE state = ?', (new_q, state))
    conn.commit()
    conn.close()

    update_counter += 1

@app.post("/predict")
def predict(request_data: PredictionRequest):
    q_values = get_q_values(request_data.state)
    action = 'A' if q_values['action_A'] >= q_values['action_D'] else 'D'
    return {"action": action}


@app.post("/update")
def update(request_data: UpdateRequest):
    alpha, gamma = 0.1, 0.6
    update_q_table(request_data.state, request_data.action, request_data.reward, request_data.next_state, alpha, gamma)
    if update_counter >= UPDATE_THRESHOLD:
        # Additional logic if needed
        pass
    return {"success": True}


if __name__ == "__main__":
    initialize_q_table()
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
