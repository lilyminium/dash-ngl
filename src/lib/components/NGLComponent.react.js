import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Stage} from 'ngl';

/**
 * Component for NGL.Stage
 */

export default class NGLComponent extends Component {
    constructor(props) {
        super(props);

        // bind this methods
        this.executeQueuedAction = this.executeQueuedAction.bind(this);
        this.loadData = this.loadData.bind(this);
        this.loadComponent = this.loadComponent.bind(this);
        this.updateHighlightedAtoms = this.updateHighlightedAtoms.bind(this);
        this.removeComponentByUUID = this.removeComponentByUUID.bind(this);
        this.getComponentByUUID = this.getComponentByUUID.bind(this);
    }

    render() {
        const {id, viewportStyle} = this.props;
        const style = {...defaultViewportStyle, ...viewportStyle};
        return <div id={id} style={style} />;
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
        const parameters = {...defaultStageParameters, ...stageParameters};

        const stage = new Stage(id, parameters);
        this.stage = stage;

        // add mouse events
        this.stage.viewer.container.addEventListener(
            'dragover',
            function(e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            },
            false
        );
        this.stage.viewer.container.addEventListener(
            'drop',
            this.onDrop,
            false
        );
        document.addEventListener(
            'dragover',
            function(e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'none';
            },
            false
        );
        document.addEventListener('drop', this.onDrop, false);

        this.mouse = this.stage.mouseObserver;
        this.controls = this.stage.mouseControls;

        if (this.props.highlightAtomsOnClick) {
            this.mouse.signals.clicked.add(this.onAtomClick, this);
        }

        // CSS theme
        // Don't care about CSS for now

        // Window resizing
        this.stage.handleResize();
        // FIXME hack for ie11
        setTimeout(function() {
            stage.handleResize();
        }, 500);
    }

    componentDidUpdate(prevProps) {
        const {queuedAction} = this.props;

        // execute queued action
        if (prevProps.queuedAction !== queuedAction) {
            this.executeQueuedAction(queuedAction.funcName, queuedAction.args);
        }
    }

    shouldComponentUpdate(nextProps) {
        const {data, selectedAtomIndices, activeComponentUUID} = this.props;
        const {highlightParameters, stageParameters, queuedAction} = this.props;
        const {addRepresentationParams, deleteRepresentationIndex} = this.props;
        const {highlightName} = this.props;

        // load text if it's changed
        if (nextProps.data !== data) {
            setTimeout(this.loadData(nextProps.data), 500);
        }

        // change active component
        if (nextProps.activeComponentUUID !== activeComponentUUID) {
            this.setActiveComponentByUUID(nextProps.activeComponentUUID);
        }

        // add or delete representations
        if (nextProps.addRepresentationParams !== addRepresentationParams) {
            this.addRepresentation(
                ...Object.values(nextProps.addRepresentationParams)
            );
        }

        if (nextProps.deleteRepresentationIndex !== deleteRepresentationIndex) {
            this.removeRepresentationByIndex(
                nextProps.deleteRepresentationIndex
            );
        }

        // change highlighted atoms
        if (
            nextProps.selectedAtomIndices !== selectedAtomIndices ||
            nextProps.activeComponentUUID !== activeComponentUUID ||
            nextProps.highlightParameters !== highlightParameters
        ) {
            this.updateHighlightedAtoms(
                nextProps.activeComponentUUID,
                nextProps.selectedAtomIndices,
                nextProps.highlightParameters
            );
        }

        // change highlight name
        if (nextProps.highlightName !== highlightName) {
            this.changeHighlightName(nextProps.highlightName);
        }

        // // execute queued action
        if (nextProps.queuedAction !== queuedAction) {
            return true;
            // this.executeQueuedAction(
            //     nextProps.queuedAction.funcName,
            //     nextProps.queuedAction.args
            // );
        }

        // change stage
        if (nextProps.stageParameters !== stageParameters) {
            this.stage.setParameters(nextProps.stageParameters);
            this.refreshStage();
        }

        return false;
    }

    changeHighlightName(name) {
        const {highlightName, setProps} = this.props;
        this.stage.eachRepresentation(repr => {
            if (repr.name === highlightName) {
                repr.setName(name);
            }
        });

        setProps({highlightName: name});
    }

    executeQueuedAction(funcName, args) {
        if (!funcName) return;
        this[funcName](...Object.values(args), true);
    }

    refreshStage() {
        this.stage.viewer.requestRender();
    }

    setActiveComponentByUUID(uuid) {
        const {setProps} = this.props;
        this.hideAllComponents();
        this.setComponentVisibility(true, uuid);

        const comp = this.getComponentByUUID(uuid);
        const reprs = this.getMainRepresentations(comp);

        setProps({currentRepresentationParameters: reprs});
    }

    getMainRepresentations(comp) {
        if (!comp) return [];

        const {highlightName} = this.props;
        const reprs = [];
        for (let i = 0; i < comp.reprList.length; i++) {
            let repr = comp.reprList[i];
            // if (repr.name !== highlightName) {
            let reprParams = {
                type: repr.repr.type,
                sele: repr.repr.selection.string,
                params: repr.getParameters(),
            };
            reprs.push(reprParams);
            // }
        }
        return reprs;
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
                } else {
                    newselectedAtomIndices.push(id);
                }

                setProps({selectedAtomIndices: newselectedAtomIndices});
            }
        }
    }

    loadData(data) {
        if (!data.config) {
            return;
        }
        var stringBlob = new Blob([data.config.input], {
            type: data.config.type,
        });
        this.stage.loadFile(stringBlob, {ext: data.ext}).then(comp => {
            this.loadComponent(comp);
        });
    }

    loadComponent(comp) {
        const {setProps} = this.props;
        this.hideAllComponents();
        comp.addRepresentation('ball+stick', {
            sele: 'all',
            visible: true,
        });
        this.addHighlightRepresentation(comp);
        const reprs = this.getMainRepresentations(comp);
        this.stage.autoView();

        setProps({
            activeComponentUUID: comp.uuid,
            data: {},
            numberOfComponents: this.stage.compList.length,
            currentRepresentationParameters: reprs,
        });
    }

    addHighlightRepresentation(comp) {
        const {highlightName, highlightParameters} = this.props;

        const style = {...defaultHighlightParameters, ...highlightParameters};
        // highlight representation
        comp.addRepresentation('ball+stick', {
            sele: '@',
            visible: true,
        })
            .setName(highlightName)
            .setParameters(style);

        this.refreshStage();
    }

    addRepresentation(type, params, index, suppressProps) {
        if (!type) return;

        const {activeComponentUUID, setProps} = this.props;
        const comp = this.getComponentByUUID(activeComponentUUID);
        if (!comp) return;
        const repr = comp.addRepresentation(type, params);

        // Want highlight representation last
        if (index === undefined) index = comp.reprList.length - 2;
        comp.reprList.splice(index, 0, repr);
        comp.reprList.splice(-1, 1);
        if (suppressProps) return;

        const reprs = this.getMainRepresentations(comp);
        setProps({
            addRepresentationParams: {},
            currentRepresentationParameters: reprs,
        });
    }

    removeRepresentationByName(name) {
        if (!name) return;
        const {activeComponentUUID, setProps} = this.props;
        const comp = this.getComponentByUUID(activeComponentUUID);
        if (!comp) return;

        for (let i = 0; i < comp.reprList.length; i++) {
            let repr = comp.reprList[i];
            if (repr.name === name) {
                comp.removeRepresentation(repr);
            }
        }

        this.refreshStage();

        const reprs = this.getMainRepresentations(comp);
        setProps({
            deleteRepresentationIndex: undefined,
            currentRepresentationParameters: reprs,
        });
    }

    removeRepresentationByIndex(index) {
        if (index === undefined) return;

        const {activeComponentUUID, setProps} = this.props;
        const comp = this.getComponentByUUID(activeComponentUUID);
        if (!comp) return;
        if (index <= -1 || index > comp.reprList.length) return;

        const repr = comp.reprList[index];
        comp.removeRepresentation(repr);
        this.refreshStage();

        const reprs = this.getMainRepresentations(comp);
        setProps({
            currentRepresentationParameters: reprs,
            deleteRepresentationIndex: undefined,
        });
    }

    updateRepresentationTypeByIndex(index, newType, asQueuedAction) {
        const {activeComponentUUID, setProps} = this.props;
        const comp = this.getComponentByUUID(activeComponentUUID);
        if (!comp) return;
        if (index <= -1 || index > comp.reprList.length) return;

        const repr = comp.reprList[index];
        const params = repr.getParameters();
        comp.removeRepresentation(repr);
        this.addRepresentation(newType, params, index, true);

        const reprs = this.getMainRepresentations(comp);

        if (asQueuedAction) {
            setProps({
                currentRepresentationParameters: reprs,
                queuedAction: {},
            });
        } else {
            setProps({currentRepresentationParameters: reprs});
        }
    }

    updateRepresentationParamsByIndex(index, params, asQueuedAction) {
        const {activeComponentUUID, setProps} = this.props;
        const comp = this.getComponentByUUID(activeComponentUUID);
        if (!comp) return;
        if (index <= -1 || index > comp.reprList.length) return;

        const repr = comp.reprList[index];
        if (params.sele !== undefined) {
            repr.repr.selection.setString(params.sele, false);
        }

        const newParams = repr.getParameters();
        console.log(repr.bufferList);

        const validParams = {};

        Object.keys(params).forEach(function(key) {
            if (key === 'color') {
                validParams['color'] = params[key];
                return;
            }
            if (!repr.repr.parameters[key]) return;
            validParams[key] = params[key];
        });
        console.log(validParams);
        repr.setParameters(validParams);
        this.refreshStage();

        const reprs = this.getMainRepresentations(comp);

        if (asQueuedAction) {
            setProps({
                currentRepresentationParameters: reprs,
                queuedAction: {},
            });
        } else {
            setProps({currentRepresentationParameters: reprs});
        }
    }

    updateRepresentations(params) {
        const {activeComponentUUID, setProps} = this.props;
        const comp = this.getComponentByUUID(activeComponentUUID);

        comp.updateRepresentations(params);

        const reprs = this.getMainRepresentations(comp);
        setProps({currentRepresentationParameters: reprs});
    }

    removeAllRepresentationsFromComponent() {
        const {activeComponentUUID, setProps} = this.props;
        const comp = this.getComponentByUUID(activeComponentUUID);

        comp.removeAllRepresentations();

        const reprs = this.getMainRepresentations(comp);
        setProps({currentRepresentationParameters: reprs});
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
            numberOfComponents: this.stage.compList.length,
            activeComponentUUID: undefined,
            currentRepresentationParameters: [],
        });
    }

    getComponentByUUID(uuid) {
        for (let i = 0; i < this.stage.compList.length; i++) {
            let comp = this.stage.compList[i];
            if (comp.uuid === uuid) {
                return comp;
            }
        }
    }

    hideAllComponents() {
        this.stage.eachComponent(comp => {
            comp.setVisibility(false);
        });
    }

    setComponentVisibility(visible, uuid) {
        if (uuid == null) {
            uuid = this.activeComponentUUID;
        }

        this.stage.eachComponent(comp => {
            if (comp.uuid === uuid) {
                comp.setVisibility(visible);
            }
        });
    }

    updateHighlightedAtoms(uuid, indices, highlightParameters) {
        const {highlightName} = this.props;

        const sele = '@' + indices.toString();
        const comp = this.getComponentByUUID(uuid);

        if (comp === undefined) return;

        for (let i = 0; i < comp.reprList.length; i++) {
            let repr = comp.reprList[i];
            if (repr.name === highlightName) {
                repr.repr.selection.setString(sele, false);
                repr.setParameters(highlightParameters);
                this.refreshStage();
            }
        }
    }
}

// ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
// ║          Default settings          ║
// ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

const defaultViewportStyle = {
    width: '500px',
    height: '500px',
};

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
    mousePreset: 'default',
};

const defaultHighlightParameters = {
    opacity: 0.5,
    bondScale: 1.4,
    scale: 1.4,
    colorScheme: 'uniform',
    color: '#fff',
};

// ╔═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╗
// ║            Prop shapes             ║
// ╚═══*.·:·.☽✧  ✦  ✦  ✦  ✦  ✧☾.·:·.*═══╝

const dataPropShape = {
    filename: PropTypes.string.isRequired,
    ext: PropTypes.string,
    config: PropTypes.shape({
        type: PropTypes.string.isRequired,
        input: PropTypes.string.isRequired,
    }),
};

const reprParamPropShape = {
    type: PropTypes.string.isRequired,
    params: PropTypes.object,
};

NGLComponent.defaultProps = {
    id: 'viewport',
    selectedAtomIndices: [],
    highlightName: 'highlighted',
    highlightAtomsOnClick: false,
    viewportStyle: defaultViewportStyle,
    highlightParameters: defaultHighlightParameters,
    stageParameters: defaultStageParameters,
    numberOfComponents: 0,
    queuedAction: {},
    currentRepresentationParameters: [],
    addRepresentationParams: {},
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
    highlightParameters: PropTypes.object,

    /**
     * Number of components loaded
     */
    numberOfComponents: PropTypes.number,

    /**
     * Action to take
     */
    queuedAction: PropTypes.object,

    /**
     * Representation parameters of active component
     */
    currentRepresentationParameters: PropTypes.arrayOf(
        PropTypes.shape(reprParamPropShape)
    ),

    /**
     * Representation to add
     */
    addRepresentationParams: PropTypes.oneOfType([
        PropTypes.shape(reprParamPropShape),
        PropTypes.object,
    ]),
    /**
     * Representation to delete
     */
    deleteRepresentationIndex: PropTypes.number,
};
