import React, { Component } from 'react';
import FileUpload from './FileUpload';
import Child1 from './Child1';

class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  set_data = (data) => {
    //console.log(data)
    this.setState({ data: data });
    //console.log(this.state.data)
  }

  render(){
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className='parent'>
          <Child1 data={this.state.data}></Child1>
        </div>
      </div>
    );
  }
}

export default App;
