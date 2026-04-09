package calculator

import (
	"math"
	"testing"

	pb "qrate/calc/pb"
)

const epsilon = 0.01

func almostEqual(a, b float64) bool {
	return math.Abs(a-b) < epsilon
}

func TestCalculate_FullData(t *testing.T) {
	req := &pb.CalculationRequest{
		MaterialsCost:  10000,
		EquipmentCost:  5000,
		AdditionalCost: 2000,
		OtherCost:      1000,
		Workers: []*pb.Worker{
			{Name: "Иванов И.И.", Salary: 50000, Hours: 80, FundHours: 160},
			{Name: "Петров П.П.", Salary: 40000, Hours: 40, FundHours: 160},
		},
		BonusRate:    30,
		TaxRate:      30.2,
		OverheadRate: 20,
		TravelCost:   3000,
		EstimateCost: 2000,
	}

	// labor_cost     = 50000*80/160 + 40000*40/160 = 25000 + 10000 = 35000
	// labor_w_coeff  = 35000 * (1 + (30+30.2)/100) = 35000 * 1.602 = 56070
	// subtotal       = 10000+5000+2000+1000+56070+3000+2000 = 79070
	// overhead       = 79070 * 20/100 = 15814
	// total_nic      = 79070 + 15814 = 94884
	expectedNIC := 94884.0

	nic, bd, err := Calculate(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !almostEqual(nic, expectedNIC) {
		t.Errorf("NIC = %.2f, want %.2f", nic, expectedNIC)
	}
	if !almostEqual(bd.LaborCost, 35000) {
		t.Errorf("LaborCost = %.2f, want 35000", bd.LaborCost)
	}
	if !almostEqual(bd.LaborWithCoefficients, 56070) {
		t.Errorf("LaborWithCoefficients = %.2f, want 56070", bd.LaborWithCoefficients)
	}
	if !almostEqual(bd.Subtotal, 79070) {
		t.Errorf("Subtotal = %.2f, want 79070", bd.Subtotal)
	}
	if !almostEqual(bd.OverheadAmount, 15814) {
		t.Errorf("OverheadAmount = %.2f, want 15814", bd.OverheadAmount)
	}
	if !almostEqual(bd.TotalNic, expectedNIC) {
		t.Errorf("TotalNic = %.2f, want %.2f", bd.TotalNic, expectedNIC)
	}
}

func TestCalculate_NoWorkers(t *testing.T) {
	req := &pb.CalculationRequest{
		MaterialsCost:  10000,
		EquipmentCost:  5000,
		AdditionalCost: 2000,
		OtherCost:      1000,
		Workers:        []*pb.Worker{},
		BonusRate:       30,
		TaxRate:         30.2,
		OverheadRate:    20,
		TravelCost:      3000,
		EstimateCost:    2000,
	}

	// labor = 0 → subtotal = 10000+5000+2000+1000+0+3000+2000 = 23000
	// total = 23000 * 1.2 = 27600
	expectedNIC := 27600.0

	nic, bd, err := Calculate(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !almostEqual(nic, expectedNIC) {
		t.Errorf("NIC = %.2f, want %.2f", nic, expectedNIC)
	}
	if !almostEqual(bd.LaborCost, 0) {
		t.Errorf("LaborCost = %.2f, want 0", bd.LaborCost)
	}
	if !almostEqual(bd.LaborWithCoefficients, 0) {
		t.Errorf("LaborWithCoefficients = %.2f, want 0", bd.LaborWithCoefficients)
	}
}

func TestCalculate_ZeroCoefficients(t *testing.T) {
	req := &pb.CalculationRequest{
		MaterialsCost:  10000,
		EquipmentCost:  5000,
		AdditionalCost: 2000,
		OtherCost:      1000,
		Workers: []*pb.Worker{
			{Name: "Иванов И.И.", Salary: 50000, Hours: 80, FundHours: 160},
			{Name: "Петров П.П.", Salary: 40000, Hours: 40, FundHours: 160},
		},
		BonusRate:    0,
		TaxRate:      0,
		OverheadRate: 0,
		TravelCost:   3000,
		EstimateCost: 2000,
	}

	// labor_cost     = 35000
	// labor_w_coeff  = 35000 * (1 + 0) = 35000
	// subtotal       = 10000+5000+2000+1000+35000+3000+2000 = 58000
	// overhead       = 0
	// total_nic      = 58000
	expectedNIC := 58000.0

	nic, bd, err := Calculate(req)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if !almostEqual(nic, expectedNIC) {
		t.Errorf("NIC = %.2f, want %.2f", nic, expectedNIC)
	}
	if !almostEqual(bd.LaborCost, 35000) {
		t.Errorf("LaborCost = %.2f, want 35000", bd.LaborCost)
	}
	if !almostEqual(bd.LaborWithCoefficients, 35000) {
		t.Errorf("LaborWithCoefficients = %.2f, want 35000", bd.LaborWithCoefficients)
	}
	if !almostEqual(bd.OverheadAmount, 0) {
		t.Errorf("OverheadAmount = %.2f, want 0", bd.OverheadAmount)
	}
}
