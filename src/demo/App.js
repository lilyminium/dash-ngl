/* eslint no-magic-numbers: 0 */
import React, { Component } from 'react';

import { NGLComponent } from '../lib';

class App extends Component {

    constructor() {
        super();
        this.state = {
        };
        this.setProps = this.setProps.bind(this);
    }

    setProps(newProps) {
        this.setState(newProps);
    }

    render() {
        return (
            <div>
                <NGLComponent />
            </div>
        )
    }
}

export default App;
