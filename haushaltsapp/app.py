from flask import Flask, request, jsonify

app = Flask(__name__)

tasks = []
points = {}

@app.route('/tasks', methods=['GET', 'POST'])
def manage_tasks():
    if request.method == 'POST':
        task = request.json
        tasks.append(task)
        return jsonify({"message": "Task added successfully!"}), 201
    return jsonify(tasks)

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    if 0 <= task_id < len(tasks):
        tasks.pop(task_id)
        return jsonify({"message": "Task deleted successfully!"})
    return jsonify({"error": "Task not found!"}), 404

@app.route('/points', methods=['GET', 'POST'])
def manage_points():
    if request.method == 'POST':
        data = request.json
        user = data['user']
        points[user] = points.get(user, 0) + data['points']
        return jsonify({"message": "Points updated successfully!"})
    return jsonify(points)

@app.route('/reset', methods=['POST'])
def reset_points():
    global points
    winner = max(points, key=points.get, default=None)
    points = {}
    return jsonify({"message": "Points reset successfully!", "winner": winner})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
