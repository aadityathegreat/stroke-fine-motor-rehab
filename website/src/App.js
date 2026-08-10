import React, { useState, useEffect } from 'react';

const App = () => {
  // State for navigation
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for Arduino connection and sensor data
  const [arduinoConnected, setArduinoConnected] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [connecting, setConnecting] = useState(false);
  
  // State for form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial call
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Simulate sensor data for demo purposes
  useEffect(() => {
    if (currentPage === 'demo' && arduinoConnected) {
      const interval = setInterval(() => {
        setSensorData(prev => {
          // Simulate new data point
          const newData = [...prev];
          newData.push({
            time: Date.now(),
            value: Math.floor(Math.random() * 1024) // Simulate 0-1023 sensor value
          });
          // Keep only last 50 points
          if (newData.length > 50) newData.shift();
          return newData;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentPage, arduinoConnected]);

  // Toggle menu for mobile view
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Connect to Arduino (placeholder for WebSerial/WebUSB implementation)
  const connectArduino = async () => {
    setConnecting(true);
    try {
      // Placeholder for actual WebSerial/WebUSB implementation
      // This would typically involve navigator.serial.requestPort()
      console.log('Connecting to Arduino...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate connection
      setArduinoConnected(true);
      setConnecting(false);
      alert('Successfully connected to Arduino!');
    } catch (error) {
      console.error('Error connecting to Arduino:', error);
      setConnecting(false);
      alert('Failed to connect to Arduino. Please check your device and try again.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would submit to Netlify Form or GitHub Action
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  // Render different pages
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'demo':
        return (
          <DemoPage 
            arduinoConnected={arduinoConnected}
            connectArduino={connectArduino}
            connecting={connecting}
            sensorData={sensorData}
          />
        );
      case 'docs':
        return <DocsPage />;
      case 'contact':
        return <ContactPage formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} />;
      default:
        return <HomePage />;
    }
  };

  // Component for the homepage
  const HomePage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block text-blue-500">Bring Your Arduino to Life</span>
          <span className="block text-green-500">Real-Time Force Data in Your Browser</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Connect your Arduino with our force sensor sketch to visualize hand strength and dexterity in real-time.
        </p>
        <div className="mt-10 flex justify-center">
          <a
            href="#demo"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Get Started: Connect & Plot
          </a>
        </div>
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Research Overview</h3>
                  <p className="mt-2 text-sm text-gray-500">Learn about stroke-related fine-motor challenges and our piano-based assessment approach.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Live Data Visualizer</h3>
                  <p className="mt-2 text-sm text-gray-500">Connect your Arduino and see real-time force sensor data visualized in interactive charts.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Documentation & Tutorials</h3>
                  <p className="mt-2 text-sm text-gray-500">Step-by-step guides for wiring, setup, and running the code in your browser.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-12 md:px-12 md:py-16">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Join Our Community
                </h2>
                <p className="mt-3 max-w-3xl text-lg text-blue-100">
                  Stay updated with our latest developments and research findings.
                </p>
              </div>
              <div className="mt-8 lg:mt-0">
                <form className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-700 focus:ring-white sm:max-w-xs rounded-md"
                    placeholder="Enter your email"
                  />
                  <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-blue-50"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
                <p className="mt-3 text-sm text-blue-100">
                  We care about the protection of your data. Read our{' '}
                  <a href="#" className="text-white font-medium underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Component for the About page
  const AboutPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Understanding Stroke and Fine-Motor Challenges
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          How our piano-based assessment paradigm helps stroke patients regain hand function
        </p>
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">The Impact of Stroke</h3>
              <p className="mt-2 text-gray-500">
                Stroke is a leading cause of disability worldwide, often resulting in impaired motor function.
                Fine motor skills - the ability to make precise movements with the hands and fingers - are particularly vulnerable.
                Recovery can be slow and frustrating, requiring consistent, measurable practice to rebuild neural pathways.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Our Piano-Based Approach</h3>
              <p className="mt-2 text-gray-500">
                Our innovative solution uses piano keys equipped with force sensors to create an engaging rehabilitation experience.
                By measuring finger strength and dexterity during play, we can track progress over time while making therapy feel like practice.
                The data collected provides valuable insights for both patients and healthcare professionals.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="bg-blue-50 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img src="https://picsum.photos/id/1015/600/400" alt="Piano hand exercise" className="rounded-lg shadow-md" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Attach force sensors to piano keys</li>
                <li>Play simple melodies or exercises</li>
                <li>Measure finger pressure and timing</li>
                <li>Visualize progress over time</li>
                <li>Adjust therapy based on data insights</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Component for the Demo page
  const DemoPage = ({ arduinoConnected, connectArduino, connecting, sensorData }) => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Live Data Visualization
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Connect your Arduino to see real-time force sensor data
          </p>
        </div>

        <div className="mt-12 bg-white shadow rounded-lg p-6">
          <div className="flex flex-col items-center justify-center">
            {!arduinoConnected ? (
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Arduino Connected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connect your Arduino to start receiving data.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={connectArduino}
                    disabled={connecting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      connecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {connecting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      'Connect Arduino'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="ml-2 text-green-700 font-medium">Arduino Connected</span>
                  </div>
                  <button
                    onClick={() => setArduinoConnected(false)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="h-64 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Force Sensor Data</h4>
                  <div className="h-full flex items-center justify-center">
                    {sensorData.length > 0 ? (
                      <div className="w-full h-full">
                        <canvas id="sensorChart" width="100%" height="100%"></canvas>
                        <div className="mt-2 text-sm text-gray-500 text-center">
                          Last reading: {sensorData[sensorData.length - 1].value} (at {new Date(sensorData[sensorData.length - 1].time).toLocaleTimeString()})
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        Waiting for data...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h2>
          <ol className="space-y-4">
            <li className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Connect Your Arduino</h3>
                <p className="mt-1 text-gray-600">Use a USB cable to connect your Arduino to your computer.</p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Upload the Sketch</h3>
                <p className="mt-1 text-gray-600">Make sure the force_sensor.ino sketch is uploaded to your Arduino.</p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white">
                  3
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Start the Demo</h3>
                <p className="mt-1 text-gray-600">Click "Connect Arduino" above to begin receiving data.</p>
              </div>
            </li>
            <li className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white">
                  4
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Interact with the Sensor</h3>
                <p className="mt-1 text-gray-600">Apply pressure to the force sensor to see the data update in real-time.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    );
  };

  // Component for the Documentation page
  const DocsPage = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Documentation & Tutorials
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Step-by-step guides for setting up your Arduino and running the demo
        </p>
      </div>

      <div className="mt-12 space-y-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="prose max-w-none">
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>
                <strong>Hardware Requirements:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Arduino Uno (or compatible board)</li>
                  <li>Force-sensitive resistor (FSR)</li>
                  <li>Resistor (10kΩ)</li>
                  <li>Jumper wires</li>
                  <li>Breadboard</li>
                </ul>
              </li>
              <li>
                <strong>Software Requirements:</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Arduino IDE (for uploading the sketch)</li>
                  <li>Modern web browser (Chrome recommended for WebSerial support)</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Wiring Diagram</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img src="https://picsum.photos/id/1011/600/400" alt="Wiring diagram" className="rounded-lg shadow-md" />
            </div>
            <div>
              <p className="text-gray-700 mb-4">
                Connect your force-sensitive resistor (FSR) to your Arduino as shown in the diagram:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Connect one side of the FSR to 5V power</li>
                <li>Connect the other side of the FSR to analog input pin A0</li>
                <li>Connect a 10kΩ resistor between A0 and GND</li>
              </ol>
              <p className="text-gray-700 mt-4">
                This creates a voltage divider circuit, allowing the Arduino to measure changes in resistance as pressure is applied to the FSR.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploading the Sketch</h2>
          <div className="prose max-w-none">
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>
                <strong>Open the Arduino IDE</strong>
                <p className="mt-2">If you haven't already, download and install the Arduino IDE from <a href="https://www.arduino.cc/en/software" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">arduino.cc</a>.</p>
              </li>
              <li>
                <strong>Connect your Arduino</strong>
                <p className="mt-2">Use a USB cable to connect your Arduino to your computer. The built-in LED should light up to indicate power.</p>
              </li>
              <li>
                <strong>Select your board and port</strong>
                <p className="mt-2">In the Arduino IDE, go to Tools > Board and select your Arduino model. Then go to Tools > Port and select the appropriate COM port.</p>
              </li>
              <li>
                <strong>Load and upload the sketch</strong>
                <p className="mt-2">Open the force_sensor.ino file, then click the Upload button (right arrow) in the IDE toolbar. Wait for the upload to complete successfully.</p>
              </li>
            </ol>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Running the Web Demo</h2>
          <div className="prose max-w-none">
            <ol className="list-decimal list-inside space-y-4 text-gray-700">
              <li>
                <strong>Navigate to the demo page</strong>
                <p className="mt-2">Go to the Live Data Visualization page in this website.</p>
              </li>
              <li>
                <strong>Connect to your Arduino</strong>
                <p className="mt-2">Click the "Connect Arduino" button. Your browser will prompt you to select a serial port - choose the one corresponding to your Arduino.</p>
              </li>
              <li>
                <strong>Start sensing</strong>
                <p className="mt-2">Apply pressure to the FSR and observe the real-time data updates in the chart.</p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  // Component for the Contact page
  const ContactPage = ({ formData, handleInputChange, handleSubmit }) => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Contact & Updates
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Questions or want to stay updated on our progress?
        </p>
      </div>

      <div className="mt-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                    placeholder="How can we help?"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                    placeholder="Your message..."
                    required
                  ></textarea>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscribe for Updates</h2>
            <div className="space-y-6">
              <p className="text-gray-700">
                Want to receive updates about our project's progress, new features, or research findings? Sign up for our newsletter below.
              </p>
              
              <form className="space-y-4">
                <div>
                  <label htmlFor="subscribe-email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="subscribe-email"
                      name="subscribe-email"
                      type="email"
                      autoComplete="email"
                      className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Subscribe
                  </button>
                </div>
              </form>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-2">
                <span className="text-xl font-bold text-gray-900">Stroke Rehab</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:block">
              <div className="flex items-center space-x-8">
                <a href="#home" className={`text-sm font-medium ${currentPage === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}> 
                  Home
                </a>
                <a href="#about" className={`text-sm font-medium ${currentPage === 'about' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                  About
                </a>
                <a href="#demo" className={`text-sm font-medium ${currentPage === 'demo' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                  Demo
                </a>
                <a href="#docs" className={`text-sm font-medium ${currentPage === 'docs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                  Docs
                </a>
                <a href="#contact" className={`text-sm font-medium ${currentPage === 'contact' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
                  Contact
                </a>
              </div>
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#home"
                className={`block px-3 py-2 rounded-md text-base font-medium ${currentPage === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Home
              </a>
              <a
                href="#about"
                className={`block px-3 py-2 rounded-md text-base font-medium ${currentPage === 'about' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                About
              </a>
              <a
                href="#demo"
                className={`block px-3 py-2 rounded-md text-base font-medium ${currentPage === 'demo' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Demo
              </a>
              <a
                href="#docs"
                className={`block px-3 py-2 rounded-md text-base font-medium ${currentPage === 'docs' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Docs
              </a>
              <a
                href="#contact"
                className={`block px-3 py-2 rounded-md text-base font-medium ${currentPage === 'contact' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main>
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                About
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#about" className="text-base text-gray-500 hover:text-gray-900">
                    Stroke Rehabilitation
                  </a>
                </li>
                <li>
                  <a href="#demo" className="text-base text-gray-500 hover:text-gray-900">
                    Arduino Integration
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                Resources
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#docs" className="text-base text-gray-500 hover:text-gray-900">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#demo" className="text-base text-gray-500 hover:text-gray-900">
                    Live Demo
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                Legal
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                Connect
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-base text-gray-500 hover:text-gray-900">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2023 Stroke Fine Motor Rehab Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
