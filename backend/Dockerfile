# Build stage
FROM golang:1.23.2 AS builder
WORKDIR /app

COPY . .
RUN go mod tidy
RUN go build -o main .

ENV DB_USER=admin
ENV DB_PASSWORD=password123
ENV DB_HOST=database
ENV DB_PORT=3306
ENV DB_NAME=home_solutions

# Final stage
FROM debian:bookworm-slim
WORKDIR /home_solutions
COPY --from=builder /app/main .
CMD ["./main"]



