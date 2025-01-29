import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Settings } from 'lucide-react';

const ChannelConfig = () => {
  const [channels, setChannels] = useState(Array(12).fill().map((_, i) => ({
    id: i + 1,
    frequency: 10,
    pulseWidth: 2,
    voltage: 0,
    current: 0,
    pulseTrain: 15,
    currentMode: false,
    numStims: 3
  })));

  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedChannels, setSelectedChannels] = useState(new Set());
  const [configGroups, setConfigGroups] = useState(new Map());

  const groupColors = [
    'bg-blue-100 border-blue-300',
    'bg-green-100 border-green-300',
    'bg-yellow-100 border-yellow-300',
    'bg-purple-100 border-purple-300',
    'bg-pink-100 border-pink-300',
    'bg-indigo-100 border-indigo-300',
  ];

  const getConfigKey = (channel) => {
    return JSON.stringify({
      frequency: channel.frequency,
      pulseWidth: channel.pulseWidth,
      voltage: channel.voltage,
      current: channel.current,
      pulseTrain: channel.pulseTrain,
      currentMode: channel.currentMode,
      numStims: channel.numStims
    });
  };

  useEffect(() => {
    const groups = new Map();
    let colorIndex = 0;
    
    channels.forEach((channel, index) => {
      const key = getConfigKey(channel);
      if (!groups.has(key)) {
        groups.set(key, {
          color: groupColors[colorIndex % groupColors.length],
          channels: []
        });
        colorIndex++;
      }
      groups.get(key).channels.push(index);
    });
    
    setConfigGroups(groups);
  }, [channels]);

  const handleChannelUpdate = (field, value) => {
    if (selectedChannel === null) return;
    
    setChannels(prevChannels => {
      const newChannels = [...prevChannels];
      selectedChannels.forEach(channelIndex => {
        newChannels[channelIndex] = {
          ...newChannels[channelIndex],
          [field]: field === 'currentMode' ? value : Number(value)
        };
      });
      return newChannels;
    });
  };

  const toggleChannelSelection = (index, event) => {
    if (event.shiftKey && selectedChannels.size > 0) {
      const lastSelected = Array.from(selectedChannels).pop();
      const start = Math.min(lastSelected, index);
      const end = Math.max(lastSelected, index);
      const newSelection = new Set(selectedChannels);
      for (let i = start; i <= end; i++) {
        newSelection.add(i);
      }
      setSelectedChannels(newSelection);
    } else if (event.ctrlKey || event.metaKey) {
      setSelectedChannels(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(index)) {
          newSelection.delete(index);
        } else {
          newSelection.add(index);
        }
        return newSelection;
      });
    } else {
      setSelectedChannels(new Set([index]));
    }
    setSelectedChannel(index);
  };

  const getChannelColor = (index) => {
    for (const [key, group] of configGroups) {
      if (group.channels.includes(index)) {
        return group.color;
      }
    }
    return 'bg-white';
  };

  const generatePythonCode = () => {
    const code = channels.map(channel => `
set_channel = ${channel.id}
channels[set_channel-1].set_frequency(${channel.frequency})
channels[set_channel-1].set_pulse_width(${channel.pulseWidth})
channels[set_channel-1].set_voltage(${channel.voltage})
channels[set_channel-1].set_current(${channel.current})
channels[set_channel-1].set_pulse_train_length(${channel.pulseTrain})
channels[set_channel-1].set_current_stimulation_mode(${channel.currentMode})
channels[set_channel-1].set_num_of_stims(${channel.numStims})
`).join('\n');
    
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    alert('Python code has been copied to clipboard!');
    console.log(code);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Channel Configuration</h1>
        <button 
          onClick={generatePythonCode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Python Code
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {channels.map((channel, index) => (
          <button
            key={channel.id}
            onClick={(e) => toggleChannelSelection(index, e)}
            className={`text-left p-2 rounded border transition-colors w-full
              ${selectedChannels.has(index) ? 'ring-2 ring-blue-500' : ''}
              ${getChannelColor(index)}
            `}
          >
            <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-1">
              <span className="font-medium text-sm">Channel {channel.id}</span>
              <span className="text-xs">{channel.currentMode ? 'Current' : 'Voltage'}</span>
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frequency:</span>
                <span>{channel.frequency} Hz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pulse Width:</span>
                <span>{channel.pulseWidth} ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{channel.currentMode ? 'Current:' : 'Voltage:'}</span>
                <span>{channel.currentMode ? `${channel.current} A` : `${channel.voltage} V`}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Train Length:</span>
                <span>{channel.pulseTrain}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Stimulations:</span>
                <span>{channel.numStims}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedChannel !== null && (
        <Card className="mt-4">
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-4 h-4" />
              {selectedChannels.size > 1 
                ? `Editing ${selectedChannels.size} Channels` 
                : `Channel ${selectedChannel + 1} Settings`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency (Hz)
                </label>
                <input
                  type="number"
                  value={channels[selectedChannel].frequency}
                  onChange={(e) => handleChannelUpdate('frequency', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pulse Width (ms)
                </label>
                <input
                  type="number"
                  value={channels[selectedChannel].pulseWidth}
                  onChange={(e) => handleChannelUpdate('pulseWidth', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {channels[selectedChannel].currentMode ? 'Current (A)' : 'Voltage (V)'}
                </label>
                <input
                  type="number"
                  step={channels[selectedChannel].currentMode ? "0.01" : "1"}
                  value={channels[selectedChannel].currentMode ? channels[selectedChannel].current : channels[selectedChannel].voltage}
                  onChange={(e) => handleChannelUpdate(channels[selectedChannel].currentMode ? 'current' : 'voltage', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Pulse Train Length
                </label>
                <input
                  type="number"
                  value={channels[selectedChannel].pulseTrain}
                  onChange={(e) => handleChannelUpdate('pulseTrain', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Number of Stimulations
                </label>
                <input
                  type="number"
                  value={channels[selectedChannel].numStims}
                  onChange={(e) => handleChannelUpdate('numStims', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={channels[selectedChannel].currentMode}
                  onChange={(e) => handleChannelUpdate('currentMode', e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium">
                  Current Mode
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChannelConfig;