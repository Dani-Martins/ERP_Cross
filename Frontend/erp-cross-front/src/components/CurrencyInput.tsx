import { useState, useEffect, useRef } from 'react';
import '../pages/PaisesPage.css';

interface Props {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Input monetário em Real brasileiro.
 * Exibe "R$ 1.234,56" mas entrega/recebe number (1234.56).
 */
export default function CurrencyInput({ id, value, onChange, placeholder = 'R$ 0,00', disabled }: Props) {
  const [display, setDisplay] = useState('');
  const skipFormat = useRef(false);

  // Formata number → "R$ 1.234,56"
  function fmt(n: number): string {
    if (n === 0) return '';
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  useEffect(() => {
    if (!skipFormat.current) {
      setDisplay(fmt(value));
    }
    skipFormat.current = false;
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Mantém apenas dígitos
    const digits = raw.replace(/\D/g, '');
    if (digits === '') {
      skipFormat.current = true;
      setDisplay('');
      onChange(0);
      return;
    }
    const numeric = parseInt(digits, 10) / 100;
    const formatted = numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    skipFormat.current = true;
    setDisplay(formatted);
    onChange(numeric);
  }

  function handleBlur() {
    if (value > 0) {
      setDisplay(fmt(value));
    } else {
      setDisplay('');
    }
  }

  function handleFocus() {
    if (value === 0) setDisplay('');
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      autoComplete="off"
    />
  );
}
