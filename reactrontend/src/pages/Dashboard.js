import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, Ruler, Weight, Thermometer, Beaker,
  Plus, Minus, GitCompare, Divide, ArrowLeftRight,
  Copy, Check
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5263/api';

const UNITS = {
  length: {
    label: 'Length',
    units: ['METER', 'KILOMETER', 'CENTIMETERS', 'FEET', 'INCHES', 'YARDS'],
    toBase: { METER: 100, KILOMETER: 100000, CENTIMETERS: 1, FEET: 30.48, INCHES: 2.54, YARDS: 91.44 },
    icon: Ruler,
    color: '#00d4ff'
  },
  weight: {
    label: 'Weight / Mass',
    units: ['KILOGRAM', 'GRAM', 'POUND'],
    toBase: { KILOGRAM: 1, GRAM: 0.001, POUND: 0.453592 },
    icon: Weight,
    color: '#7b61ff'
  },
  temperature: {
    label: 'Temperature',
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    toBase: null,
    icon: Thermometer,
    color: '#ff6b6b'
  },
  volume: {
    label: 'Volume',
    units: ['LITRE', 'MILLILITRE', 'GALLON'],
    toBase: { LITRE: 1, MILLILITRE: 0.001, GALLON: 3.78541 },
    icon: Beaker,
    color: '#10b981'
  }
};

const OPERATIONS = [
  { id: 'convert', label: 'Convert', icon: ArrowLeftRight },
  { id: 'add', label: 'Add', icon: Plus },
  { id: 'subtract', label: 'Subtract', icon: Minus },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'divide', label: 'Divide', icon: Divide }
];

const Dashboard = () => {
  const { token, isGuest } = useAuth();
  const [currentCategory, setCurrentCategory] = useState('length');
  const [currentOperation, setCurrentOperation] = useState('convert');
  const [toast, setToast] = useState(null);
  
  // Convert state
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('METER');
  const [toUnit, setToUnit] = useState('CENTIMETERS');
  const [convertResult, setConvertResult] = useState(null);
  
  // Operation state
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [unit1, setUnit1] = useState('METER');
  const [unit2, setUnit2] = useState('CENTIMETERS');
  const [operationResult, setOperationResult] = useState(null);
  
  const [copied, setCopied] = useState(false);

  const currentUnits = UNITS[currentCategory];
  const CategoryIcon = currentUnits.icon;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const performLocalConvert = (val, from, to) => {
    try {
      const fromFactor = currentUnits.toBase[from];
      const toFactor = currentUnits.toBase[to];
      
      if (!fromFactor || !toFactor) {
        showToast('Invalid units for conversion', 'error');
        return;
      }
      
      const result = val * (fromFactor / toFactor);
      const pretty = parseFloat(result.toPrecision(8));
      
      setConvertResult({ value: pretty, formula: `${val} ${from} = ${pretty} ${to}` });
      showToast(isGuest ? 'Converted! (Guest mode)' : 'Converted and saved!');
    } catch (error) {
      showToast('Conversion failed', 'error');
    }
  };

  const performLocalOperation = (op, v1, u1, v2, u2) => {
    try {
      const factor1 = currentUnits.toBase[u1];
      const factor2 = currentUnits.toBase[u2];
      
      if (!factor1 || !factor2) {
        showToast('Invalid units', 'error');
        return;
      }
      
      const baseVal1 = v1 * factor1;
      const baseVal2 = v2 * factor2;
      let result;
      let formula;
      
      switch (op) {
        case 'add':
          result = (baseVal1 + baseVal2) / factor1;
          formula = `${v1} ${u1} + ${v2} ${u2}`;
          break;
        case 'subtract':
          result = (baseVal1 - baseVal2) / factor1;
          formula = `${v1} ${u1} - ${v2} ${u2}`;
          break;
        case 'divide':
          result = baseVal1 / baseVal2;
          formula = `${v1} ${u1} ÷ ${v2} ${u2}`;
          break;
        case 'compare':
          const isEqual = Math.abs(baseVal1 - baseVal2) < 0.0001;
          result = isEqual ? 'Equal' : baseVal1 > baseVal2 ? 'Greater' : 'Less';
          formula = `${v1} ${u1} vs ${v2} ${u2}`;
          break;
        default:
          return;
      }
      
      const pretty = typeof result === 'number' ? parseFloat(result.toPrecision(8)) : result;
      
      setOperationResult({ 
        value: pretty, 
        formula,
        unit: op === 'divide' || op === 'compare' ? '' : u1 
      });
      showToast(isGuest ? `${op}! (Guest mode)` : `${op} and saved!`);
    } catch (error) {
      showToast('Operation failed', 'error');
    }
  };

  const handleConvert = async () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      showToast('Please enter a valid number', 'error');
      return;
    }

    if (isGuest || !token) {
      performLocalConvert(val, fromUnit, toUnit);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/v1/quantities/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          QuantityDTO: { Value: val, Unit: fromUnit, MeasurementType: currentCategory },
          TargetUnit: toUnit
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.result || data.value || val;
        const pretty = parseFloat(result.toPrecision(8));
        
        setConvertResult({ value: pretty, formula: `${val} ${fromUnit} = ${pretty} ${toUnit}` });
        showToast('Converted and saved to history!');
      } else {
        const error = await response.text();
        showToast(error || 'Conversion failed', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const handleOperation = async () => {
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);
    if (isNaN(v1) || isNaN(v2)) {
      showToast('Please enter valid numbers', 'error');
      return;
    }

    if (isGuest || !token) {
      performLocalOperation(currentOperation, v1, unit1, v2, unit2);
      return;
    }

    try {
      let endpoint;
      let body;
      
      switch (currentOperation) {
        case 'add':
          endpoint = 'add';
          body = {
            ThisQuantityDTO: { Value: v1, Unit: unit1, MeasurementType: currentCategory },
            ThatQuantityDTO: { Value: v2, Unit: unit2, MeasurementType: currentCategory }
          };
          break;
        case 'subtract':
          endpoint = 'subtract';
          body = {
            ThisQuantityDTO: { Value: v1, Unit: unit1, MeasurementType: currentCategory },
            ThatQuantityDTO: { Value: v2, Unit: unit2, MeasurementType: currentCategory }
          };
          break;
        case 'divide':
          endpoint = 'divide';
          body = {
            ThisQuantityDTO: { Value: v1, Unit: unit1, MeasurementType: currentCategory },
            ThatQuantityDTO: { Value: v2, Unit: unit2, MeasurementType: currentCategory }
          };
          break;
        case 'compare':
          endpoint = 'compare';
          body = {
            ThisQuantityDTO: { Value: v1, Unit: unit1, MeasurementType: currentCategory },
            ThatQuantityDTO: { Value: v2, Unit: unit2, MeasurementType: currentCategory }
          };
          break;
        default:
          return;
      }

      const response = await fetch(`${API_URL}/v1/quantities/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        let result, formula;
        
        if (currentOperation === 'compare') {
          result = data.result === 1 ? 'Equal' : 'Not Equal';
          formula = `${v1} ${unit1} vs ${v2} ${unit2}`;
        } else {
          result = parseFloat(data.value?.toPrecision(8)) || data.result;
          formula = `${v1} ${unit1} ${getOpSymbol(currentOperation)} ${v2} ${unit2}`;
        }
        
        setOperationResult({ value: result, formula, unit: currentOperation === 'divide' || currentOperation === 'compare' ? '' : unit1 });
        showToast(`${currentOperation} and saved!`);
      } else {
        const error = await response.text();
        showToast(error || 'Operation failed', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    }
  };

  const getOpSymbol = (op) => {
    switch (op) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'divide': return '÷';
      default: return '';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Copied to clipboard!');
    });
  };

  return (
    <div style={{ paddingTop: '24px' }}>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Category Selection */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CategoryIcon size={20} color={currentUnits.color} />
          Select Category
        </h2>
        <div className="category-tabs">
          {Object.entries(UNITS).map(([key, data]) => {
            const Icon = data.icon;
            return (
              <button
                key={key}
                className={`category-tab ${currentCategory === key ? 'active' : ''}`}
                style={{
                  background: currentCategory === key ? `${data.color}20` : 'transparent',
                  border: `1px solid ${currentCategory === key ? data.color : 'var(--border)'}`,
                  color: currentCategory === key ? data.color : 'var(--text-secondary)'
                }}
                onClick={() => {
                  setCurrentCategory(key);
                  setFromUnit(data.units[0]);
                  setToUnit(data.units[1]);
                  setUnit1(data.units[0]);
                  setUnit2(data.units[1]);
                  setConvertResult(null);
                  setOperationResult(null);
                }}
              >
                <Icon size={16} style={{ marginRight: '8px' }} />
                {data.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operation Selection */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Select Operation</h2>
        <div className="operation-tabs">
          {OPERATIONS.map((op) => {
            const Icon = op.icon;
            return (
              <button
                key={op.id}
                className={`operation-tab ${currentOperation === op.id ? 'active' : ''}`}
                style={{
                  background: currentOperation === op.id ? 'rgba(0,212,255,0.2)' : 'transparent',
                  border: `1px solid ${currentOperation === op.id ? 'var(--accent)' : 'var(--border)'}`,
                  color: currentOperation === op.id ? 'var(--accent)' : 'var(--text-secondary)'
                }}
                onClick={() => {
                  setCurrentOperation(op.id);
                  setConvertResult(null);
                  setOperationResult(null);
                }}
              >
                <Icon size={16} style={{ marginRight: '8px' }} />
                {op.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Convert Section */}
      {currentOperation === 'convert' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Convert {currentUnits.label}</h2>
          
          <div className="converter-grid">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Value
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                From
              </label>
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                {currentUnits.units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                To
              </label>
              <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                {currentUnits.units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-accent" onClick={handleConvert} style={{ height: '44px' }}>
              <ArrowRight size={18} />
            </button>
          </div>

          {convertResult && (
            <div className="result-display">
              <button
                onClick={() => copyToClipboard(convertResult.value.toString())}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
              </button>
              <div className="result-main">{convertResult.value}</div>
              <div className="result-formula">{convertResult.formula}</div>
            </div>
          )}
        </div>
      )}

      {/* Operations Section */}
      {currentOperation !== 'convert' && (
        <div className="card">
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>
            {OPERATIONS.find(op => op.id === currentOperation)?.label} {currentUnits.label}
          </h2>
          
          <div className="converter-grid">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                First Value
              </label>
              <input
                type="number"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                placeholder="Enter value"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Unit
              </label>
              <select value={unit1} onChange={(e) => setUnit1(e.target.value)}>
                {currentUnits.units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Second Value
              </label>
              <input
                type="number"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                placeholder="Enter value"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Unit
              </label>
              <select value={unit2} onChange={(e) => setUnit2(e.target.value)}>
                {currentUnits.units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-accent" onClick={handleOperation} style={{ height: '44px' }}>
              <ArrowRight size={18} />
            </button>
          </div>

          {operationResult && (
            <div className="result-display">
              <button
                onClick={() => copyToClipboard(operationResult.value.toString())}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
              </button>
              <div className="result-main">{operationResult.value} {operationResult.unit}</div>
              <div className="result-formula">{operationResult.formula}</div>
            </div>
          )}
        </div>
      )}

      {isGuest && (
        <div style={{ 
          marginTop: '24px', 
          padding: '16px 20px', 
          background: 'rgba(0,212,255,0.05)', 
          borderRadius: '12px',
          border: '1px solid rgba(0,212,255,0.2)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            You're using guest mode.{' '}
            <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Login
            </a> or{' '}
            <a href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
              Sign up
            </a> to save your history.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
