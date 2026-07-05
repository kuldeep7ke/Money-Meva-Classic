'use client';

import { useState, useEffect } from 'react';

interface MathCaptchaProps {
  onVerify: (verified: boolean) => void;
}

export default function MathCaptcha({ onVerify }: MathCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState('+');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [verified, setVerified] = useState(false);

  const generate = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setAnswer('');
    setError(false);
    setVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const n1 = Math.floor(Math.random() * 20) + 1;
    const n2 = Math.floor(Math.random() * 20) + 1;
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
  }, []);

  const getCorrectAnswer = () => {
    switch (operator) {
      case '+': return num1 + num2;
      case '-': return num1 - num2;
      case '×': return num1 * num2;
      default: return 0;
    }
  };

  const check = () => {
    const correct = getCorrectAnswer();
    if (parseInt(answer) === correct) {
      setVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Solve to confirm:</p>
      <div className="flex items-center gap-3">
        <span className="text-lg font-mono font-bold px-3 py-1 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
          {num1} {operator} {num2} = ?
        </span>
        <input
          type="number"
          value={answer}
          onChange={(e) => { setAnswer(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          className="w-24 px-3 py-2 border rounded-lg text-center"
          style={{ borderColor: error ? '#ef4444' : 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          placeholder="?"
          disabled={verified}
        />
        {!verified ? (
          <button onClick={check} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: 'var(--brand)', color: '#fff' }}>Check</button>
        ) : (
          <span className="text-sm font-medium" style={{ color: '#22c55e' }}>Verified ✓</span>
        )}
        <button onClick={generate} className="px-3 py-2 border rounded-lg text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>New</button>
      </div>
      {error && <p className="text-sm mt-2" style={{ color: '#ef4444' }}>Incorrect answer, try again</p>}
    </div>
  );
}
