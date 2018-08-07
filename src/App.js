import React, { Component } from 'react';
import Router from 'react-router-component';
import './App.css';

var raw = {};

class ServantModel {
  defaults = {
    level: 1,
    fouhp: 0,
    fouatk: 0,
    nplvl: 1,
    npstr: 0,
    skill1lvl: 1,
    skill1str: 0,
    skill2lvl: 1,
    skill2str: 0,
    skill3lvl: 1,
    skill3str: 0,
  };
  constructor(raw) {
    this.raw = raw;
    for (var k in this.defaults) {
      if (this.defaults.hasOwnProperty(k)) {
        this[k] = this.defaults[k];
      }
    }
  }
  
  hp() {
    var curve = raw.curves[this.raw.expCurve],
      modifier = curve[this.level];
      
    return Math.floor(this.raw.hpBase + (this.raw.hpMax - this.raw.hpBase) * modifier / 1000) + this.fouhp;
  }
  
  atk() {
    var curve = raw.curves[this.raw.expCurve],
      modifier = curve[this.level];
      
    return Math.floor(this.raw.atkBase + (this.raw.atkMax - this.raw.atkBase) * modifier / 1000) + this.fouatk;
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      servants: [],
      detail: -1,
      raw : {
        servants: {},
        skills: {},
        nps: {}
      }
    };
    
    this.servantSummoned = this.servantSummoned.bind(this);
    this.selectServ = this.selectServ.bind(this);
    this.servantChanged = this.servantChanged.bind(this);
  }
  
  componentDidMount() {
    var self = this;
    
    var files = [
      'servants',
      'skills',
      'nps',
      'curves'
    ];
    files.forEach(function (file) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/'+file+'.json', true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          raw[file] = JSON.parse(xhr.responseText);
          console.log(raw);
          var state = self.state;
          state.raw[file] = raw[file];
          self.setState(state);
        }
      }
      xhr.send();
    });
  }
  
  servantSummoned(value) {
    var servants = this.state.servants;
    var allServs = this.state.raw.servants;
    if (servants[value] === undefined) {
      servants[value] = new ServantModel(allServs[value]);
    }
    this.setState({servants: servants});
  }
  
  selectServ(e) {
    var serv = e.target.attributes['data-serv-id'].value;
    console.log(serv);
    this.setState({detail: serv});
    console.log(this.state);
  }
  
  servantChanged (prop, val) {
    console.log(val);
    var servants = this.state.servants;
    servants[this.state.detail][prop] = parseInt(val);
    this.setState({servants: servants});
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chaldea Damage Room</h1>
        </header>
        <ServantList allServants={ this.state.raw.servants } summoned={ this.state.servants } servantSummoned={ this.servantSummoned } servantSelected={ this.selectServ }/>
        <ServantDetail servant={ this.state.servants[this.state.detail] || {} } onServantStatChanged={ this.servantChanged }/>
      </div>
    );
  }
}

class ServantList extends Component {
  
  render() {
    var full = Object.values(this.props.allServants);
    const names = full.map((serv) =>
      <option key={ serv.id } value={ serv.id }>{serv.name}</option>
    );
    const servantList = this.props.summoned.map((serv) => 
      <li key={ serv.raw.id } data-serv-id={ serv.raw.id } onClick={ this.props.servantSelected }>{ serv.raw.name }</li>
    );
    return (
      <div className="sidebar">
        <ServantSelector names={ names } summonServant={this.props.servantSummoned}/>
        <ul className="ServantList">
        { servantList }
        </ul>
      </div>
    );
  }
}

class ServantDetail extends Component {
  constructor(props) {
    super(props);
    
    this.changeLevel = this.changeProp.bind(this, 'level');
    this.changeFouHP = this.changeProp.bind(this, 'fouhp');
    this.changeFouATK = this.changeProp.bind(this, 'fouatk');
    this.changeNpLevel = this.changeProp.bind(this, 'nplvl');
  }
  
  
  changeProp(prop, e) {
    this.props.onServantStatChanged(prop, e.target.value);
  }
  
  selectablePower(prop) {
    const vals = this.props.servant.raw[prop.replace('str', '')];
    const str = vals[0];
    
    if (vals.length == 1) {
      return (<span>{ str }</span>);
    }
    else {
      const names = vals.map((n, i) => <option key={n} value={i}>{n}</option>);
      return (
        <select name={ prop }> (names) </select>
      )
    }
  }
  
  render() {
    if (this.props.servant instanceof ServantModel) {
      return (
        <div className="detail">
          <div className="stats">
            <h2 className="servantName">{ this.props.servant.raw.name }</h2>
            <div className="class">{ this.props.servant.raw.className }</div>
            <div className="level">{this.props.servant.level } <input type="range" min="1" max="100" onChange={ this.changeLevel } value={ this.props.servant.level }/></div>
            <div className="hp">HP: { this.props.servant.hp() } Fou: { this.props.servant.fouhp }<input type="range" min="0" max="990" step="10" onChange={ this.changeFouHP } value={ this.props.servant.fouhp } /> </div>
            <div className="atk">Atk: { this.props.servant.atk() } Fou: { this.props.servant.fouatk }<input type="range" min="0" max="990" step="10" onChange={ this.changeFouATK } value={ this.props.servant.fouatk } /> </div>
            <div className="np">
              { this.selectablePower("npstr") } <br />
              NP Level: { this.props.servant.nplvl } <input type="range" min="1" max="5" onChange={ this.changeNpLevel } value={ this.props.servant.nplvl } />
            </div>
            <div className="skillList">
              <div className="skill">{ this.selectablePower("skill1str") }</div>
              <div className="skill">{ this.selectablePower("skill2str") }</div>
              <div className="skill">{ this.selectablePower("skill3str") }</div>
            </div>
          </div>
          <div className="numbers">
          </div>
        </div>
      )
    }
    else {
      return (
        <div className="detail"></div>
      )
    }
  }
}

class ServantSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {value: 0};
    
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleChange(e) {
    e.preventDefault();
    this.setState({value: e.target.value});
  }
  
  handleClick(e) {
    e.preventDefault();
    if (this.state.value) {
      this.props.summonServant(this.state.value);
    }
  }
  
  render() {
    return (
      <div>
        <select name="addServantSelect" onChange={this.handleChange}>
          <option selected disabled value> -- select a servant -- </option>
          { this.props.names }
        </select>
        <button onClick={this.handleClick}>Summon</button>
      </div>
    );
  }
}

export default App;
