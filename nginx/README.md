# Nginx Reverse Proxy Configuration

This directory contains the Nginx configuration for production deployments of Soroban Loyalty.

## Overview

Nginx serves as a reverse proxy in front of the backend (Node.js) and frontend (Next.js) services, providing:

- **SSL/TLS Termination** — Handles HTTPS encryption
- **Request Routing** — Routes `/api/*` to backend (port 3001) and `/*` to frontend (port 3000)
- **Gzip Compression** — Compresses responses for faster delivery
- **Rate Limiting** — Protects against abuse with per-IP request limits
- **Security Headers** — Adds HSTS, X-Frame-Options, CSP, and other security headers
- **Static Asset Caching** — Optimizes performance for static files

## Files

- `nginx.conf` — Main Nginx configuration
- `Dockerfile` — Docker image for Nginx with self-signed certificate generation

## Configuration Details

### SSL/TLS Termination

The configuration supports two modes:

**Development/Testing (Self-Signed)**
```bash
# Dockerfile generates a self-signed certificate automatically
# Valid for 365 days, suitable for testing only
```

**Production (Let's Encrypt)**
```bash
# Mount your Let's Encrypt certificates:
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
```

Then update `nginx.conf` to point to your certificates:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### Request Routing

- **`/api/*`** → Backend service on port 3001
  - Rate limit: 10 requests/second per IP
  - Burst: 20 requests
  - Timeout: 60 seconds

- **`/*`** → Frontend service on port 3000
  - Rate limit: 30 requests/second per IP
  - Burst: 50 requests
  - Timeout: 30 seconds

### Gzip Compression

Enabled for:
- Text files (HTML, CSS, JavaScript)
- JSON responses
- SVG images
- Font files

Compression level: 6 (balanced between speed and ratio)

### Security Headers

- `Strict-Transport-Security` — Forces HTTPS for 1 year
- `X-Frame-Options` — Prevents clickjacking
- `X-Content-Type-Options` — Prevents MIME sniffing
- `X-XSS-Protection` — Enables browser XSS protection
- `Referrer-Policy` — Controls referrer information

## Usage

### Development

Use the default docker-compose setup (no Nginx):
```bash
docker-compose up
```

### Production

Use the production override with Nginx:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

This will:
1. Build the Nginx image with self-signed certificate
2. Start Nginx on ports 80 (HTTP) and 443 (HTTPS)
3. Route requests to backend and frontend services
4. Apply resource limits and logging

### Certificate Renewal

For Let's Encrypt certificates, set up auto-renewal:

```bash
# Mount certbot volume for renewal
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
  - /var/www/certbot:/var/www/certbot:ro
```

Then run certbot renewal periodically:
```bash
certbot renew --webroot -w /var/www/certbot
```

## Monitoring

### Health Check

Nginx includes a health check endpoint:
```bash
curl http://localhost/health
```

### Logs

Access logs: `/var/log/nginx/access.log`
Error logs: `/var/log/nginx/error.log`

View logs in Docker:
```bash
docker-compose logs nginx
```

## Performance Tuning

### Connection Pooling

Upstream services use `keepalive 32` to maintain persistent connections.

### Buffering

- Buffer size: 4KB
- Number of buffers: 8
- Busy buffer size: 8KB

Adjust for your workload:
```nginx
proxy_buffer_size 8k;
proxy_buffers 16 8k;
proxy_busy_buffers_size 16k;
```

### Timeouts

- Connect timeout: 60s (backend), 30s (frontend)
- Send timeout: 60s (backend), 30s (frontend)
- Read timeout: 60s (backend), 30s (frontend)

Adjust for long-running requests:
```nginx
proxy_connect_timeout 120s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;
```

## Troubleshooting

### 502 Bad Gateway

Check if backend/frontend services are running:
```bash
docker-compose ps
```

### SSL Certificate Errors

Verify certificate paths in `nginx.conf`:
```bash
docker-compose exec nginx ls -la /etc/nginx/ssl/
```

### Rate Limiting Issues

Adjust limits in `nginx.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;
```

### High Memory Usage

Reduce worker connections:
```nginx
worker_connections 512;
```

## References

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
