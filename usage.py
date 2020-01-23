import ngl_component
import base64
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_daq as daq

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True

heading_style = {'width': '48%'}

viewport_style = {
                'width': '48%',
                'height': '500px',
                'float': 'left',
                }

frame_style = {
            'borderWidth': '1px',
            'borderStyle': 'dashed',
            'borderRadius': '5px',
            'margin': '10px',
            'padding': '10px',
            'position': 'relative',
        }

box_style = {
    'display': 'inline-flex',
    'width': '100%',
    }

label_style = {
    'float': 'left',
}

row_style = {
    'display': 'flex',
    'width': '100%',
    'alignItems': 'center',
    'justifyContent': 'space-around',
}

upload_style = {
    'borderWidth': '1px',
    'borderStyle': 'dashed',
    'borderRadius': '5px',
    'textAlign': 'center',
    # 'width': '100%',
    'padding': '10px'
}

slider_style = {
    'width': '50%',
    'padding': '10px',
    'margin': '10px'
}

slider_row_style = {
    'display': 'inline-flex',
    'width': '100%',
    'justifyContent': 'space-around'
}

schemes = ['atomindex', 'bfactor', 'chainid', 
            'chainindex', 'chainname', 'densityfit', 'electrostatic', 'element', 'entityindex', 'entitytype', 'geoquality', 'hydrophobicity', 'modelindex', 'moleculetype', 'occupancy', 'random', 'residueindex', 'resname', 'sstruc', 'uniform', 'value', 'volume']

schemesDict = [{'label': k.capitalize(),
                'value': k,
                'disabled': False} for k in schemes]

app.layout = html.Div([
    ngl_component.NGLComponent(id='viewport',
                               highlightAtomsOnClick=True,
                               viewportStyle=viewport_style),
    html.Div(children=[
        html.Div(children=[
            html.H4('Upload a file: ', style=label_style),
            dcc.Upload(id='file-upload',
                    accept='.cif,.pdb,.ent,.pqr,.gro,.sdf,.mol2',
                    children=[html.Div('Select a file',
                    style=upload_style)]),
        ], style=row_style),

        html.Div(children=[
            html.H4('Number of loaded components', style=label_style),
            html.Div(id='n_components', style=label_style),
        ], style=row_style),

        html.Div(children=[
            html.H3('Selected atoms'),
            html.Div(children=[
                html.H4('Selected atom indices', style=label_style),
                dcc.Textarea(id='selected_atoms', 
                             style=label_style,
                             readOnly=True,
                             wrap='true'),
            ], style=row_style),
            html.Div(children=[
                html.H4('Highlight color scheme', style=label_style),
                dcc.Dropdown(id='color-scheme',
                         value='uniform',
                         options=schemesDict,
                         multi=False,
                         style={'width': '50%'}
                         )
            ], style=row_style),

            html.Div(children=[
                html.H4('Selected atom color', style=label_style),
                daq.ColorPicker(id='color-picker', 
                            value={'hex': '#ffffff'},),
            ], style=row_style),
            
            html.Div(children=[
                html.H4('Selected atom opacity', style=label_style),
                html.Div([dcc.Slider(id='selected-opacity',
                        min=0, max=1, value=0.5, step=0.05),],
                        style=slider_style),
            ], style=slider_row_style),
            
            html.Div(children=[
                html.H4('Atom scale', style=label_style),
                html.Div([dcc.Slider(id='atom-scale',
                        min=0, max=10, value=1.4, step=0.1),],
                        style=slider_style),
            ], style=slider_row_style),

            html.Div(children=[
                html.H4('Bond scale', style=label_style),
                html.Div([dcc.Slider(id='bond-scale',
                        min=0, max=10, value=1.4, step=0.1,)],
                        style=slider_style),
            ], style=slider_row_style),
            
        ], style=frame_style),
        
    ], style=frame_style)
], style=box_style)


@app.callback(
    Output('viewport', 'data'),
    [Input('file-upload', 'contents')],
    [State('file-upload', 'filename')]
)
def get_data(contents, filename):
    if not contents:
        return {}
    if filename:
        ext = filename.split('.')[-1]
    else:
        ext = ''

    content_type, content_string = contents.split(',')
    decoded = base64.b64decode(content_string)
    return {'filename': filename,
            'ext': ext,
            'config': {'type': 'text/plain',
                       'input': decoded.decode('UTF-8')}
            }

@app.callback(Output('selected_atoms', 'value'),
              [Input('viewport', 'selectedAtomIndices')])
def display_output(indices):
    if not indices:
        return ''
    return ', '.join(map(str, indices))

@app.callback(Output('n_components', 'children'),
              [Input('viewport', 'numberOfComponents')])
def n_component_output(value):
    return value

@app.callback(Output('viewport', 'highlightStyle'),
              [Input('color-picker', 'value'),
               Input('selected-opacity', 'value'),
               Input('atom-scale', 'value'),
               Input('bond-scale', 'value'),
               Input('color-scheme', 'value')])
def update_highlight_style(color, opacity, atom_scale, bond_scale, color_scheme):
    c = color['hex']
    return {'opacity': opacity,
            'scale': atom_scale,
            'bondScale': bond_scale,
            'colorValue': c,
            'colorScheme': color_scheme}


if __name__ == '__main__':
    app.run_server(debug=True)
