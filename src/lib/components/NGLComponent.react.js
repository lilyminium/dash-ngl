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
        const { data, id, stageParameters } = this.props;
        const stage = new Stage(id, stageParameters);

        this.setState({ stage }, () => {
            if (!data) {
                return
            }


            if (Array.isArray(data)) {
                data.forEach(file => {
                    this.loadData(file);
                });
            } else {
                this.loadData(data);
            }

        });


        stage.signals.clicked.add((proxy) => {
            if (proxy) {
                this.props.setProps({ selectedAtomIndices: proxy.component.selectedAtomIndices })
            } // will proxy pass through? idk. Will indices update before clicked signal?

        })

    }

    componentDidUpdate() {
        // after updating occurs
        const { files } = this.props;

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
    }

    _loadComponent(comp) {
        const { components } = this.state;
        const atomStore = comp.structureView.structure.atomStore;

        this.props.setProps({
            activeComponentUUID: comp.uuid,
            activeCoordinates: [atomStore.x, atomStore.y, atomStore.z],
        })
        components[comp.uuid] = comp;

        comp.signals.matrixChanged.add(() => {

            this.props.setProps({
                activeComponentUUID: comp.uuid,
                activeCoordinates: [atomStore.x, atomStore.y, atomStore.z]
            })
        })

        comp.signals.trajectoryAdded.add((trajComp) => {
            trajComp.trajectory.signals.frameChanged.add(() => {
                const atomStoreT = trajComp.structure.atomStore;
                this.props.setProps({
                    activeComponentUUID: comp.uuid,
                    activeCoordinates: [atomStoreT.x, atomStoreT.y, atomStoreT.z]
                });
            });
        })

        comp.addRepresentation('ball+stick')
        comp.autoView()
    }

    loadData(data) {
        const { stage } = this.state;
        if (!data.config) {
            return
        }
        var stringBlob = new Blob([data.config.input], { type: data.config.type })
        console.log(stringBlob)
        stage.loadFile(stringBlob, { ext: data.ext }).then(comp => {
            this._loadComponent(comp)

        })

    }

    // loadFile(file) {
    //     const { stage } = this.state;

    //     if (!file.config) {
    //         stage.loadFile(file.filename, { defaultRepresentation: true }).then(comp => {
    //             this._loadComponent(comp)
    //             comp.autoView()
    //         });
    //     } else {
    //         stage.loadFile(file.filename).then(comp => {
    //             file.config.forEach(configItem => {
    //                 if (Array.isArray(configItem.input)) {
    //                     comp[configItem.type](...configItem.input);
    //                 } else {
    //                     comp[configItem.type](configItem.input);
    //                 }
    //             });

    //             // if (!file.config.some(configItem => configItem.type === 'autoView')) {
    //             //     comp.autoView();
    //             // }

    //             this._loadComponent(comp)
    //         });
    //     }
    // }

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
    ext: PropTypes.string,
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
    data: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.shape(dataPropShape)),
        PropTypes.shape(dataPropShape)
    ]),

    activeComponentUUID: PropTypes.string,

    activeCoordinates: PropTypes.arrayOf(PropTypes.array),

    selectedAtomIndices: PropTypes.arrayOf(PropTypes.number),

    picked: PropTypes.number,



};

