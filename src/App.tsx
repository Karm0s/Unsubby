import './App.css';
import { Button } from '@nextui-org/react';
import Browser from 'webextension-polyfill';


function App() {
  const handleRunClick = () => {
    Browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      const activeTab = tabs[0];
      if (activeTab.id) {
        alert("Payload sent to content script.");
        Browser.tabs.sendMessage(activeTab.id, {type: "UnsubbyPayload", payload: "Hello there from react."})
      }
    })

  }


  return (
    <>
      <main className="text-foreground bg-background min-w-[500px] min-h-[500px] flex flex-col items-center justify-start">
        <h1 className="text-3xl mt-4 tracking-tight font-bold">unsubby</h1>
        <Button color="primary" className="font-bold mt-10" onClick={handleRunClick}>run</Button>
      </main>
    </>
  )
}

export default App
