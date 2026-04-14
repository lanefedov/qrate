FROM golang:1.24-alpine AS builder

RUN apk add --no-cache protobuf \
    && go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.11 \
    && go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1
ENV PATH="${PATH}:/go/bin"

WORKDIR /build
COPY apps/calc/go.mod apps/calc/go.sum ./
RUN go mod download

COPY apps/calc/ .
COPY proto/calculation.proto /tmp/proto/calculation.proto
RUN mkdir -p pb \
    && protoc -I /tmp/proto \
        --go_out=. --go_opt=module=qrate/calc \
        --go-grpc_out=. --go-grpc_opt=module=qrate/calc \
        /tmp/proto/calculation.proto

RUN CGO_ENABLED=0 GOOS=linux go build -o /calc ./cmd/server

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=builder /calc /usr/local/bin/calc
EXPOSE 50051
ENTRYPOINT ["calc"]
