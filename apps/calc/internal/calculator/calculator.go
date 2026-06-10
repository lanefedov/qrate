package calculator

import (
	"fmt"

	pb "qrate/calc/pb"
)

// Calculate computes НИЦ (начальная исходная цена) based on the request parameters.
//
// НИЦ = [Зм + Зизг + Зпокуп + Зпр + Σ(ЗПi×ti/Тср)×(1+(Ксф+Кнз)/100) + Зкр + Зст] × (1 + Кпр/100)
func Calculate(req *pb.CalculationRequest) (float64, *pb.CostBreakdown, error) {
	if req == nil {
		return 0, nil, fmt.Errorf("request must not be nil")
	}

	var laborCost float64
	for i, w := range req.Workers {
		if w.FundHours == 0 {
			return 0, nil, fmt.Errorf("worker %d (%s): fund_hours must not be zero", i, w.Name)
		}
		laborCost += w.Salary * w.Hours / w.FundHours
	}

	laborWithCoeff := laborCost * (1 + (req.BonusRate+req.TaxRate)/100)

	subtotal := req.MaterialsCost +
		req.EquipmentCost +
		req.AdditionalCost +
		req.OtherCost +
		laborWithCoeff +
		req.TravelCost +
		req.EstimateCost

	overheadAmount := subtotal * req.OverheadRate / 100
	totalNic := subtotal + overheadAmount

	breakdown := &pb.CostBreakdown{
		MaterialsCost:        req.MaterialsCost,
		EquipmentCost:        req.EquipmentCost,
		AdditionalCost:       req.AdditionalCost,
		OtherCost:            req.OtherCost,
		LaborCost:            laborCost,
		LaborWithCoefficients: laborWithCoeff,
		TravelCost:           req.TravelCost,
		EstimateCost:         req.EstimateCost,
		Subtotal:             subtotal,
		OverheadAmount:       overheadAmount,
		TotalNic:             totalNic,
	}

	return totalNic, breakdown, nil
}
