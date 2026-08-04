import React from 'react';
import EmployeeTable from './EmployeeTable';

function App(){
  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Квота — отдел кадров</h1>
      <EmployeeTable />
    </div>
  );
}

export default App;
