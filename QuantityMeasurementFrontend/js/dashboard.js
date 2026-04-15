const API = 'http://localhost:5263/api';

// ── Unit data ──
const UNITS = {
  length: {
    label: 'Length',
    units: ['METER','KILOMETER','CENTIMETERS','FEET','INCHES','YARDS'],
    toBase: { METER:100, KILOMETER:100000, CENTIMETERS:1, FEET:30.48, INCHES:2.54, YARDS:91.44 }
  },
  weight: {
    label: 'Weight / Mass',
    units: ['KILOGRAM','GRAM','POUND'],
    toBase: { KILOGRAM:1, GRAM:0.001, POUND:0.453592 }
  },
  temperature: {
    label: 'Temperature',
    units: ['Celsius','Fahrenheit','Kelvin'],
    toBase: null
  },
  volume: {
    label: 'Volume',
    units: ['LITRE','MILLILITRE','GALLON'],
    toBase: { LITRE:1, MILLILITRE:0.001, GALLON:3.78541 }
  }
};

let currentCat = 'length';
let currentOperation = 'convert';
let isLoggedIn = false;
let currentUser = null;

// ── Init ──
function init() {
  const token = localStorage.getItem('mx_token');
  const userRaw = localStorage.getItem('mx_user');
  isLoggedIn = !!token;
  if (userRaw) currentUser = JSON.parse(userRaw);

  const navLogin = document.getElementById('navLoginBtn');
  const navLogout = document.getElementById('navLogoutBtn');
  const userChip = document.getElementById('userChip');
  const userName = document.getElementById('userName');

  if (isLoggedIn && currentUser) {
    userChip.style.display = 'flex';
    userName.textContent = currentUser.name || currentUser.email;
    navLogout.style.display = 'block';
    navLogin.style.display = 'none';
  } else {
    navLogin.style.display = 'block';
    navLogout.style.display = 'none';
    userChip.style.display = 'none';
  }

  // URL category
  const urlCat = new URLSearchParams(location.search).get('cat');
  if (urlCat && UNITS[urlCat]) {
    const btn = document.querySelector(`[data-cat="${urlCat}"]`);
    if (btn) selectCat(urlCat, btn);
  } else {
    populateSelects('length');
    liveConvert();
  }
}

function selectOperation(op) {
  currentOperation = op;
  document.querySelectorAll('.btn-ghost').forEach(btn => btn.classList.remove('btn-accent'));
  document.getElementById(op + 'Btn').classList.add('btn-accent');
  
  // Update UI based on operation
  const converterTitle = document.getElementById('converterTitle');
  const convertInputs = document.getElementById('convertInputs');
  const convertSelects = document.getElementById('convertSelects');
  const operationInputs = document.getElementById('operationInputs');
  const operationSelects = document.getElementById('operationSelects');
  const convertBtn = document.getElementById('convertBtn');
  
  switch(op) {
    case 'convert':
      converterTitle.textContent = 'Unit Converter';
      convertInputs.style.display = 'grid';
      convertSelects.style.display = 'grid';
      operationInputs.style.display = 'none';
      operationSelects.style.display = 'none';
      convertBtn.style.display = 'block';
      break;
    case 'add':
      converterTitle.textContent = 'Unit Adder';
      convertInputs.style.display = 'none';
      convertSelects.style.display = 'none';
      operationInputs.style.display = 'grid';
      operationSelects.style.display = 'grid';
      convertBtn.style.display = 'block';
      break;
    case 'subtract':
      converterTitle.textContent = 'Unit Subtractor';
      convertInputs.style.display = 'none';
      convertSelects.style.display = 'none';
      operationInputs.style.display = 'grid';
      operationSelects.style.display = 'grid';
      convertBtn.style.display = 'block';
      break;
    case 'compare':
      converterTitle.textContent = 'Unit Comparator';
      convertInputs.style.display = 'none';
      convertSelects.style.display = 'none';
      operationInputs.style.display = 'grid';
      operationSelects.style.display = 'grid';
      convertBtn.style.display = 'block';
      break;
    case 'divide':
      converterTitle.textContent = 'Unit Divider';
      convertInputs.style.display = 'none';
      convertSelects.style.display = 'none';
      operationInputs.style.display = 'grid';
      operationSelects.style.display = 'grid';
      convertBtn.style.display = 'block';
      break;
  }
}

function logout() {
  localStorage.removeItem('mx_token');
  localStorage.removeItem('mx_user');
  localStorage.removeItem('mx_history');
  location.reload();
}

// ── Categories ──
function selectCat(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('catLabel').textContent = UNITS[cat].label;
  populateSelects(cat);
  liveConvert();
}

function populateSelects(cat) {
  const from = document.getElementById('fromUnit');
  const to = document.getElementById('toUnit');
  const from1 = document.getElementById('fromUnit1');
  const to1 = document.getElementById('fromUnit2');
  const units = UNITS[cat].units;
  
  if (from && to) {
    from.innerHTML = units.map((u,i) => `<option value="${u}">${u.replace(/([A-Z])/g,' $1').trim()}</option>`).join('');
    to.innerHTML = units.map((u,i) => `<option value="${u}" ${i===1?'selected':''}>${u.replace(/([A-Z])/g,' $1').trim()}</option>`).join('');
  }
  
  if (from1 && to1) {
    from1.innerHTML = units.map((u,i) => `<option value="${u}">${u.replace(/([A-Z])/g,' $1').trim()}</option>`).join('');
    to1.innerHTML = units.map((u,i) => `<option value="${u}" ${i===1?'selected':''}>${u.replace(/([A-Z])/g,' $1').trim()}</option>`).join('');
  }
}

function clearResult() {
  document.getElementById('resultMain').textContent = '—';
  document.getElementById('resultFormula').textContent = '';
}

// ── Conversion ──
function convertVal(val, from, to, cat) {
  console.log('Converting:', { val, from, to, cat });
  if (cat === 'temperature') {
    let c;
    if (from==='Celsius') c=val;
    else if (from==='Fahrenheit') c=(val-32)*5/9;
    else c=val-273.15;
    if (to==='Celsius') return c;
    if (to==='Fahrenheit') return c*9/5+32;
    return c+273.15;
  }
  const tb = UNITS[cat].toBase;
  if (!tb) {
    console.error('No conversion table for category:', cat);
    return val; // Return original value if no conversion table
  }
  const result = (val * tb[from]) / tb[to];
  console.log('Conversion result:', result);
  // Ensure proper precision for different unit types
  if (cat === 'length' || cat === 'weight' || cat === 'volume') {
    return parseFloat(result.toFixed(6)); // 6 decimal places for length/weight/volume
  } else if (cat === 'temperature') {
    return parseFloat(result.toFixed(2)); // 2 decimal places for temperature
  } else {
    return parseFloat(result.toPrecision(8)); // 8 significant figures for other units
  }
}

function liveConvert() {
  console.log('Live convert triggered, operation:', currentOperation);
  
  if (currentOperation === 'convert') {
    const val = parseFloat(document.getElementById('inputVal').value);
    const from = document.getElementById('fromUnit').value;
    const to = document.getElementById('toUnit').value;
    console.log('Convert inputs:', { val, from, to });
    
    if (isNaN(val)) { 
      document.getElementById('resultMain').textContent = '—'; 
      document.getElementById('resultFormula').textContent = ''; 
      return; 
    }
    
    const result = convertVal(val, from, to, currentCat);
    const pretty = parseFloat(result.toPrecision(8));
    console.log('Convert result:', pretty);
    
    document.getElementById('resultMain').textContent = pretty;
    document.getElementById('resultFormula').textContent = `${val} ${from.replace(/([A-Z])/g,' $1').trim()} = ${pretty} ${to.replace(/([A-Z])/g,' $1').trim()}`;
  } else {
    document.getElementById('resultMain').textContent = '—';
    document.getElementById('resultFormula').textContent = '';
  }
}

function swapUnits() {
  const from = document.getElementById('fromUnit');
  const to = document.getElementById('toUnit');
  const tmp = from.value;
  from.value = to.value;
  to.value = tmp;
  liveConvert();
}

function copyResult() {
  const val = document.getElementById('resultMain').textContent;
  if (val === '—') return;
  navigator.clipboard.writeText(val).then(() => showToast('Copied!'));
}

function copyOperationResult() {
  const val = document.getElementById('operationResultMain').textContent;
  if (val === '—') return;
  navigator.clipboard.writeText(val).then(() => showToast('Copied!'));
}

// ── API Operations ──

async function doConvert() {
  const val = parseFloat(document.getElementById('inputVal').value);
  const from = document.getElementById('fromUnit').value;
  const to = document.getElementById('toUnit').value;
  if (isNaN(val)) return;
  
  try {
    // Check authentication
    const token = localStorage.getItem('mx_token');
    
    if (!token) {
      showToast('Please login to perform conversions', 'error');
      return;
    }
    
    // Debug authentication
    console.log('=== CONVERT DEBUG ===');
    console.log('Raw token:', token);
    console.log('Token length:', token.length);
    
    // Try to decode JWT payload
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      console.log('JWT Payload:', payload);
      console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
      console.log('Token issuer:', payload.iss);
      console.log('Token audience:', payload.aud);
    } catch (e) {
      console.log('Could not decode JWT:', e.message);
    }
    console.log('Request body:', JSON.stringify({
      QuantityDTO: { 
        Value: val, 
        Unit: from, 
        MeasurementType: currentCat 
      },
      TargetUnit: to
    }, null, 2));
    
    // Call backend convert API - this automatically saves to history
    const response = await fetch(`${API}/v1/quantities/convert`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        QuantityDTO: { 
          Value: val, 
          Unit: from, 
          MeasurementType: currentCat 
        },
        TargetUnit: to
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      const result = data.result || data.value || val;
      const pretty = parseFloat(result.toPrecision(8));
      
      document.getElementById('resultMain').textContent = pretty;
      document.getElementById('resultFormula').textContent = `${val} ${from} = ${pretty} ${to}`;
      
      showToast(isLoggedIn ? 'Converted and saved to history!' : 'Converted!');
    } else {
      const errorData = await response.text();
      console.error('Convert error status:', response.status);
      console.error('Convert error response:', errorData);
      console.error('Response headers:', [...response.headers.entries()]);
      
      if (response.status === 401) {
        showToast('Invalid credentials. Please login again.', 'error');
        // Clear invalid token
        localStorage.removeItem('mx_token');
        localStorage.removeItem('mx_user');
        setTimeout(() => location.href = 'login.html', 2000);
      } else if (response.status === 403) {
        showToast('Access forbidden. Please check your permissions.', 'error');
        // Don't auto-logout on 403 - might be temporary issue
      } else {
        showToast(errorData || 'Convert failed', 'error');
      }
    }
  } catch (error) {
    console.error('Convert error:', error);
    showToast('Connection error', 'error');
  }
}

async function doAdd() {
  console.log('=== ADD OPERATION ===');
  const val1 = parseFloat(document.getElementById('inputVal1').value);
  const val2 = parseFloat(document.getElementById('inputVal2').value);
  const unit1 = document.getElementById('fromUnit1').value;
  const unit2 = document.getElementById('fromUnit2').value;
  console.log('Add inputs:', { val1, val2, unit1, unit2 });
  
  if (isNaN(val1) || isNaN(val2)) {
    showToast('Please enter valid numbers', 'error');
    return;
  }
  
  try {
    const requestBody = {
      ThisQuantityDTO: { Value: val1, Unit: unit1, MeasurementType: currentCat },
      ThatQuantityDTO: { Value: val2, Unit: unit2, MeasurementType: currentCat }
    };
    console.log('Add request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API}/v1/quantities/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mx_token')}` },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Add response status:', response.status);
    const responseText = await response.text();
    console.log('Add response raw:', responseText);
    
    if (response.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Add response parsed:', data);
      } catch (parseError) {
        console.error('Add JSON parse error:', parseError);
        data = { result: 'Parse Error' };
      }
      
      document.getElementById('operationResultMain').textContent = data.result || 'Success';
      showToast(isLoggedIn ? 'Added to history!' : 'Added!');
    } else {
      console.error('Add failed with status:', response.status);
      const errorData = await response.text();
      console.log('Add error response:', errorData);
      let errorMessage = 'Add operation failed';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorJson.error || 'Add operation failed';
      } catch (parseError) {
        console.error('Add JSON parse error:', parseError);
      }
      showToast(errorMessage, 'error');
    }
  } catch (error) {
    console.error('Add operation error:', error);
    showToast('Connection error', 'error');
  }
}

async function doSubtract() {
  console.log('=== SUBTRACT OPERATION ===');
  const val1 = parseFloat(document.getElementById('inputVal1').value);
  const val2 = parseFloat(document.getElementById('inputVal2').value);
  const unit1 = document.getElementById('fromUnit1').value;
  const unit2 = document.getElementById('fromUnit2').value;
  console.log('Subtract inputs:', { val1, val2, unit1, unit2 });
  
  if (isNaN(val1) || isNaN(val2)) {
    showToast('Please enter valid numbers', 'error');
    return;
  }
  
  try {
    const requestBody = {
      ThisQuantityDTO: { Value: val1, Unit: unit1, MeasurementType: currentCat },
      ThatQuantityDTO: { Value: val2, Unit: unit2, MeasurementType: currentCat }
    };
    console.log('Subtract request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API}/v1/quantities/subtract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mx_token')}` },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Subtract response status:', response.status);
    const responseText = await response.text();
    console.log('Subtract response raw:', responseText);
    
    if (response.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Subtract response parsed:', data);
      } catch (parseError) {
        console.error('Subtract JSON parse error:', parseError);
        data = { result: 'Parse Error' };
      }
      
      document.getElementById('operationResultMain').textContent = data.result || 'Success';
      showToast(isLoggedIn ? 'Subtracted!' : 'Subtracted!');
    } else {
      console.error('Subtract failed with status:', response.status);
      const errorData = await response.text();
      console.log('Subtract error response:', errorData);
      let errorMessage = 'Subtract operation failed';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorJson.error || 'Subtract operation failed';
      } catch (parseError) {
        console.error('Subtract JSON parse error:', parseError);
      }
      showToast(errorMessage, 'error');
    }
  } catch (error) {
    console.error('Subtract operation error:', error);
    showToast('Connection error', 'error');
  }
}

async function doCompare() {
  console.log('=== COMPARE OPERATION ===');
  const val1 = parseFloat(document.getElementById('inputVal1').value);
  const val2 = parseFloat(document.getElementById('inputVal2').value);
  const unit1 = document.getElementById('fromUnit1').value;
  const unit2 = document.getElementById('fromUnit2').value;
  console.log('Compare inputs:', { val1, val2, unit1, unit2 });
  
  if (isNaN(val1) || isNaN(val2)) {
    showToast('Please enter valid numbers', 'error');
    return;
  }
  
  try {
    const requestBody = {
      ThisQuantityDTO: { Value: val1, Unit: unit1, MeasurementType: currentCat },
      ThatQuantityDTO: { Value: val2, Unit: unit2, MeasurementType: currentCat }
    };
    console.log('Compare request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API}/v1/quantities/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mx_token')}` },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Compare response status:', response.status);
    const responseText = await response.text();
    console.log('Compare response raw:', responseText);
    
    if (response.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Compare response parsed:', data);
      } catch (parseError) {
        console.error('Compare JSON parse error:', parseError);
        data = { result: 'Parse Error' };
      }
      
      document.getElementById('operationResultMain').textContent = data.result || 'Success';
      showToast(isLoggedIn ? 'Compared!' : 'Compared!');
    } else {
      console.error('Compare failed with status:', response.status);
      const errorData = await response.text();
      console.log('Compare error response:', errorData);
      let errorMessage = 'Compare operation failed';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorJson.error || 'Compare operation failed';
      } catch (parseError) {
        console.error('Compare JSON parse error:', parseError);
      }
      showToast(errorMessage, 'error');
    }
  } catch (error) {
    console.error('Compare operation error:', error);
    showToast('Connection error', 'error');
  }
}

async function doDivide() {
  console.log('=== DIVIDE OPERATION ===');
  const val1 = parseFloat(document.getElementById('inputVal1').value);
  const val2 = parseFloat(document.getElementById('inputVal2').value);
  const unit1 = document.getElementById('fromUnit1').value;
  const unit2 = document.getElementById('fromUnit2').value;
  console.log('Divide inputs:', { val1, val2, unit1, unit2 });
  
  if (isNaN(val1) || isNaN(val2)) {
    showToast('Please enter valid numbers', 'error');
    return;
  }
  
  if (val2 === 0) {
    showToast('Cannot divide by zero', 'error');
    return;
  }
  
  try {
    const requestBody = {
      ThisQuantityDTO: { Value: val1, Unit: unit1, MeasurementType: currentCat },
      ThatQuantityDTO: { Value: val2, Unit: unit2, MeasurementType: currentCat }
    };
    console.log('Divide request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API}/v1/quantities/divide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('mx_token')}` },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Divide response status:', response.status);
    const responseText = await response.text();
    console.log('Divide response raw:', responseText);
    
    if (response.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Divide response parsed:', data);
      } catch (parseError) {
        console.error('Divide JSON parse error:', parseError);
        data = { result: 'Parse Error' };
      }
      
      document.getElementById('operationResultMain').textContent = data.result || 'Success';
      showToast(isLoggedIn ? '✅ Divided!' : '⚡ Divided!');
    } else {
      console.error('Divide failed with status:', response.status);
      const errorData = await response.text();
      console.log('Divide error response:', errorData);
      let errorMessage = 'Divide operation failed';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorJson.error || 'Divide operation failed';
      } catch (parseError) {
        console.error('Divide JSON parse error:', parseError);
      }
      showToast(errorMessage, 'error');
    }
  } catch (error) {
    console.error('Divide operation error:', error);
    showToast('Connection error', 'error');
  }
}




// ── API save (background) ──
async function tryApiConvert(payload) {
  const token = localStorage.getItem('mx_token');
  if (!token || token.startsWith('demo_')) return;
  try {
    const response = await fetch(`${API}/v1/quantities/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        QuantityDTO: {
          Value: payload.inputValue,
          Unit: payload.fromUnit
        },
        TargetUnit: payload.toUnit
      })
    });
    return await response.json();
  } catch { /* silent fail */ }
}


// ── Popup ──
function showLoginPopup() {
  document.getElementById('loginOverlay').classList.add('show');
}
function closePopup() {
  document.getElementById('loginOverlay').classList.remove('show');
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('loginOverlay')) closePopup();
}

// ── Toast ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
