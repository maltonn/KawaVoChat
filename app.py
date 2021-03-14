import os
from flask import *
app = Flask(__name__, static_folder='static/', template_folder='.')

@app.route('/', methods=['GET', 'POST'])
def Main():
    if request.method == 'GET':
        return render_template('index.html')


if __name__ == '__main__':
    app.run()
    port = int(os.getenv('PORT', 5000))