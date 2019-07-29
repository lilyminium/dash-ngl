import ngl_component
import dash
from dash.dependencies import Input, Output
import dash_html_components as html

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True


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
    ngl_component.NGLComponent(id='viewport', data=getData('data/ATP.pdb')),
    html.Div(id='selected_output'),
    html.Div(id='coordinate_output'),
])


@app.callback(Output('coordinate_output', 'children'),
              [Input('viewport', 'activeCoordinates')])
def display_coordinate_utput(value):
    return 'You have entered these coordinates: {}'.format(value)


@app.callback(Output('selected_output', 'children'),
              [Input('viewport', 'selectedAtomIndices')])
def display_output(value):
    return 'You have selected these atoms: {}'.format(value)


if __name__ == '__main__':
    app.run_server(debug=True)
