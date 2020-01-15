/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import Ddragon from 'ddragon';
import Icon from './Icon';
// import { Link } from 'react-router-dom';
// import routes from '../constants/routes.json';
// import styles from './Home.css';

// type Props = {|
//   icons: Array<number>
// |};

export default class IconList extends Component {
  // props: Props;

  render() {
    const { icons } = this.props;
    const dd = new Ddragon(
      '10.1.1', // defaults to 8.9.1
      'en_US', // defaults to en_US
      'https://ddragon.leagueoflegends.com' // defaults to https://dragon.leagueoflegends.com
    );

    return (
      <ul>
        {icons.map(icon => (
          <Icon icon={icon} key={icon} dd={dd} />
        ))}
      </ul>
    );
  }
}
