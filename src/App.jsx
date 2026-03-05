import { useState, useEffect, useRef } from 'react';
import './App.css';

// Вспомогательная функция SHA256 (упрощенная для примера или импортируйте библиотеку)
const sha256 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

function App() {
  const [key, setKey] = useState(localStorage.getItem('sec_key') || '');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copyText, setCopyText] = useState('Copy');
  
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const alphabet = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzАаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя0123456789';

  const autoResize = (target) => {
    if (target) {
      target.style.height = 'auto';
      target.style.height = (target.scrollHeight - 4) + 'px';
    }
  };

  useEffect(() => {
    localStorage.setItem('sec_key', key);
  }, [key]);

  const getShuffledAlpha = async (isDecode = false) => {
    const hash = await sha256(key);
    const seed = parseInt(hash.substring(0, 8), 16);
    
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    let rand = seed;
    
    const indices = [...Array(alphabet.length).keys()];
    for (let i = alphabet.length - 1; i > 0; i--) {
      rand = (a * rand + c) % m;
      const j = Math.floor(rand / m * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    return indices.map(i => alphabet[i]).join('');
  };

  const handleProcess = async (type) => {
    const shuffled = await getShuffledAlpha();
    let result = '';
    const source = type === 'encode' ? alphabet : shuffled;
    const target = type === 'encode' ? shuffled : alphabet;

    for (let char of input) {
      const idx = source.indexOf(char);
      result += idx !== -1 ? target[idx] : char;
    }
    
    setOutput(result);
    setTimeout(() => {
      autoResize(inputRef.current);
      autoResize(outputRef.current);
    }, 0);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopyText('Текст скопирован!');
    setTimeout(() => setCopyText('Copy'), 1000);
  };

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="form">
            <h1>HACK TEXT HERE</h1>
            <div className="list">
              <input 
                type="text" 
                placeholder="Ключ шифрования" 
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button className="btn" onClick={() => handleProcess('encode')}>ENCODE</button>
              <button className="btn" onClick={() => handleProcess('decode')}>DECODE</button>
              
              <textarea 
                ref={inputRef}
                className="textarea" 
                placeholder="Входные данные"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  autoResize(e.target);
                }}
              />
              <button className="btn" onClick={handlePaste}>Paste</button>
              
              <textarea 
                ref={outputRef}
                className="textarea" 
                placeholder="Выходные данные" 
                value={output}
                readOnly
              />
              <button className="btn" onClick={handleCopy}>{copyText}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;