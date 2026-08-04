import React, { useEffect, useState } from 'react';

function EmployeeTable(){
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ fio: '', position: '', quota: 0 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees(){
    const res = await fetch('/api/employees');
    const data = await res.json();
    setEmployees(data);
  }

  async function submit(e){
    e.preventDefault();
    if(editingId){
      await fetch('/api/employees/' + editingId, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form)
      });
      setEditingId(null);
    } else {
      await fetch('/api/employees', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form)
      });
    }
    setForm({ fio: '', position: '', quota: 0 });
    fetchEmployees();
  }

  async function remove(id){
    if(!window.confirm('Удалить сотрудника?')) return;
    await fetch('/api/employees/' + id, { method: 'DELETE' });
    fetchEmployees();
  }

  function edit(emp){
    setEditingId(emp.id);
    setForm({ fio: emp.fio, position: emp.position, quota: emp.quota });
  }

  const totalQuota = employees.reduce((s, e) => s + (Number(e.quota)||0), 0);

  return (
    <div>
      <form onSubmit={submit} style={{ marginBottom: 16 }}>
        <input placeholder="ФИО" value={form.fio} onChange={e=>setForm({...form, fio:e.target.value})} required />
        <input placeholder="Должность" value={form.position} onChange={e=>setForm({...form, position:e.target.value})} required style={{ marginLeft: 8 }} />
        <input type="number" placeholder="Квота" value={form.quota} onChange={e=>setForm({...form, quota: e.target.value})} style={{ marginLeft: 8, width: 100 }} />
        <button type="submit" style={{ marginLeft: 8 }}>{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={()=>{setEditingId(null); setForm({ fio:'', position:'', quota:0 })}} style={{ marginLeft: 8 }}>Отменить</button>}
      </form>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>ФИО</th><th>Должность</th><th>Квота</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}>
              <td>{e.fio}</td>
              <td>{e.position}</td>
              <td>{e.quota}</td>
              <td>
                <button onClick={()=>edit(e)}>Редактировать</button>
                <button onClick={()=>remove(e.id)} style={{ marginLeft: 8 }}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <strong>Суммарная квота:</strong> {totalQuota}
      </div>
    </div>
  );
}

export default EmployeeTable;
