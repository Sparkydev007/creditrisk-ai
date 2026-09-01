"""
CreditRisk AI - ML Model Training Pipeline

This script trains a credit risk prediction model using synthetic data
that follows realistic financial distributions.

Models trained:
1. Logistic Regression (baseline)
2. Random Forest (primary)

Evaluation metrics:
- ROC-AUC
- Precision
- Recall
- F1-Score
- Confusion Matrix

IMPORTANT: This is a simulation system for portfolio demonstration.
The model is NOT suitable for real-world credit underwriting.
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    roc_auc_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_curve
)
import joblib
import json
import os
from datetime import datetime

def generate_synthetic_data(n_samples=10000, random_state=42):
    """
    Generate synthetic credit application data with realistic distributions.
    
    Features:
    - income: Annual income (skewed right, $20k-$300k)
    - loan_amount: Requested loan amount ($1k-$500k)
    - employment_years: Years at current job (0-30)
    - credit_utilization: Credit card utilization (0-1)
    - payment_history_score: Payment history (0-1)
    - existing_debt: Total existing debt ($0-$200k)
    - recent_inquiries: Recent credit inquiries (0-15)
    
    Target:
    - default: Whether the applicant defaulted (0/1)
    """
    np.random.seed(random_state)
    
    # Generate features with realistic distributions
    income = np.random.lognormal(mean=11.0, sigma=0.6, size=n_samples)
    income = np.clip(income, 20000, 300000)
    
    # Loan amount correlates with income
    loan_ratio = np.random.beta(2, 5, size=n_samples)
    loan_amount = income * loan_ratio * 3
    loan_amount = np.clip(loan_amount, 1000, 500000)
    
    employment_years = np.random.exponential(5, size=n_samples).astype(int)
    employment_years = np.clip(employment_years, 0, 30)
    
    credit_utilization = np.random.beta(2, 3, size=n_samples)
    
    # Payment history correlates inversely with default
    payment_history_score = np.random.beta(5, 2, size=n_samples)
    
    existing_debt = np.random.exponential(30000, size=n_samples)
    existing_debt = np.clip(existing_debt, 0, 200000)
    
    recent_inquiries = np.random.poisson(2, size=n_samples)
    recent_inquiries = np.clip(recent_inquiries, 0, 15)
    
    # Generate target based on features (realistic default probability)
    log_odds = (
        -2.0  # intercept
        + 0.8 * (existing_debt / income)  # DTI effect
        + 0.5 * (loan_amount / income)  # LTI effect
        - 0.3 * payment_history_score  # Payment history effect
        + 0.4 * credit_utilization  # Utilization effect
        - 0.1 * employment_years  # Employment stability
        + 0.15 * recent_inquiries  # Inquiries effect
    )
    
    # Convert to probability and add noise
    prob_default = 1 / (1 + np.exp(-log_odds))
    noise = np.random.normal(0, 0.1, n_samples)
    prob_default = np.clip(prob_default + noise, 0.01, 0.99)
    
    default = (np.random.random(n_samples) < prob_default).astype(int)
    
    # Create DataFrame
    df = pd.DataFrame({
        'income': income,
        'loan_amount': loan_amount,
        'employment_years': employment_years,
        'credit_utilization': credit_utilization,
        'payment_history_score': payment_history_score,
        'existing_debt': existing_debt,
        'recent_inquiries': recent_inquiries,
        'default': default
    })
    
    return df

def train_and_evaluate(X_train, X_test, y_train, y_test, model, model_name):
    """Train model and evaluate performance."""
    print(f"\n{'='*50}")
    print(f"Training: {model_name}")
    print(f"{'='*50}")
    
    # Train
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    # Evaluate
    roc_auc = roc_auc_score(y_test, y_proba)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"\nROC-AUC: {roc_auc:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1-Score: {f1:.4f}")
    print(f"\nConfusion Matrix:")
    print(cm)
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    return {
        'model': model,
        'roc_auc': roc_auc,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'confusion_matrix': cm.tolist()
    }

def main():
    print("CreditRisk AI - ML Model Training Pipeline")
    print("=" * 50)
    
    # Generate data
    print("\nGenerating synthetic credit data...")
    df = generate_synthetic_data(n_samples=15000)
    print(f"Generated {len(df)} samples")
    print(f"Default rate: {df['default'].mean():.2%}")
    
    # Prepare features
    feature_columns = ['income', 'loan_amount', 'employment_years',
                       'credit_utilization', 'payment_history_score',
                       'existing_debt', 'recent_inquiries']
    
    X = df[feature_columns]
    y = df['default']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train models
    results = {}
    
    # 1. Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42)
    results['logistic_regression'] = train_and_evaluate(
        X_train_scaled, X_test_scaled, y_train, y_test, lr, "Logistic Regression"
    )
    
    # 2. Random Forest
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    results['random_forest'] = train_and_evaluate(
        X_train_scaled, X_test_scaled, y_train, y_test, rf, "Random Forest"
    )
    
    # 3. Gradient Boosting
    gb = GradientBoostingClassifier(n_estimators=100, max_depth=5, random_state=42)
    results['gradient_boosting'] = train_and_evaluate(
        X_train_scaled, X_test_scaled, y_train, y_test, gb, "Gradient Boosting"
    )
    
    # Select best model
    best_model_name = max(results, key=lambda k: results[k]['roc_auc'])
    best_model = results[best_model_name]['model']
    best_metrics = results[best_model_name]
    
    print(f"\n{'='*50}")
    print(f"Best Model: {best_model_name}")
    print(f"ROC-AUC: {best_metrics['roc_auc']:.4f}")
    print(f"{'='*50}")
    
    # Save model and scaler
    os.makedirs(os.path.join(os.path.dirname(__file__), '..', 'models'), exist_ok=True)
    
    model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'credit_risk_model.pkl')
    scaler_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'scaler.pkl')
    
    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\nModel saved to: {model_path}")
    print(f"Scaler saved to: {scaler_path}")
    
    # Save training report
    report = {
        'timestamp': datetime.now().isoformat(),
        'dataset_size': len(df),
        'default_rate': float(df['default'].mean()),
        'best_model': best_model_name,
        'feature_columns': feature_columns,
        'models_trained': {
            name: {
                'roc_auc': metrics['roc_auc'],
                'precision': metrics['precision'],
                'recall': metrics['recall'],
                'f1': metrics['f1']
            }
            for name, metrics in results.items()
        }
    }
    
    report_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'training_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\nTraining report saved to: {report_path}")
    print("\nTraining pipeline completed successfully!")

if __name__ == "__main__":
    main()
