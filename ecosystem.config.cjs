// PM2 process definition for the ADR website.
//
//   Build once:   npm install && npm run build
//   Start:        pm2 start ecosystem.config.cjs
//   Reload:       pm2 reload adr-website
//   Logs:         pm2 logs adr-website
//   Save/boot:    pm2 save && pm2 startup
//
// adapter-node emits ./build/index.js — a self-contained Node server.
// It reads PORT / HOST from the environment (set below).
module.exports = {
	apps: [
		{
			name: 'adr-website',
			script: 'build/index.js',
			cwd: __dirname,
			instances: 1,
			exec_mode: 'fork',
			autorestart: true,
			max_memory_restart: '512M',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
				HOST: '0.0.0.0',
				// Trust the reverse proxy (nginx/caddy) in front of the app.
				ORIGIN: 'http://localhost:3000'
			}
		}
	]
};
