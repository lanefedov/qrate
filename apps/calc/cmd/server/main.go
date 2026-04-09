package main

import (
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"syscall"

	"google.golang.org/grpc"

	calcgrpc "qrate/calc/internal/grpc"
	pb "qrate/calc/pb"
)

func main() {
	port := os.Getenv("CALC_PORT")
	if port == "" {
		port = "50051"
	}

	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", port))
	if err != nil {
		slog.Error("failed to listen", "port", port, "error", err)
		os.Exit(1)
	}

	srv := grpc.NewServer()
	pb.RegisterCalculationServiceServer(srv, calcgrpc.NewCalculationServer())

	go func() {
		sigCh := make(chan os.Signal, 1)
		signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
		sig := <-sigCh
		slog.Info("shutting down", "signal", sig)
		srv.GracefulStop()
	}()

	slog.Info("calc service starting", "port", port)
	if err := srv.Serve(lis); err != nil {
		slog.Error("server failed", "error", err)
		os.Exit(1)
	}
	slog.Info("calc service stopped")
}
