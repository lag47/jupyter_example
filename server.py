from flask import Flask, request
#from flask_session import Session
from flask import url_for
from flask import send_file, render_template
import ast as ast
import contextlib as contextlib
import io as io
import sys as sys

app = Flask(__name__)
app.config.from_object(__name__)

@app.get("/client.js")
def client():
    return send_file('client.js')

@app.get("/style.css")
def style():
    return send_file('style.css')

@app.get("/")
def index():
    return render_template('index.html')


@app.post("/save")
def save():
    data = request.json
    print(str(data))
    write_cells(data['cells'])
    return {'result' : 'saved'}


@app.get("/restore")
def restore():
    current_cells = read_cells()
    return {'saved_cells' : current_cells}

@app.post("/eval")
def evaluate():
    data = request.json
    code = data['command']
    return {'result': evaluate_code(code)}

#redirect_stdout.contextlib

def run_line(line : ast.AST, output_stream):
    if type(line) == ast.Expr:
        result = (eval(compile(ast.Expression(line.value), "<string>", "eval"), globals()))
        if result:
            output_stream.write(str(result))
            output_stream.write("\n")
    else :
        exec(compile(ast.Module(body=[line], type_ignores=[]), "<string>", "exec"), globals())

def evaluate_code(code:str) -> str:
    """
    Takes in a string representing python code, executes it and returns the response of the final line along with all print messages up to that point
    """
    syntax = ast.parse(code)
    lines = syntax.body
    total_stream = io.StringIO()
    try:
        with contextlib.redirect_stderr(total_stream):
            with contextlib.redirect_stdout(total_stream):
                for line in lines:
                    run_line(line, total_stream)
        return total_stream.getvalue()
    except Exception as err:
        name = (type(err).__name__)
        return total_stream.getvalue() + name + ": " + str(err)


def write_cells(current_cells : list):
    with open('db.txt', 'w') as db:
        for cell in current_cells:
            db.write(cell)
            db.write('\\\\')



def read_cells() -> list:
    with open('db.txt', 'r') as db:
        str = db.read()
        current_cells = str.split('\\\\')
        return list(filter(lambda a: len(a) > 0, current_cells))