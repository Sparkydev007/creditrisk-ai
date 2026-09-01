"""Tests for CreditRisk ML Service"""
import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from main import PredictionRequest, rule_based_prediction


class TestRuleBasedPrediction:
    """Test the rule-based fallback prediction."""

    def test_low_risk(self):
        req = PredictionRequest(
            income=120000, loan_amount=50000, employment_years=10,
            credit_utilization=0.1, payment_history_score=0.95,
            existing_debt=10000, recent_inquiries=0
        )
        pod = rule_based_prediction(req)
        assert 0.01 <= pod <= 0.95

    def test_high_risk(self):
        req = PredictionRequest(
            income=30000, loan_amount=200000, employment_years=1,
            credit_utilization=0.9, payment_history_score=0.3,
            existing_debt=80000, recent_inquiries=10
        )
        pod = rule_based_prediction(req)
        assert 0.01 <= pod <= 0.95
        assert pod > 0.1  # Should be high risk

    def test_income_factor(self):
        req_low = PredictionRequest(
            income=200000, loan_amount=50000, existing_debt=5000
        )
        req_high = PredictionRequest(
            income=30000, loan_amount=50000, existing_debt=100000
        )
        assert rule_based_prediction(req_low) < rule_based_prediction(req_high)

    def test_payment_history_factor(self):
        req_good = PredictionRequest(
            income=100000, loan_amount=50000, existing_debt=20000,
            payment_history_score=0.95, credit_utilization=0.2
        )
        req_bad = PredictionRequest(
            income=100000, loan_amount=50000, existing_debt=20000,
            payment_history_score=0.2, credit_utilization=0.2
        )
        assert rule_based_prediction(req_good) < rule_based_prediction(req_bad)

    def test_bounds(self):
        req = PredictionRequest(income=50000, loan_amount=10000, existing_debt=5000)
        pod = rule_based_prediction(req)
        assert 0.01 <= pod <= 0.95

    def test_zero_income(self):
        req = PredictionRequest(income=1, loan_amount=50000, existing_debt=10000)
        pod = rule_based_prediction(req)
        assert 0.01 <= pod <= 0.95


class TestPredictionRequest:
    """Test PredictionRequest model."""

    def test_creation(self):
        req = PredictionRequest(
            income=100000, loan_amount=50000, existing_debt=20000
        )
        assert req.income == 100000
        assert req.loan_amount == 50000
        assert req.employment_years == 5  # default
        assert req.credit_utilization == 0.3  # default
