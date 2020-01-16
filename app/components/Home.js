import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';
import IconList from './IconList';
import Icon from './Icon';

import './App.css';

type Props = {};
type State = {|
  phase: string,
  icons: Array<number>,
  logged_in: boolean,
  summoner: {}
  // summoner: {|
  //   accountId: number,
  //   displayName: string,
  //   internalName: string,
  //   percentCompleteForNextLevel: number,
  //   profileIconId: number,
  //   puuid: string,
  //   rerollPoints: {|
  //     currentPoints: number,
  //     maxRolls: number,
  //     pointsCostToRoll: number,
  //     pointsToReroll: number
  //   |},
  //   summonerId: number,
  //   summonerLevel: number,
  //   xpSinceLastLevel: number,
  //   xpUntilNextLevel: number
  // |}
|};
const sample = arr => arr[Math.floor(Math.random() * arr.length)];
console.log("ipc: ", ipcRenderer);

export default class Home extends Component<Props, State> {
  // props: Props;
  constructor(props: Props) {
    super(props);
    this.state = {
      phase: '',
      icons: [],
      summoner: {},
      logged_in: false,
      shouldChange: true,
      lastphase: ""
    };

    console.log("ipc: ", ipcRenderer);

    ipcRenderer.removeAllListeners();
  }
  componentDidMount(props) {

    ipcRenderer.on('gameflow-phase', (event, data) => {
      // console.log('gameflow-phase', data);
      this.setState({
        phase: data
      });
      // console.log(data, this.state.shouldChange)
      let phase;
      if (data == 'WaitingForStats') phase = 1;
      else if (data == 'PreEndOfGame') phase = 2;
      else if (data == 'EndOfGame') phase = 3;
      else phase = 4;


      if ((phase < 4 && phase < this.state.lastphase) && this.state.shouldChange) {
        const { icons } = this.state;
        const newIcon = sample(icons);
        // console.log('Changing icon, ', newIcon);
        ipcRenderer.send('change-icon', newIcon);
      }
      this.setState({ lastphase: phase })
    });

    ipcRenderer.on('summoner-icon', (event, data) => {
      // console.log('summoner-icon', data);
      this.setState({
        icons: data.icons
      });
    });
    ipcRenderer.on('current-summoner', (event, summoner, method) => {
      if (!summoner) {
        console.log("No summoner received")
        return;
      }
      console.log('current-summoner', summoner);
      // console.log(summoner);
      this.setState({
        // summonerId: data.summonerId,
        // displayName: data.displayName,
        // profileIconId: data.profileIconId,
        // summonerLeve: data.summonerLevel
        summoner,
        logged_in: true
      });
      // console.log('state:', this.state);
    });

    ipcRenderer.on('log', (event, data) => {
      console.log('Electron log: ', data);
    });

    ipcRenderer.send('loaded');
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>League Icon Changer</h1>
          {/* <div className={styles.container} data-tid="container"> */}
            {/* <h2>Home</h2>
            <Link to={routes.COUNTER}>to Counter</Link> */}
            <p>Hello, {this.state.summoner.displayName}</p>
            <p>current icon:</p>
            <p>
            <Icon icon={this.state.summoner.profileIconId} key={this.state.summoner.profileIconId} />
            </p>
            {/* <p>{JSON.stringify(summoner)}</p> */}
            <p>Phase: { this.state.phase || "" }</p>
            <label>
              Automatically change icon after every game:
              <input
                name="shouldChange"
                type="checkbox"
                checked={this.state.shouldChange}
                onChange={this.handleInputChange} />
            </label>
            <p>
              Icons list:
            </p>
            <IconList icons={this.state.icons || []} />

          {/* </div> */}
        </header>
      </div>
    );
  }
}
