import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import Ddragon from 'ddragon';

import './Icon.css';

export default class Icon extends Component {
  constructor(props) {
    super(props);

    this.dd = new Ddragon(
      '10.1.1', // defaults to 8.9.1
      'en_US', // defaults to en_US
      'https://ddragon.leagueoflegends.com' // defaults to https://dragon.leagueoflegends.com
    );

    this.changeIcon = this.changeIcon.bind(this);
  }

  changeIcon(event) {
    ipcRenderer.send("change-icon", this.props.icon );
    // ipcRenderer.send("change-icon", icon);
  }

  render() {
    const { icon } = this.props
    return (
      <a onClick={this.changeIcon}>
        <img className="icon" id={icon} src={ this.dd.images.profileicon(icon) } width="64px"></img>
      </a>
    )
  }
}
