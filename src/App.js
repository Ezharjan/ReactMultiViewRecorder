import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Recorder } from './components'
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Multicamera recorder demo
        </p>
      </header>
      <Tabs>
        <TabList>
          <Tab>Simple</Tab>
          <Tab>PiP simulation</Tab>
        </TabList>

        <TabPanel>
          <Recorder />
        </TabPanel>
        <TabPanel>
          <Recorder className="recorder-pip" />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
