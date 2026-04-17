import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Ruler, Weight, Thermometer, Beaker, Calculator, History } from 'lucide-react';

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

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const [currentCategory, setCurrentCategory] = useState('length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('METER');
  const [toUnit, setToUnit] = useState('CENTIMETERS');
  const [result, setResult] = useState(null);

  const currentUnits = UNITS[currentCategory];
  const CategoryIcon = currentUnits.icon;

  const handleConvert = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return;

    if (currentCategory === 'temperature') {
      let res = val;
      if (fromUnit === toUnit) {
        res = val;
      } else if (fromUnit === 'Celsius') {
        if (toUnit === 'Fahrenheit') res = (val * 9/5) + 32;
        else if (toUnit === 'Kelvin') res = val + 273.15;
      } else if (fromUnit === 'Fahrenheit') {
        if (toUnit === 'Celsius') res = (val - 32) * 5/9;
        else if (toUnit === 'Kelvin') res = (val - 32) * 5/9 + 273.15;
      } else if (fromUnit === 'Kelvin') {
        if (toUnit === 'Celsius') res = val - 273.15;
        else if (toUnit === 'Fahrenheit') res = (val - 273.15) * 9/5 + 32;
      }
      setResult(parseFloat(res.toPrecision(8)));
    } else {
      const fromFactor = currentUnits.toBase[fromUnit];
      const toFactor = currentUnits.toBase[toUnit];
      if (!fromFactor || !toFactor) return;
      const res = val * (fromFactor / toFactor);
      setResult(parseFloat(res.toPrecision(8)));
    }
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div style={{ paddingTop: '40px' }}>
      {/* Hero Section */}
      <div className="card" style={{ marginBottom: '32px', textAlign: 'center', padding: '60px 40px' }}>
        <h1 style={{ fontSize: '42px', marginBottom: '16px', background: 'linear-gradient(135deg, #f90909, #00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Universal Unit Converter
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 32px' }}>
          Convert between different measurement units with precision and ease. Length, weight, temperature, volume, and more.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn btn-accent">
            <Calculator size={18} style={{ marginRight: '8px' }} />
            Start Converting
            <ArrowRight size={18} style={{ marginLeft: '8px' }} />
          </Link>
          {isAuthenticated ? (
            <Link to="/history" className="btn btn-ghost">
              <History size={18} style={{ marginRight: '8px' }} />
              View History
            </Link>
          ) : (
            <Link to="/signup" className="btn btn-ghost">
              Create Account
            </Link>
          )}
        </div>
      </div>

      {/* Quick Converter */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CategoryIcon size={24} color={currentUnits.color} />
          Quick Convert
        </h2>

        {/* Category Tabs */}
        <div className="category-tabs">
          {Object.entries(UNITS).map(([key, data]) => {
            const Icon = data.icon;
            return (
              <button
                key={key}
                className={`category-tab ${currentCategory === key ? 'active' : ''}`}
                style={{
                  background: currentCategory === key ? hexToRgba(data.color, 0.2) : 'transparent',
                  border: `1px solid ${currentCategory === key ? data.color : 'var(--border)'}`,
                  color: currentCategory === key ? data.color : 'var(--text-secondary)'
                }}
                onClick={() => {
                  setCurrentCategory(key);
                  setFromUnit(data.units[0]);
                  setToUnit(data.units[1]);
                  setResult(null);
                }}
              >
                <Icon size={16} style={{ marginRight: '8px' }} />
                {data.label}
              </button>
            );
          })}
        </div>

        {/* Converter Input */}
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

        {/* Result */}
        {result !== null && (
          <div className="result-display">
            <div className="result-main">{result}</div>
            <div className="result-formula">{inputValue} {fromUnit} = {result} {toUnit}</div>
          </div>
        )}
      </div>

      {/* Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        {Object.entries(UNITS).map(([key, data]) => {
          const Icon = data.icon;
          return (
            <div key={key} className="card feature-card" style={{ borderColor: hexToRgba(data.color, 0.3) }}>
              <div className="feature-icon">
                <Icon size={24} color={data.color} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{data.label}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {data.units.join(', ')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Landing;
