import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Stage } from 'ngl';

export default class NGLComponent extends Component {

    constructor(props) {
        super(props);
        
        // bind this methods
        this.loadData = this.loadData.bind(this);
        this._loadComponent = this._loadComponent.bind(this);
        this.updateHighlightedAtoms = this.updateHighlightedAtoms.bind(this);
        this.removeComponentByUUID = this.removeComponentByUUID.bind(this);
        this.getComponentByUUID = this.getComponentByUUID.bind(this);

        const style = {...defaultHighlightStyle, ...this.props.highlightStyle};
        this.highlightStyle = style;
    }

    render() {
        const { id, viewportStyle } = this.props;
        const style = { ...defaultViewportStyle, ...viewportStyle };

        return (
            <div id={id} style={style} />
        );
    }

    componentDidMount() {
        this.createStage();
    }

    onDrop(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    createStage() {
        // create Stage and add mouse events
        // should only be called once after component is mounted

        const {id, stageParameters} = this.props;

        const stage = new Stage(id);
        this.stage = stage;

        // add mouse events
        this.stage.viewer.container.addEventListener('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }, false);
        this.stage.viewer.container.addEventListener('drop', this.onDrop, false);
        document.addEventListener('dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'none';
        }, false);
        document.addEventListener('drop', this.onDrop, false);

        this.mouse = this.stage.mouseObserver;
        this.controls = this.stage.mouseControls;

        if (this.props.highlightAtomsOnClick) {
            this.mouse.signals.clicked.add(this.onAtomClick, this)
        }
        
        // CSS theme
        // Don't care about CSS for now

        // Window resizing
        this.stage.handleResize();
        // FIXME hack for ie11
        setTimeout(function () { stage.handleResize() }, 500)
    }

    componentDidUpdate(prevProps) {
        const {data, selectedAtomIndices, activeComponentUUID} = this.props;
        const {highlightStyle, stageParameters} = this.props;

        // load text if it's changed
        if (prevProps.data !== data) {
            setTimeout(this.loadData(data), 500)
        }

        // change active component
        if (prevProps.activeComponentUUID !== activeComponentUUID) {
            this.hideAllComponents();
            this.setComponentVisibility(true, activeComponentUUID);
        }

        // change highlighted atoms
        if ((prevProps.selectedAtomIndices !== selectedAtomIndices) || 
            (prevProps.activeComponentUUID !== activeComponentUUID) ||
            (prevProps.highlightStyle !== highlightStyle)) {
                this.updateHighlightedAtoms();
        }

        // change stage
        if (prevProps.stageParameters !== stageParameters) {
            this.stage.setParameters(stageParameters)
        }
    }

    refreshStage() {
        this.stage.viewer.requestRender();
    }

    onAtomClick(x, y) {
        // select atoms on click

        const pickingProxy = this.stage.pickingControls.pick(x, y);
        const {setProps} = this.props;

        if (pickingProxy) {
            let atom = pickingProxy._objectIfType('atom');

            if (atom) {
                const id = atom.index;
                const newselectedAtomIndices = this.props.selectedAtomIndices.slice();
                const index = newselectedAtomIndices.indexOf(id);

                if (index !== -1) {
                    newselectedAtomIndices.splice(index, 1);
                    console.log(newselectedAtomIndices);
                } else {
                    newselectedAtomIndices.push(id);
                }

                setProps({selectedAtomIndices: newselectedAtomIndices});
            }
        }
    }

    loadData(data) {
        if (!data.config) {
            return
        }
        var stringBlob = new Blob([data.config.input], { type: data.config.type })
        this.stage.loadFile(stringBlob, { ext: data.ext }).then(comp => {
            this._loadComponent(comp);

        })

    }

    _loadComponent(comp) {
        const {highlightName, highlightStyle, setProps} = this.props;
        this.hideAllComponents();
        // basic representation
        comp.addRepresentation('ball+stick');
        // highlight representation
        comp.addRepresentation('ball+stick', {
            sele: '@',
            visible: true,
        }).setName(highlightName).setParameters(highlightStyle);

        this.refreshStage();

        setProps({
            activeComponentUUID: comp.uuid,
            data: {},
            numberOfComponents: this.stage.compList.length
        });
    }

    addRepresentation(type, params) {
        const { activeComponentUUID } = this.props;
        var comp = this.getComponentByUUID(activeComponentUUID);
        comp.addRepresentation(type, params);
    }

    updateRepresentations(what) {
        const { activeComponentUUID } = this.props;
        var comp = this.getComponentByUUID(activeComponentUUID);

        comp.updateRepresentations(what)
    }

    removeAllRepresentationsFromComponent() {
        const { activeComponentUUID } = this.props;
        var comp = this.getComponentByUUID(activeComponentUUID);

        comp.removeAllRepresentations()
    }

    removeComponentByUUID(uuid) {
        const {setProps} = this.props;

        function remove(comp) {
            if (comp.uuid === uuid) {
                this.stage.removeComponent(comp);
            }
        }
        this.stage.eachComponent(remove);
        setProps({
            numberOfComponents: this.stage.compList.length
        });
    }

    getComponentByUUID(uuid) {
        for (let i=0; i < this.stage.compList.length; i++) {
            let comp = this.stage.compList[i];
            if (comp.uuid === uuid) {
                return comp
            }
        }
    }

    hideAllComponents() {
        this.stage.eachComponent((comp) => {comp.setVisibility(false)})
    }

    setComponentVisibility(visible, uuid) {
        if (uuid == null) {
            uuid = this.activeComponentUUID;
        }

        this.stage.eachComponent(comp => {
            if (comp.uuid === uuid) {comp.setVisibility(visible)}
        });
    }

    updateHighlightedAtoms() {

        const { activeComponentUUID, highlightName } = this.props;
        const { highlightStyle, selectedAtomIndices } = this.props;

        const sele = '@' + selectedAtomIndices.toString();
        const comp = this.getComponentByUUID(activeComponentUUID);

        if (comp === undefined) return;
        
        for (let i=0; i<comp.reprList.length; i++) {
            let repr = comp.reprList[i];
            if (repr.name === highlightName) {
                repr.repr.selection.setString(sele, false);
                repr.setParameters(highlightStyle);
                this.refreshStage();
                return
            }
        }
    }
}

const defaultViewportStyle = {
    width: '500px',
    height: '500px',
}

const defaultStageParameters = {
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
}

const defaultHighlightStyle = {
    opacity: 0.5,
    bondScale: 1.4,
    scale: 1.4,
    colorScheme: 'uniform',
    color: '#fff'
}

const highlightStylePropShape = {
    opacity: PropTypes.number,
    bondScale: PropTypes.number,
    scale: PropTypes.number,
    colorScheme: PropTypes.string,
    color: PropTypes.string,
};


const dataPropShape = {
    filename: PropTypes.string.isRequired,
    ext: PropTypes.string,
    config: PropTypes.shape({
        type: PropTypes.string.isRequired,
        input: PropTypes.string.isRequired
    })

};

NGLComponent.defaultProps = {
    id: 'viewport',
    selectedAtomIndices: [],
    highlightName: 'highlighted',
    highlightAtomsOnClick: false,
    viewportStyle: defaultViewportStyle,
    highlightStyle: defaultHighlightStyle,
    stageParameters: defaultStageParameters,
    numberOfComponents: 0,
};

NGLComponent.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks
     */
    id: PropTypes.string,

    /**
     * Dash-assigned callback that should be called whenever any of the
     * properties change
     */
    setProps: PropTypes.func,

    /**
     * CSS styling for viewport container
     */
    viewportStyle: PropTypes.object,

    /**
     * Parameters for the stage
     */
    stageParameters: PropTypes.object,

    /**
     * File object to load into the stage
     */
    data: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.shape(dataPropShape)),
        PropTypes.shape(dataPropShape),
        PropTypes.object,
    ]),

    /**
     * UUID of the active component
     */
    activeComponentUUID: PropTypes.string,

    /**
     * Indices of the selected atoms
     */
    selectedAtomIndices: PropTypes.arrayOf(PropTypes.number),

    /**
     * Whether to highlight atoms on click
     */
    highlightAtomsOnClick: PropTypes.bool,

    /**
     * Current name for highlighted representations
     */
    highlightName: PropTypes.string,

    /**
     * Style for highlight representations
     */
    highlightStyle: PropTypes.object,

    /**
     * Number of components loaded
     */
    numberOfComponents: PropTypes.number,
};

