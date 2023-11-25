import pandas as pd
from flask import Flask, jsonify, request

app = Flask(__name__)

# Global counter for updates and threshold for saving
update_counter = 0
UPDATE_THRESHOLD = 50  # Save after these many updates

# Initialize or load the Q-table
def initialize_or_load_q_table(filename='q_table.csv'):
    try:
        return pd.read_csv(filename, index_col=0)
    except FileNotFoundError:
        actions = ['A', 'D']
        states = ['A', 'D']
        return pd.DataFrame(data=0, index=states, columns=actions)

# Initialize/load the Q-table
q_table = initialize_or_load_q_table()

def update_q_table(state, action, reward, next_state, alpha, gamma):
    global q_table, update_counter
    max_next_q = q_table.loc[next_state].max()
    q_table.at[state, action] += alpha * (reward + gamma * max_next_q - q_table.at[state, action])

    # Increment update counter and save periodically
    update_counter += 1
    if update_counter >= UPDATE_THRESHOLD:
        save_q_table(q_table)
        update_counter = 0

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        current_state = data['state']
        action = q_table.loc[current_state].idxmax()
        return jsonify({'action': action})
    except KeyError:
        return jsonify({'error': 'Invalid state'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update', methods=['POST'])
def update():
    try:
        data = request.json
        state, action, reward, next_state = data['state'], data['action'], data['reward'], data['next_state']
        alpha, gamma = 0.1, 0.6
        update_q_table(state, action, reward, next_state, alpha, gamma)
        return jsonify({'success': True})
    except KeyError:
        return jsonify({'error': 'Invalid input data'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def save_q_table(q_table, filename='q_table.csv'):
    q_table.to_csv(filename)

if __name__ == '__main__':
    app.run(debug=True)
