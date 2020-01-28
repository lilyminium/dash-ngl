import ngl_component
import base64
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import dash_core_components as dcc
import dash_bootstrap_components as dbc
import dash_daq as daq

external_stylesheets = [
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css']

external_scripts = ['https://code.jquery.com/jquery-3.2.1.slim.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js',
                    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js']

app = dash.Dash(__name__,
                external_stylesheets=external_stylesheets,
                external_scripts=external_scripts,
                suppress_callback_exceptions=True)


# app.scripts.config.serve_locally = True
# app.css.config.serve_locally = True

# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║                      CSS styles                      ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

viewport_style = {
    'width': '48%',
    'height': '500px',
    'float': 'left',
}

# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║                      Data                      ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

representations = [
    'axes',
    'backbone',
    'ball+stick',
    # 'base',
    'cartoon',
    # 'contact',
    'distance',
    'helixorient',
    'hyperball',
    'label',
    'licorice',
    'line',
    'point',
    'ribbon',
    'rocket',
    'rope',
    'spacefill',
    'surface',
    'trace',
    'tube',
    'unitcell',
    'validation'
]

web_colors = [
    'White',
    'Silver',
    'Gray',
    'Black',
    'Red',
    'Maroon',
    'Yellow',
    'Olive',
    'Lime',
    'Green',
    'Aqua',
    'Teal',
    'Blue',
    'Navy',
    'Fuchsia',
    'Purple'
]

WEB_COLORS = [{'label': k, 'value': k.lower()} for k in web_colors]

camera_types = ['perspective', 'orthographic']
CAMERA_TYPES = [{'label': k.capitalize(), 'value': k} for k in camera_types]

mouse_presets = ['default', 'pymol', 'coot', 'astexviewer']
MOUSE_PRESETS = [{'label': k.capitalize(), 'value': k} for k in mouse_presets]

REPRESENTATIONS = [{'label': k.capitalize(), 'value': k}
                   for k in representations]

schemes = ['atomindex', 'bfactor', 'chainid',
           'chainindex', 'chainname', 'densityfit',
           'electrostatic', 'element', 'entityindex',
           'entitytype', 'geoquality', 'hydrophobicity',
           'modelindex', 'moleculetype', 'occupancy',
           'random', 'residueindex', 'resname', 'sstruc',
           'uniform', 'value', 'volume']

COLOR_SCHEMES = [{'label': k.capitalize(), 'value': k} for k in schemes]

label_width = 4
col_width = 8

# ╔═══*.·:·.☽✧  ✦  ✦  ✧☾.·:·.*═══╗
# ║        Navigation bar        ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✧☾.·:·.*═══╝

navbar = dbc.NavbarSimple(
    children=[
        dbc.NavItem(dbc.NavLink("Source", href="#")),
    ],
    color='primary',
    dark=True,
    brand="NGLComponent demo",
    brand_href="#",
    sticky="top",
)

# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║                Upload tab                ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

upload_tab = dbc.Card([
    dbc.CardBody([

        dbc.FormGroup([
            dbc.Label('Upload a file:', width=label_width),
            dbc.Col([
                dcc.Upload(id='file-upload',
                           accept='.cif,.pdb,.ent,.pqr,.gro,.sdf,.mol2',
                           children=[dbc.Button('Select a file')])
            ], width=col_width),
        ], row=True),

        # dbc.FormGroup([
        #     dbc.Label('Number of loaded components', width=label_width),
        #     dbc.Col([
        #         html.Div(id='n_components')
        #     ], width=col_width)
        # ], row=True)
    ])
])

# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║                  Representation tab                  ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝


repr_tab = dbc.Card(children=[
    dbc.CardBody([
        dbc.FormGroup([
            dbc.Label('Uploaded files', width=label_width),
            dbc.Col([
                dcc.Dropdown(id='uploaded-files',
                             options=[],
                             multi=False,
                             persistence=True
                             )
            ], width=col_width)
        ], row=True),

        dbc.Card([
            dbc.CardBody([
                dbc.FormGroup([
                    dbc.Label('Representation', width=label_width),
                    dbc.Col([
                        dcc.Dropdown(id='representation',
                                     options=[],
                                     multi=False,
                                     persistence=True
                                     )
                    ], width=col_width)
                ], row=True),

                dbc.FormGroup([
                    dbc.Label('Type', width=label_width),
                    dbc.Col([
                        dcc.Dropdown(id='repr-type',
                                     options=REPRESENTATIONS,
                                     multi=False,
                                     persistence=True,
                                     value=None,
                                     )
                    ], width=col_width)
                ], row=True),

                dbc.FormGroup([
                    dbc.Label('Color scheme', width=label_width),
                    dbc.Col([
                        dcc.Dropdown(id='repr-color-scheme',
                                     options=COLOR_SCHEMES,
                                     multi=False,
                                     value=None,
                                     #  persistence=True
                                     )
                    ], width=col_width)
                ], row=True),

                dbc.FormGroup([
                    dbc.Label('Selection', width=label_width),
                    dbc.Col([
                        dbc.Input(id='repr-selection',
                                  value='',
                                  type='text',
                                  debounce=True,
                                  )
                    ], width=col_width)
                ], row=True),

                dbc.Button('Delete', id='delete-repr', color='primary',)
            ]),
        ]),

        dbc.Card([
            dbc.Button('Add new', id='add-repr', color='primary')
        ])
    ])
], id='repr-tab-card', style={'display': 'block'})

# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║                 Highlight tab                  ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝


highlight_tab = dbc.Card([
    dbc.CardBody([
        dbc.FormGroup([
            dbc.Label('Selected atom indices', width=label_width),
            dbc.Col([
                dcc.Textarea(id='selected_atoms',
                             readOnly=True,
                             wrap='true',
                             style={'width': '100%'}),
            ], width=col_width)
        ], row=True),

        dbc.FormGroup([
            dbc.Label('Highlight color scheme', width=label_width),
            dbc.Col([
                dcc.Dropdown(id='highlight-color-scheme',
                             value='uniform',
                             options=COLOR_SCHEMES,
                             multi=False,
                             persistence=True,
                             )
            ], width=col_width)
        ], row=True),

        dbc.FormGroup([
            dbc.Label('Selected atom color', width=label_width),
            dbc.Col([
                daq.ColorPicker(id='color-picker',
                                value={'hex': '#ffffff'},)
            ], width=col_width)
        ], row=True),

        dbc.FormGroup([
            dbc.Label('Selected atom opacity', width=label_width),
            dbc.Col([
                dcc.Slider(id='selected-opacity',
                           min=0, max=1, value=0.5, step=0.05,
                           persistence=True)
            ], width=col_width)
        ], row=True),

        dbc.FormGroup([
            dbc.Label('Atom scale', width=label_width),
            dbc.Col([
                dcc.Slider(id='atom-scale',
                           min=0, max=10, value=1.4, step=0.1,
                           persistence=True),
            ], width=col_width)
        ], row=True),

        dbc.FormGroup([
            dbc.Label('Bond scale', width=label_width),
            dbc.Col([
                dcc.Slider(id='bond-scale',
                           min=0, max=10, value=1.4, step=0.1,
                           persistence=True)
            ], width=col_width)
        ], row=True),
    ]),
], id='highlight-tab-card', style={'display': 'none'})


# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║           Stage parameters tab           ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

stage_tab = dbc.Card([
    dbc.CardBody([
        dbc.FormGroup([
            dbc.Label('Background color'),
            dcc.Dropdown(id='stage-bg-color',
                         options=WEB_COLORS,
                         value='black')
        ]),
        dbc.FormGroup([
            dbc.Label('Camera type'),
            dcc.Dropdown(id='stage-camera-type',
                         options=CAMERA_TYPES,
                         value='perspective')
        ]),
        dbc.FormGroup([
            dbc.Label('Mouse preset'),
            dcc.Dropdown(id='stage-mouse-preset',
                         options=MOUSE_PRESETS,
                         value='default')
        ]),
    ])
], id='stage-tab-card', style={'display': 'none'})

# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║                App layout                ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

app.layout = html.Div([
    navbar,
    html.Div([
        ngl_component.NGLComponent(id='viewport',
                                   highlightAtomsOnClick=True,
                                   viewportStyle=viewport_style),
        dbc.Card([
            dbc.CardBody([
                upload_tab,
                html.Div(children=[
                    dcc.Tabs(id='tab-frame',
                             value='repr-tab',
                             children=[
                                dcc.Tab(label='Representations',
                                        value='repr-tab',),
                                dcc.Tab(label='Highlight settings',
                                        value='highlight-tab'),
                                dcc.Tab(label='Stage parameters',
                                        value='stage-tab')
                             ], persistence=True),
                    repr_tab,
                    highlight_tab,
                    stage_tab
                ])
            ])
        ])
    ], style={'margin': '20px'})
])


# ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
# ║                  Interactions                  ║
# ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

@app.callback(
    [Output('repr-tab-card', 'style'),
     Output('highlight-tab-card', 'style'),
     Output('stage-tab-card', 'style')],
    [Input('tab-frame', 'value')]
)
def render_tab(tab):
    visible = {'display': 'block'}
    hide = {'display': 'none'}
    if tab == 'highlight-tab':
        return (hide, visible, hide)
    if tab == 'repr-tab':
        return (visible, hide, hide)
    if tab == 'stage-tab':
        return (hide, hide, visible)


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
    _, content_string = contents.split(',')
    decoded = base64.b64decode(content_string)
    return {'filename': filename,
            'ext': ext,
            'config': {'type': 'text/plain',
                       'input': decoded.decode('UTF-8')}
            }

# •❅───────────────────✧❅✦❅✧───────────────────❅•
# |          Representation callbacks           |
# •❅───────────────────✧❅✦❅✧───────────────────❅•


@app.callback(
    Output('uploaded-files', 'options'),
    [Input('viewport', 'activeComponentUUID')],
    [State('uploaded-files', 'options'),
     State('file-upload', 'filename')]
)
def get_uploaded_file(uuid, options, filename):
    if not uuid or not filename:
        return options
    for item in options:
        if item['value'] == uuid:
            return options
    options.append({'label': filename, 'value': uuid})
    return options


@app.callback(
    Output('viewport', 'activeComponentUUID'),
    [Input('uploaded-files', 'value'), ],
)
def set_active_repr(uuid):
    return uuid


@app.callback(
    Output('representation', 'options'),
    [Input('viewport', 'currentRepresentationParameters')],
)
def get_current_representations(params):
    if not params:
        return []

    def label(p):
        return '{} | sel: "{}"'.format(p['type'], p['params']['sele'])

    def optify(i, k):
        return {'label': label(k), 'value': i}

    return [optify(i, k) for i, k in enumerate(params[:-1])]


@app.callback(
    Output('viewport', 'queuedAction'),
    [Input('repr-type', 'value'),
     Input('repr-color-scheme', 'value'),
     Input('repr-selection', 'value')],
    [State('representation', 'value'),
     State('viewport', 'currentRepresentationParameters')]
)
def get_queued_action(repr_type, color_scheme, sele, index, params):
    if not params:
        return {}
    if index is None:
        return {}

    r = params[index]
    if repr_type != r['type']:
        action = {'funcName': 'updateRepresentationTypeByIndex',
                  'args': {'index': index,
                           'newType': repr_type}}
        return action

    action = {'funcName': 'updateRepresentationParamsByIndex',
              'args': {'index': index,
                       'params': {'colorValue': '#fff',
                                  'colorScheme': color_scheme,
                                  'sele': sele}}}
    return action


@app.callback(
    Output('viewport', 'addRepresentationParams'),
    [Input('add-repr', 'n_clicks')],
    [State('repr-type', 'value'),
     State('repr-color-scheme', 'value'),
     State('repr-selection', 'value')]
)
def add_repr(clicks, repr_type, color_scheme, sele):
    params = {'type': repr_type,
              'params': {'colorScheme': color_scheme,
                         'sele': sele,
                         'visible': True}}
    return params


@app.callback(
    [Output('repr-type', 'value'),
     Output('repr-color-scheme', 'value'),
     Output('repr-selection', 'value')],
    [Input('representation', 'value')],
    [State('viewport', 'currentRepresentationParameters'),
     State('repr-type', 'value'),
     State('repr-color-scheme', 'value'),
     State('repr-selection', 'value')]
)
def change_repr(index, params, repr_type, color_scheme, sele):
    if not params:
        return repr_type, color_scheme, sele
    if index is None:
        return None, None, None
    r = params[index]
    return r['type'], r['params']['colorScheme'], r['sele']


@app.callback(
    Output('viewport', 'deleteRepresentationIndex'),
    [Input('delete-repr', 'n_clicks')],
    [State('representation', 'value'),
     State('representation', 'options')]
)
def delete_repr(n_clicks, index, options):
    if not options:
        index = None
    return index

# •❅────────────────✧❅✦❅✧────────────────❅•
# |          Highlight callbacks          |
# •❅────────────────✧❅✦❅✧────────────────❅•

@app.callback(Output('selected_atoms', 'value'),
              [Input('viewport', 'selectedAtomIndices')])
def display_output(indices):
    if not indices:
        return ''
    return ', '.join(map(str, indices))


@app.callback(Output('viewport', 'highlightParameters'),
              [Input('color-picker', 'value'),
               Input('selected-opacity', 'value'),
               Input('atom-scale', 'value'),
               Input('bond-scale', 'value'),
               Input('highlight-color-scheme', 'value')])
def update_highlight_style(color, opacity, atom_scale,
                           bond_scale, color_scheme):
    c = color['hex']
    return {'opacity': opacity,
            'scale': atom_scale,
            'bondScale': bond_scale,
            'colorValue': c,
            'colorScheme': color_scheme}

# •❅──────────────────✧❅✦❅✧──────────────────❅•
# |              Stage callbacks              |
# •❅──────────────────✧❅✦❅✧──────────────────❅•


@app.callback(Output('viewport', 'stageParameters'),
              [Input('stage-bg-color', 'value'),
               Input('stage-camera-type', 'value'),
               Input('stage-mouse-preset', 'value')])
def update_stage(bgcolor, camera_type, mouse_preset):
    return {'backgroundColor': bgcolor,
            'cameraType': camera_type,
            'mousePreset': mouse_preset}


if __name__ == '__main__':
    app.run_server(debug=True)
