import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Stage } from 'ngl';

export default class NGLComponent extends Component {

    constructor(props) {
        // first step
        super(props);
        this.state = {
            stage: null,
            components: {},
        }
    }

    render() {
        // second step
        const { id, viewportStyle } = this.props;
        // const style = {};
        const style = { ...defaultViewportStyle, ...viewportStyle };

        return (
            <div id={id} style={style} />
        );
    }

    handleClick() {
        // for picking and selection events
    }

    handleDrag() {
        // for moving atoms
    }

    componentDidMount() {
        // third step
        const { files, id, stageParameters } = this.props;
        const stage = new Stage(id, stageParameters);

        this.setState({ stage })

        if (!files) {
            return
        }

        if (Array.isArray(files)) {
            files.forEach(file => {
                this.loadFile(file);
            });
        } else {
            this.loadFile(files);
        }

        stage.signals.clicked.add((proxy) => { // will proxy pass through? idk. Will indices update before clicked signal?
            this.setProps({ selectedAtomIndices: proxy.component.selectedAtomIndices })
        })

    }

    componentDidUpdate() {
        // after updating occurs
    }

    _loadComponent(comp) {
        const { components } = this.state;

        this.setProps({
            activeComponentUUID: comp.uuid,
            activeCoordinates: comp.matrix
        })
        components[comp.uuid] = comp;

        comp.signals.matrixChanged.add(() => {
            this.setProps({
                activeComponentUUID: comp.uuid,
                activeCoordinates: comp.matrix
            })
        })

        comp.signals.trajectoryAdded.add((trajComp) => {
            trajComp.trajectory.signals.frameChanged.add(() => this.setProps({
                activeComponentUUID: comp.uuid,
                activeCoordinates: comp.matrix
            })
            )
        })
    }

    loadFile(file) {
        const { stage } = this.state;

        if (!file.config) {
            stage.loadFile(file.filename, { defaultRepresentation: true }).then(comp => {
                this._loadComponent(comp)
            });
        } else {
            stage.loadFile(file.filename).then(comp => {
                file.config.forEach(configItem => {
                    if (Array.isArray(configItem.input)) {
                        comp[configItem.type](...configItem.input);
                    } else {
                        comp[configItem.type](configItem.input);
                    }
                });

                if (!file.config.some(configItem => configItem.type === 'autoView')) {
                    comp.autoView();
                }

                this._loadComponent(comp)
            });
        }
    }

    addRepresentation(repr, params = {}, hidden = false, componentName = undefined) {
        const { components, activeComponent } = this.state;
        var component
        if (components.hasOwnProperty(componentName)) {
            component = components[componentName];
        } else {
            component = activeComponent;
        }

        component.addRepresentation(repr, params, hidden)
    }

    clearRepresentations(componentName = undefined) {
        const { components, activeComponent } = this.state;
        var component
        if (components.hasOwnProperty(componentName)) {
            component = components[componentName];
        } else {
            component = activeComponent;
        }

        component.removeAllRepresentations();
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

NGLComponent.defaultProps = {
    id: 'viewport',
    viewportStyle: defaultViewportStyle,
    stageParameters: defaultStageParameters
};

const dataPropShape = {
    filename: PropTypes.string.isRequired,
    config: PropTypes.arrayOf(
        PropTypes.shape({
            type: PropTypes.string.isRequired,
            input: PropTypes.oneOfType([
                PropTypes.array,
                PropTypes.object,
                PropTypes.string
            ])
        })
    )
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
     * Custom properties
     */
    viewportStyle: PropTypes.object,
    stageParameters: PropTypes.object,
    files: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.shape(dataPropShape)),
        PropTypes.shape(dataPropShape)
    ]),

    activeComponentUUID: PropTypes.string,

    activeCoordinates: PropTypes.arrayOf(PropTypes.array),

    selectedAtomIndices: PropTypes.arrayOf(PropTypes.number),

    picked: PropTypes.number,



};

