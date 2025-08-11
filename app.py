from flask import Flask, render_template, request, jsonify
import os, datetime

app = Flask(__name__, static_folder='static', template_folder='templates')

MESSAGES_FILE = os.path.join(os.path.dirname(__file__), "messages.txt")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/send', methods=['POST'])
def send():
    data = request.json or {}
    name = data.get('name','Anônimo')
    msg = data.get('message','')
    ts = datetime.datetime.utcnow().isoformat() + 'Z'
    line = f"{ts} | {name} | {msg}\n"
    try:
        with open(MESSAGES_FILE, "a", encoding="utf-8") as f:
            f.write(line)
        return jsonify(success=True, saved=line)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
