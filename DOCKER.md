# Docker Deployment Guide

## Quick Start

### Build the Docker image

```bash
docker build -t dashboard-frontend:latest .
```

### Run the container

```bash
docker run -d -p 5173:80 --name dashboard-frontend dashboard-frontend:latest
```

### Using Docker Compose

```bash
docker-compose up -d
```

## Configuration

### Environment Variables

Environment variables are baked into the build at compile time. Update your `.env` file before building:

```env
VITE_ADMIN_SERVICE_URL=http://your-backend:3001
VITE_DASHBOARD_BACKEND_URL=http://your-backend:3002
VITE_SELF_HEALING_SERVICE_URL=http://your-backend:5001
VITE_RECOMMEND_SERVICE_URL=http://your-backend:5002
VITE_PROMETHEUS_URL=http://localhost/prometheus
VITE_GRAFANA_URL=http://localhost/grafana
VITE_ALERTMANAGER_URL=http://localhost/alertmanager
```

### Custom Nginx Configuration

The `nginx.conf` file is included and provides:

- Gzip compression
- Security headers
- Static asset caching
- Client-side routing support
- Health check endpoint at `/health`

Modify `nginx.conf` to customize the web server behavior.

## Integration with OAuth2-Proxy

Since your frontend works with oauth2-proxy, here's the typical setup:

```
Internet → Nginx (443) → OAuth2-Proxy (4180) → Dashboard Frontend (80)
```

### Example Nginx Proxy Configuration

Your external nginx should proxy to the container:

```nginx
server {
    listen 443 ssl;
    server_name dashboard.lvh.me;

    location / {
        auth_request /oauth2/auth;
        error_page 401 = @error401;
        proxy_pass http://dashboard-frontend:80;  # Points to container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /auth/whoami {
        auth_request /oauth2/auth;
        error_page 401 = @error401;

        auth_request_set $user_id   $upstream_http_x_auth_request_user;
        auth_request_set $email     $upstream_http_x_auth_request_email;
        auth_request_set $username  $upstream_http_x_auth_request_preferred_username;
        auth_request_set $role      $upstream_http_x_auth_request_groups;

        return 200 '{
            "sub": "$user_id",
            "email": "$email",
            "preferred_username": "$username",
            "role": "$role"
        }';
        add_header Content-Type application/json;
    }

    location @error401 {
        return 302 https://auth.lvh.me/oauth2/start?rd=https://$host$request_uri;
    }

    location = /oauth2/auth {
        internal;
        set $target_oauth2 http://oauth2-proxy:4180;
        proxy_pass $target_oauth2;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
    }

    location /logout {
        return 302 https://auth.lvh.me/oauth2/sign_out?rd=/;
    }
}
```

## Development vs Production

### Development

```bash
npm run dev
```

Runs on http://localhost:5173 with hot reload.

### Production (Docker)

```bash
docker build -t dashboard-frontend .
docker run -p 5173:80 dashboard-frontend
```

Optimized build served by nginx on port 80 (mapped to 5173).

## Useful Commands

### View logs

```bash
docker logs dashboard-frontend
```

### Access container shell

```bash
docker exec -it dashboard-frontend sh
```

### Stop and remove

```bash
docker stop dashboard-frontend
docker rm dashboard-frontend
```

### Rebuild after changes

```bash
docker build --no-cache -t dashboard-frontend:latest .
```

## Health Check

The container includes a health check endpoint:

```bash
curl http://localhost:5173/health
```

## Troubleshooting

### Container won't start

- Check logs: `docker logs dashboard-frontend`
- Verify port 5173 isn't already in use
- Ensure .env file exists with required variables

### Can't connect to backend APIs

- Update API URLs in `.env` to use container names if in same Docker network
- Example: `VITE_ADMIN_SERVICE_URL=http://backend-service:3001`

### Build fails

- Run `npm install` locally first to verify dependencies
- Check Node.js version (requires Node 20+)
- Clear Docker cache: `docker builder prune`
