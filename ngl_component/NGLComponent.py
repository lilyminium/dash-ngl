# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class NGLComponent(Component):
    """A NGLComponent component.


Keyword arguments:
- id (string; optional): The ID used to identify this component in Dash callbacks
- viewportStyle (dict; optional): Custom properties
- stageParameters (dict; optional)
- files (optional): . files has the following type: list | dict containing keys 'filename', 'config'.
Those keys have the following types:
  - filename (string; required)
  - config (list; optional)
- activeComponentUUID (string; optional)
- activeCoordinates (list; optional)
- selectedAtomIndices (list; optional)
- picked (number; optional)"""
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED,
                 viewportStyle=Component.UNDEFINED,
                 stageParameters=Component.UNDEFINED,
                 files=Component.UNDEFINED,
                 activeComponentUUID=Component.UNDEFINED,
                 activeCoordinates=Component.UNDEFINED,
                 selectedAtomIndices=Component.UNDEFINED,
                 picked=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'viewportStyle', 'stageParameters', 'files',
                            'activeComponentUUID', 'activeCoordinates',
                            'selectedAtomIndices', 'picked']
        self._type = 'NGLComponent'
        self._namespace = 'ngl_component'
        self._valid_wildcard_attributes = []
        self.available_properties = ['id', 'viewportStyle', 'stageParameters',
                                     'files', 'activeComponentUUID',
                                     'activeCoordinates',
                                     'selectedAtomIndices', 'picked']
        self.available_wildcard_properties = []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(NGLComponent, self).__init__(**args)
