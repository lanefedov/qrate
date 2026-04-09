package grpc

import (
	"context"
	"log/slog"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"qrate/calc/internal/calculator"
	pb "qrate/calc/pb"
)

type CalculationServer struct {
	pb.UnimplementedCalculationServiceServer
}

func NewCalculationServer() *CalculationServer {
	return &CalculationServer{}
}

func (s *CalculationServer) Calculate(ctx context.Context, req *pb.CalculationRequest) (*pb.CalculationResponse, error) {
	slog.Info("calculate request received",
		"workers", len(req.GetWorkers()),
		"materials", req.GetMaterialsCost(),
		"equipment", req.GetEquipmentCost(),
	)

	nic, breakdown, err := calculator.Calculate(req)
	if err != nil {
		slog.Error("calculation failed", "error", err)
		return nil, status.Errorf(codes.InvalidArgument, "calculation error: %v", err)
	}

	slog.Info("calculation completed", "nic", nic)

	return &pb.CalculationResponse{
		Nic:       nic,
		Breakdown: breakdown,
	}, nil
}
