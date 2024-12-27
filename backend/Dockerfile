# Stage 1: Build Air binary
FROM golang:1.20 as builder
WORKDIR /tmp

# Install Air
RUN go install github.com/cosmtrek/air@v1.40.0

# Stage 2: Application
FROM golang:1.20
WORKDIR /app

# Copy Air binary from the builder
COPY --from=builder /go/bin/air /usr/local/bin/air

# Copy and install dependencies
COPY go.mod go.sum ./
RUN go mod tidy && go mod download

# Copy application files
COPY . .

# Expose the application port
EXPOSE 8080

# Run Air
CMD ["air"]

# OLD BUILD (before Air)
# Build stage
# FROM golang:1.23.2 AS builder
# WORKDIR /app

# COPY . .
# RUN go mod tidy
# RUN go build -o main .

# ENV DB_USER=admin
# ENV DB_PASSWORD=password123
# ENV DB_HOST=database
# ENV DB_PORT=3306
# ENV DB_NAME=home_solutions

# # Final stage
# FROM debian:bookworm-slim
# WORKDIR /home_solutions
# COPY --from=builder /app/main .
# CMD ["./main"]


