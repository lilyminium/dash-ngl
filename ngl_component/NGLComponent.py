# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class NGLComponent(Component):
    """A NGLComponent component.


Keyword arguments:
- id (string; default 'viewport'): The ID used to identify this component in Dash callbacks
- viewportStyle (dict; default {
    width: '500px',
    height: '500px',
}): CSS styling for viewport container
- stageParameters (dict; default {
    impostor: true,
    quality: 'medium',
    workerDefault: true,
    sampleLevel: 0,
    backgroundColor: 'black',
    rotateSpeed: 2.0,
    zoomSpeed: 1.2,
    panSpeed: 1.0,
    clipNear: 0,
    clipFar: 100,
    clipDist: 10,
    fogNear: 50,
    fogFar: 100,
    cameraFov: 40,
    cameraEyeSep: 0.3,
    cameraType: 'perspective',
    lightColor: 0xdddddd,
    lightIntensity: 1.0,
    ambientColor: 0xdddddd,
    ambientIntensity: 0.2,
    hoverTimeout: 0,
    tooltip: true,
    mousePreset: 'default'
}): Parameters for the stage
- data (dict; optional): File object to load into the stage. data has the following type: list of dicts containing keys 'filename', 'ext', 'config'.
Those keys have the following types:
  - filename (string; required)
  - ext (string; optional)
  - config (dict; optional): config has the following type: dict containing keys 'type', 'input'.
Those keys have the following types:
  - type (string; required)
  - input (string; required) | dict containing keys 'filename', 'ext', 'config'.
Those keys have the following types:
  - filename (string; required)
  - ext (string; optional)
  - config (dict; optional): config has the following type: dict containing keys 'type', 'input'.
Those keys have the following types:
  - type (string; required)
  - input (string; required) | dict
- activeComponentUUID (string; optional): UUID of the active component
- selectedAtomIndices (list of numbers; optional): Indices of the selected atoms
- highlightAtomsOnClick (boolean; default False): Whether to highlight atoms on click
- highlightName (string; default 'highlighted'): Current name for highlighted representations
- highlightStyle (dict; default {
    opacity: 0.5,
    bondScale: 1.4,
    scale: 1.4,
    colorScheme: 'uniform',
    color: '#fff'
}): Style for highlight representations
- numberOfComponents (number; default 0): Number of components loaded"""
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, viewportStyle=Component.UNDEFINED, stageParameters=Component.UNDEFINED, data=Component.UNDEFINED, activeComponentUUID=Component.UNDEFINED, selectedAtomIndices=Component.UNDEFINED, highlightAtomsOnClick=Component.UNDEFINED, highlightName=Component.UNDEFINED, highlightStyle=Component.UNDEFINED, numberOfComponents=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'viewportStyle', 'stageParameters', 'data', 'activeComponentUUID', 'selectedAtomIndices', 'highlightAtomsOnClick', 'highlightName', 'highlightStyle', 'numberOfComponents']
        self._type = 'NGLComponent'
        self._namespace = 'ngl_component'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'viewportStyle', 'stageParameters', 'data', 'activeComponentUUID', 'selectedAtomIndices', 'highlightAtomsOnClick', 'highlightName', 'highlightStyle', 'numberOfComponents']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(NGLComponent, self).__init__(**args)
