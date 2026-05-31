FROM nginx:1.27-alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create SSL directory for certificates
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed certificate for development/testing
# In production, use Let's Encrypt or your certificate provider
RUN openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Create log directory
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
