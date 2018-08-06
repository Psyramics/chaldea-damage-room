import React, { Component } from 'react';
import Router from 'react-router-component';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      owned: {},
      raw : {
        servants: {},
        skills: {},
        np: {},
        curves: {}
      }
    };
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
          var state = self.state || {
            raw: {}
          };
          state.raw[file] = JSON.parse(xhr.responseText);
          self.setState(state);
        }
      }
      xhr.send();
    });
  }
  
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Chaldea Damage Room</h1>
        </header>
        <ServantList servants={ this.state.raw.servants }/>
      </div>
    );
  }
}

class ServantList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      servants: [],
      selected: 0
    }
  }
  
  servantSummoned(value) {
    var servants = this.state.servants;
  }
  
  render() {
    var full = Object.values(this.props.servants);
    const names = full.map((serv) =>
      <option key={ serv.id } value={ serv.id }>{serv.name}</option>
    );
    const servant = {};
    const servantList = '';
    return (
      <div>
        <ServantSelector names={ names } summonServant={this.servantSummoned}/>
        <ul className="ServantList">
        { servantList }
        </ul>
        <ServantDetail servant={ servant } />
      </div>
    );
  }
}

class ServantDetail extends Component {
  render() {
    return (
      <div></div>
    )
  }
}

class ServantSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {value: 0};
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
