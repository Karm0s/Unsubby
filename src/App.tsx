import './App.css';
import { Button } from '@nextui-org/react';

function App() {
  const handleRunClick = (event) => {
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
