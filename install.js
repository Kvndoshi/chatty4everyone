const cp = require('child_process');
const result = cp.spawnSync('npm', ['install'], {
  cwd: 'C:/Users/kevin/orchids-projects/chatty4everyone',
  shell: true,
  stdio: 'inherit',
  encoding: 'utf8'
});
console.log('exit code:', result.status);
