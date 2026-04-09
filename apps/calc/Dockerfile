FROM golang:1.24-alpine AS builder

WORKDIR /build
COPY apps/calc/go.mod apps/calc/go.sum ./
RUN go mod download

COPY apps/calc/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o /calc ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=builder /calc /usr/local/bin/calc
EXPOSE 50051
ENTRYPOINT ["calc"]
