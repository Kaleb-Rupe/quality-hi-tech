const fs = require('fs');
const path = require('path');

const buildPath = path.join(__dirname, 'build');

function replaceEnvVariables(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }
    let result = data;
    const envVars = [
      'PUBLIC_URL',
      'REACT_APP_PUBLIC_URL',
      'REACT_APP_EMAILJS_SDK_URL',
      'REACT_APP_FIREBASE_API_KEY',
      'REACT_APP_FIREBASE_AUTH_DOMAIN',
      'REACT_APP_FIREBASE_DATABASE_URL',
      'REACT_APP_FIREBASE_PROJECT_ID',
      'REACT_APP_FIREBASE_STORAGE_BUCKET',
      'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
      'REACT_APP_FIREBASE_APP_ID',
      'REACT_APP_FIREBASE_MEASUREMENT_ID'
    ];

    envVars.forEach(varName => {
      const regex = new RegExp(`%${varName}%`, 'g');
      result = result.replace(regex, process.env[varName] || '');
    });

    fs.writeFile(filePath, result, 'utf8', (err) => {
      if (err) return console.log(err);
    });
  });
}

fs.readdir(buildPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  } 
  files.forEach((file) => {
    if (file.endsWith('.html') || file.endsWith('.js')) {
      replaceEnvVariables(path.join(buildPath, file));
    }
  });
});

