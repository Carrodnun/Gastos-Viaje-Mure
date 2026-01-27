#!/bin/bash

echo "Initializing test data for Expense Travel App..."

# Create admin user
mongosh <<EOF
use('test_database');

// Create admin user
var adminId = 'admin_' + Date.now();
db.users.insertOne({
  user_id: adminId,
  email: 'admin@empresa.com',
  name: 'Administrador',
  picture: null,
  role: 'admin',
  created_at: new Date()
});

print('Admin user created with ID: ' + adminId);
print('Email: admin@empresa.com');

// Create approver user
var approverId = 'approver_' + Date.now();
db.users.insertOne({
  user_id: approverId,
  email: 'autorizador@empresa.com',
  name: 'Juan Autorizador',
  picture: null,
  role: 'approver',
  created_at: new Date()
});

print('Approver user created with ID: ' + approverId);
print('Email: autorizador@empresa.com');

// Create regular user
var userId = 'user_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'trabajador@empresa.com',
  name: 'María Trabajadora',
  picture: null,
  role: 'user',
  created_at: new Date()
});

print('Regular user created with ID: ' + userId);
print('Email: trabajador@empresa.com');

// Create cost centers
var centers = [
  { name: 'Ventas', code: 'CC-001' },
  { name: 'Marketing', code: 'CC-002' },
  { name: 'IT', code: 'CC-003' },
  { name: 'Administración', code: 'CC-004' },
  { name: 'Operaciones', code: 'CC-005' }
];

centers.forEach(function(center) {
  var centerId = 'center_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  db.cost_centers.insertOne({
    center_id: centerId,
    name: center.name,
    code: center.code,
    active: true,
    created_at: new Date()
  });
  print('Cost center created: ' + center.name + ' (' + center.code + ')');
});

print('\\n===================================');
print('Test data initialized successfully!');
print('===================================');
print('\\nYou can now login with:');
print('- Admin: admin@empresa.com');
print('- Approver: autorizador@empresa.com');
print('- User: trabajador@empresa.com');
print('\\nUse Microsoft OAuth to login with these emails.');
print('===================================\\n');

EOF

echo "Done!"
