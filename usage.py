import ngl_component
import dash
import dash_core_components as dcc
from dash.dependencies import Input, Output
import dash_html_components as html

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True

filename = 'data/ATP.pdb'


def getData(filename):
    with open(filename, 'r') as f:
        contents = f.read()

    ext = filename.split('.')[-1]
    return {
        'filename': filename,
        'ext': ext,
        'config':
            {
                'type': 'text/plain',
                'input': contents
            }

    }


app.layout = html.Div([
    ngl_component.NGLComponent(id='viewport', data=getData(filename)),
    html.Div(id='output')
])


@app.callback(Output('output', 'children'), [Input('viewport', 'activeCoordinates')])
def display_output(value):
    return 'You have entered {}'.format(value)


if __name__ == '__main__':
    app.run_server(debug=True)
