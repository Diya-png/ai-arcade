from flask import Flask, render_template, request, jsonify
import heapq

app = Flask(__name__)

# Global variable for goal state in 8-puzzle
GOAL_STATE = []

# 8-Puzzle Algorithm
class PuzzleState:
    def __init__(self, board, path):
        self.board = board
        self.path = path
        self.cost = self.heuristic() + len(path)

    def heuristic(self):
        return sum(1 for i in range(9) if self.board[i] != GOAL_STATE[i] and self.board[i] != 0)

    def get_neighbors(self):
        neighbors = []
        i = self.board.index(0)
        x, y = i // 3, i % 3
        moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        for dx, dy in moves:
            nx, ny = x + dx, y + dy
            if 0 <= nx < 3 and 0 <= ny < 3:
                ni = nx * 3 + ny
                new_board = self.board[:]
                new_board[i], new_board[ni] = new_board[ni], new_board[i]
                neighbors.append((new_board, i, ni))
        return neighbors

    def __lt__(self, other):
        return self.cost < other.cost

# Routes for 8-Puzzle
@app.route('/8-puzzle')
def eight_puzzle():
    return render_template('puzzle.html')

@app.route('/solve-8-puzzle', methods=['POST'])
def solve_8_puzzle():
    data = request.json
    start = data['start']
    global GOAL_STATE
    GOAL_STATE = data['goal']

    open_set = []
    visited = set()
    heapq.heappush(open_set, PuzzleState(start, []))

    while open_set:
        current = heapq.heappop(open_set)
        if current.board == GOAL_STATE:
            final_path = current.path + [{'from': -1, 'to': -1, 'state': current.board}]
            return jsonify({'steps': current.path})

        visited.add(tuple(current.board))

        for neighbor, from_idx, to_idx in current.get_neighbors():
            if tuple(neighbor) not in visited:
                new_path = current.path + [{'from': from_idx, 'to': to_idx, 'state': neighbor}]
                heapq.heappush(open_set, PuzzleState(neighbor, new_path))

    return jsonify({'steps': []})

# Routes for Water Jug Problem
@app.route('/water-jug')
def water_jug():
    return render_template('waterjug.html')

@app.route('/solve-water-jug', methods=['POST'])
def solve_water_jug():
    data = request.json
    cap_a = data['jugA']
    cap_b = data['jugB']
    goal = data['goal']

    def heuristic(state):
        a, b = state
        return min(abs(goal - a), abs(goal - b))

    visited = set()
    current = (0, 0)
    path = [current]
    visited.add(current)

    while True:
        a, b = current
        next_states = [
            (cap_a, b),           # Fill jug A
            (a, cap_b),           # Fill jug B
            (0, b),               # Empty jug A
            (a, 0),               # Empty jug B
            (max(0, a - (cap_b - b)), min(cap_b, b + a)),  # Pour A → B
            (min(cap_a, a + b), max(0, b - (cap_a - a))),  # Pour B → A
        ]

        next_states = [s for s in next_states if s not in visited]

        if not next_states:
            break

        next_state = min(next_states, key=heuristic)
        visited.add(next_state)
        path.append(next_state)

        if goal in next_state:
            break

        current = next_state

    return jsonify({'steps': path})


#TIC-TAC-TOE
@app.route('/tic-tac-toe')
def tic_tac_toe():
    return render_template('tictactoe.html')

@app.route('/solve-tic-tac-toe', methods=['POST'])
def solve_tic_tac_toe():
    data = request.json
    board = data['board']

    def evaluate_board(b):
        win_combos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]
        for combo in win_combos:
            a, b_, c = combo
            if b[a] and b[a] == b[b_] == b[c]:
                return 10 if b[a] == 'O' else -10
        return 0

    def minimax(new_board, depth, is_maximizing):
        score = evaluate_board(new_board)
        if score == 10 or score == -10 or '' not in new_board:
            return {'score': score}

        moves = []
        for i in range(9):
            if new_board[i] == '':
                new_board[i] = 'O' if is_maximizing else 'X'
                result = minimax(new_board, depth + 1, not is_maximizing)
                new_board[i] = ''
                moves.append({'index': i, 'score': result['score']})

        if is_maximizing:
            return max(moves, key=lambda x: x['score'])
        else:
            return min(moves, key=lambda x: x['score'])

    if board.count('') == 0:
        return jsonify({'move': -1, 'board': board})

    move = minimax(board[:], 0, True)
    board[move['index']] = 'O'

    return jsonify({'move': move['index'], 'board': board})

@app.route('/tsp')
def tsp():
    return render_template('tsp.html')

@app.route('/solve-tsp', methods=['POST'])
def solve_tsp():
    data = request.json
    cities = data['cities']  # List of {'x': float, 'y': float}

    def distance(a, b):
        return math.hypot(a['x'] - b['x'], a['y'] - b['y'])

    def dfs(city_idx, path, visited):
        visited.add(city_idx)
        path.append(city_idx)

        if len(path) == len(cities):
            path.append(path[0])  # Complete cycle
            return path

        for i in range(len(cities)):
            if i not in visited:
                result = dfs(i, path.copy(), visited.copy())
                if result:
                    return result
        return None

    def bfs():
        queue = [[0]]  # Each element is a list of city indices
        while queue:
            path = queue.pop(0)
            if len(path) == len(cities):
                return path + [path[0]]
            for i in range(len(cities)):
                if i not in path:
                    queue.append(path + [i])
        return None

    algo = data.get('algorithm', 'dfs')
    path = dfs(0, [], set()) if algo == 'dfs' else bfs()

    return jsonify({'path': path})


@app.route('/backprop')
def backprop():
    return render_template('backprop.html')

@app.route('/find-s')
def find_s():
    return render_template('finds.html')

@app.route('/solve-find-s', methods=['POST'])
def solve_find_s():
    data = request.json['data']  # Expecting list of [features..., label]

    hypothesis = ['0'] * (len(data[0]) - 1)

    for instance in data:
        if instance[-1].lower() == 'yes':
            for i in range(len(hypothesis)):
                if hypothesis[i] == '0':
                    hypothesis[i] = instance[i]
                elif hypothesis[i] != instance[i]:
                    hypothesis[i] = '?'
    return jsonify({'hypothesis': hypothesis})


# Homepage route
@app.route('/')
def home():
    return render_template('home.html')

if __name__ == '__main__':
    app.run(debug=True)
