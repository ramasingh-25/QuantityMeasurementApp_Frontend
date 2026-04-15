const units = {
  length: { units: ['Meter','Kilometer','Centimeter','Millimeter','Mile','Yard','Foot','Inch'], base: 'Meter',
    toBase: { Meter:1, Kilometer:1000, Centimeter:0.01, Millimeter:0.001, Mile:1609.34, Yard:0.9144, Foot:0.3048, Inch:0.0254 } },
  weight: { units: ['Kilogram','Gram','Milligram','Pound','Ounce','Ton'], base: 'Kilogram',
    toBase: { Kilogram:1, Gram:0.001, Milligram:0.000001, Pound:0.453592, Ounce:0.0283495, Ton:1000 } },
  temperature: { units: ['Celsius','Fahrenheit','Kelvin'], base: 'Celsius', toBase: null },
  volume: { units: ['Liter','Milliliter','CubicMeter','Gallon','Quart','Pint','Cup'], base: 'Liter',
    toBase: { Liter:1, Milliliter:0.001, CubicMeter:1000, Gallon:3.78541, Quart:0.946353, Pint:0.473176, Cup:0.236588 } }
};

let curCat = 'length';

function populateSelects(cat) {
  const from = document.getElementById('demoFrom');
  const to = document.getElementById('demoTo');
  from.innerHTML = ''; to.innerHTML = '';
  units[cat].units.forEach((u,i) => {
    from.innerHTML += `<option value="${u}">${u}</option>`;
    to.innerHTML += `<option value="${u}" ${i===1?'selected':''}>${u}</option>`;
  });
}

function switchCategory(cat, btn) {
  curCat = cat;
  document.querySelectorAll('.demo-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  populateSelects(cat);
  doConvert();
}

function doConvert() {
  const val = parseFloat(document.getElementById('demoVal').value);
  const from = document.getElementById('demoFrom').value;
  const to = document.getElementById('demoTo').value;
  if (isNaN(val)) { document.getElementById('demoResult').textContent = '—'; return; }
  let result;
  if (curCat === 'temperature') {
    let celsius;
    if (from==='Celsius') celsius=val;
    else if (from==='Fahrenheit') celsius=(val-32)*5/9;
    else celsius=val-273.15;
    if (to==='Celsius') result=celsius;
    else if (to==='Fahrenheit') result=celsius*9/5+32;
    else result=celsius+273.15;
  } else {
    const tb = units[curCat].toBase;
    const inBase = val * tb[from];
    result = inBase / tb[to];
  }
  document.getElementById('demoResult').textContent = parseFloat(result.toFixed(6));
  document.getElementById('demoResultUnit').textContent = to;
}

// Initialize the demo when page loads
document.addEventListener('DOMContentLoaded', function() {
  populateSelects('length');
  doConvert();
});
