import mysql.connector
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)




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
    conn = mysql.connector.connect(
        host=os.getenv("host", "35.197.250.32"),
        user=os.getenv("user", "probability2"),
        password=os.getenv("password", "KilimasMieg4.."),
        database=os.getenv("database", "probability2")
    )
    return conn


def initialize_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS q_table (
            state VARCHAR(50) PRIMARY KEY,
            action_A FLOAT,
            action_D FLOAT
        )
    ''')
    cursor.execute("INSERT IGNORE INTO q_table (state, action_A, action_D) VALUES ('A', 0, 0), ('D', 0, 0)")
    conn.commit()
    conn.close()


def get_q_values(state):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM q_table WHERE state = %s', (state,))
    q_values = cursor.fetchone()
    conn.close()
    return q_values if q_values else {'action_A': 0, 'action_D': 0}

def update_q_table(state, action, reward, next_state, alpha, gamma):
    global update_counter
    conn = get_db_connection()
    cursor = conn.cursor()

    current_q = get_q_values(state)[f'action_{action}']
    max_next_q = max(get_q_values(next_state).values())
    new_q = current_q + alpha * (reward + gamma * max_next_q - current_q)

    cursor.execute(f'UPDATE q_table SET action_{action} = %s WHERE state = %s', (new_q, state))
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
    initialize_db()
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

