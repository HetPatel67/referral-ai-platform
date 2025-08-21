const specialistsKey = 'specialists';

function getSpecialists() {
  return JSON.parse(localStorage.getItem(specialistsKey) || '[]');
}

function saveSpecialists(list) {
  localStorage.setItem(specialistsKey, JSON.stringify(list));
}

let currentUser = null;
const roleSelect = document.getElementById('role');
roleSelect.addEventListener('change', () => {
  document.getElementById('specialtyField').classList.toggle('hidden', roleSelect.value !== 'specialist');
});
roleSelect.dispatchEvent(new Event('change'));

document.getElementById('loginBtn').addEventListener('click', () => {
  const role = roleSelect.value;
  const name = document.getElementById('name').value.trim();
  const location = document.getElementById('location').value.trim();
  const contact = document.getElementById('contact').value.trim();
  if (!name) {
    alert('Name is required');
    return;
  }
  if (role === 'specialist') {
    const specialty = document.getElementById('specialty').value.trim();
    if (!specialty) {
      alert('Specialty is required');
      return;
    }
    const list = getSpecialists();
    let user = list.find(s => s.name === name);
    if (!user) {
      user = {
        name,
        specialty,
        location,
        contact,
        accepting: false,
        waitTimes: { urgent: 0, routine: 0, consult: 0 },
        notes: ''
      };
      list.push(user);
      saveSpecialists(list);
    }
    currentUser = user;
    document.getElementById('login').classList.add('hidden');
    document.getElementById('specialistDashboard').classList.remove('hidden');
    loadSpecialistDashboard();
  } else {
    currentUser = { name };
    document.getElementById('login').classList.add('hidden');
    document.getElementById('familyDashboard').classList.remove('hidden');
    renderSpecialistTable(getSpecialists());
  }
});

function loadSpecialistDashboard() {
  document.getElementById('accepting').checked = currentUser.accepting;
  document.getElementById('urgent').value = currentUser.waitTimes.urgent;
  document.getElementById('routine').value = currentUser.waitTimes.routine;
  document.getElementById('consult').value = currentUser.waitTimes.consult;
  document.getElementById('notes').value = currentUser.notes;
}

document.getElementById('saveSpecialist').addEventListener('click', () => {
  currentUser.accepting = document.getElementById('accepting').checked;
  currentUser.waitTimes.urgent = parseInt(document.getElementById('urgent').value) || 0;
  currentUser.waitTimes.routine = parseInt(document.getElementById('routine').value) || 0;
  currentUser.waitTimes.consult = parseInt(document.getElementById('consult').value) || 0;
  currentUser.notes = document.getElementById('notes').value;
  const list = getSpecialists().map(s => s.name === currentUser.name ? currentUser : s);
  saveSpecialists(list);
  alert('Saved!');
});

document.getElementById('applyFilters').addEventListener('click', () => {
  const specialty = document.getElementById('filterSpecialty').value.toLowerCase();
  const location = document.getElementById('filterLocation').value.toLowerCase();
  const sortBy = document.getElementById('sortBy').value;
  let list = getSpecialists().filter(s =>
    (!specialty || s.specialty.toLowerCase().includes(specialty)) &&
    (!location || s.location.toLowerCase().includes(location))
  );
  if (sortBy === 'wait') {
    list.sort((a, b) => (a.waitTimes.routine || 0) - (b.waitTimes.routine || 0));
  } else if (sortBy === 'location') {
    list.sort((a, b) => a.location.localeCompare(b.location));
  } else if (sortBy === 'specialty') {
    list.sort((a, b) => a.specialty.localeCompare(b.specialty));
  }
  renderSpecialistTable(list);
});

function renderSpecialistTable(list) {
  const tbody = document.querySelector('#specialistList tbody');
  tbody.innerHTML = '';
  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.specialty}</td>
      <td>${s.location}</td>
      <td>${s.contact}</td>
      <td>${s.waitTimes.urgent}/${s.waitTimes.routine}/${s.waitTimes.consult}</td>
      <td>${s.accepting ? 'Yes' : 'No'}</td>
      <td>${s.notes}</td>
    `;
    tbody.appendChild(tr);
  });
}
